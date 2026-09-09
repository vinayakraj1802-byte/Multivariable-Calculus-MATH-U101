"""Read supplied course files without modifying them. Recover only CRC-valid ZIP members.

Usage: python tools/import_resources.py [workspace] [site directory]
Incomplete archives always block release. Personal mark sheets are never copied.
"""
import hashlib
import io
import json
import re
import struct
import sys
import zipfile
import zlib
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]).resolve()
SITE = Path(sys.argv[2] if len(sys.argv) > 2 else ROOT / 'calcpath').resolve()
OUT = SITE / 'public' / 'resources'
AUDIT = SITE / 'content'

PATTERNS = {
 'series': r'series|sequences|convergence|maclaurin|taylor',
 'polar': r'polar coordinates|polar curves|polar equations|cardioid',
 'vectors': r'vector.valued|vector functions|curvature|arc length|unit tangent',
 'limits': r'level curves|functions? of (?:several|two|three)|limits and continuity|multivariable limit',
 'partials': r'partial derivatives?|chain rule|differentiability',
 'gradient': r'directional derivatives?|gradient|tangent planes?|linearization|total differential',
 'optimization': r'lagrange|extrema|extreme values|saddle|local maximum|absolute maximum',
 'double': r'double integrals?|iterated integrals?|fubini',
 'triple': r'triple integrals?|jacobian|cylindrical coordinates|spherical coordinates|change of variables',
 'line': r'line integrals?|green.{0,3}s theorem|conservative|potential function|path independence',
 'surface': r'surface integrals?|surface area|stokes|divergence theorem|gauss',
 'prerequisites': r'limits of functions of one variable',
 'matlab': r'matlab',
}
TUTORIAL_TOPICS = {1:['vectors'],2:['polar'],3:['limits','partials'],4:['gradient','optimization'],5:['double','triple'],6:['line'],7:['surface'],8:['series']}

def recovered_members(path):
    data = path.read_bytes(); pos = 0
    while data[pos:pos+4] == b'PK\x03\x04':
        if len(data)-pos < 30: raise ValueError('Truncated local header')
        _, ver, flags, method, mt, md, crc, cs, us, nl, el = struct.unpack_from('<I5H3I2H', data, pos)
        name = data[pos+30:pos+30+nl].decode('utf-8', 'replace')
        start = pos+30+nl+el
        if method != 8: raise ValueError('Unsupported recovery compression: '+name)
        dec = zlib.decompressobj(-15)
        raw = dec.decompress(data[start:], 150_000_000)
        if not dec.eof: raise ValueError('Incomplete member: '+name)
        end = len(data)-len(dec.unused_data)
        if flags & 8:
            off = end+4 if data[end:end+4] == b'PK\x07\x08' else end
            if len(data)-off < 12: raise ValueError('Missing checksum: '+name)
            crc, cs, us = struct.unpack_from('<III',data,off); end=off+12
        if zlib.crc32(raw) & 0xffffffff != crc or len(raw)!=us:
            raise ValueError('Checksum mismatch: '+name)
        yield name, raw
        pos=end

def main():
    OUT.mkdir(parents=True, exist_ok=True); AUDIT.mkdir(parents=True, exist_ok=True)
    resources=[]; archives=[]; excluded=[]; digests={}
    def ingest(name, raw, container=None):
        if re.search(r'marks|grade.?list|attendance|student.?list|post_compre',name,re.I):
            excluded.append({'file':name,'reason':'Contains student records; excluded before text extraction.'}); return
        if Path(name).suffix.lower() not in ['.pdf','.jpg','.jpeg','.png']: return
        digest=hashlib.sha256(raw).hexdigest()
        if digest in digests:
            digests[digest]['aliases'].append(name); return
        is_pdf=Path(name).suffix.lower()=='.pdf'
        pages=[]
        if is_pdf:
            try: pages=[p.extract_text() or '' for p in PdfReader(io.BytesIO(raw)).pages]
            except Exception:
                excluded.append({'file':name,'reason':'Unreadable PDF; needs replacement.'}); return
        # Never publish accidental student record tables, even under an innocuous filename.
        first='\n'.join(pages[:2])
        if re.search(r'ERP\s*ID|ID\s*NO\s*Name\s*Email',first,re.I):
            excluded.append({'file':name,'reason':'Student record table detected; excluded.'});return
        ident='r-'+digest[:16]; ext=Path(name).suffix.lower()
        (OUT/(ident+ext)).write_bytes(raw)
        full='\n'.join(pages)
        kind='slides' if name.startswith('Slides/') else 'evaluative' if name.startswith('Evaluatives/') or 'Tut Tests' in name else 'solution' if '/Solutions/' in name else 'tutorial' if 'Tutorial Sheet ' in name else 'handout' if 'MATH_U101' in name or 'MATH_F111_1010' in name else 'notes'
        topic_pages={}
        if kind in ['slides','notes']:
            for topic,pat in PATTERNS.items():
                hits=[i+1 for i,t in enumerate(pages) if re.search(pat,t,re.I)]
                if hits: topic_pages[topic]=hits
        match=re.search(r'Tutorial Sheet (\d)',name)
        topics=TUTORIAL_TOPICS.get(int(match[1]),[]) if match else list(topic_pages)
        year=re.search(r'(20\d{2})\s*[-–]\s*(20\d{2}|\d{2})',first)
        course='MATH U101' if 'MATH U101' in first else 'MATH F111' if re.search(r'MA\s*TH\s*F111|MATH\s*F111',first) else 'Not verified'
        instructor=next((v for k,v in {'/BD/':'Balram Dubey','/SY/':'Sangita Yadav','/GD/':'Gaurav Dwivedi','/TM/':'Trilok Mathur','/ASR/':'Anirudh S. Rana','/PHK/':'P. H. Keskar'}.items() if k in name),'')
        entry=dict(id=ident,title=Path(name).stem,originalPath=name,aliases=[],url='/resources/'+ident+ext,kind=kind,pages=len(pages),bytes=len(raw),sha256=digest,course=course,year=year[0] if year else 'Not verified',instructor=instructor,topics=topics,topicPages=topic_pages,textStatus='text' if len(full.strip())>100 else 'scan-needs-review',container=container)
        resources.append(entry);digests[digest]=entry
        # Extracted text stays out of public assets; useful for source/solution verification.
        (AUDIT/(ident+'.txt')).write_text('\n\n'.join(f'--- PAGE {i+1} ---\n{t}' for i,t in enumerate(pages)),encoding='utf-8')
    for path in ROOT.iterdir():
        if path.is_file() and (path.suffix=='.zip' or path.name.endswith('.opdownload')):
            record={'file':path.name,'complete':False,'readableMembers':0,'error':None}
            try:
                if zipfile.is_zipfile(path):
                    with zipfile.ZipFile(path) as z:
                        bad=z.testzip()
                        if bad: raise ValueError('Checksum failed: '+bad)
                        for n in z.namelist():
                            if not n.endswith('/'): ingest(n,z.read(n),path.name);record['readableMembers']+=1
                    record['complete']=True
                else:
                    for n,raw in recovered_members(path): ingest(n,raw,path.name);record['readableMembers']+=1
                    record['error']='Missing ZIP central directory.'
            except Exception as e:record['error']=str(e)
            archives.append(record)
        elif path.is_file() and path.suffix.lower()=='.pdf':ingest(path.name,path.read_bytes())
        elif path.is_dir() and path.name not in ['calcpath','tools','.git','.agents','.codex']:
            for p in path.rglob('*'):
                if p.is_file():ingest(p.relative_to(ROOT).as_posix(),p.read_bytes())
    manifest={'version':1,'syllabus':'2026–27 MATH U101','releaseReady':False,'archives':archives,'excluded':excluded,'resources':resources,'blockers':[a['file']+': '+str(a['error']) for a in archives if not a['complete']]}
    manifest['blockers'].append('Question transcription, solution verification and slide-range audit must be complete before release.')
    (AUDIT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    (SITE/'public'/'resource-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'resources':len(resources),'excluded':len(excluded),'archives':archives},indent=2))

if __name__=='__main__':main()
