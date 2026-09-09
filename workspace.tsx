'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';

import {ArrowRight,ArrowUpRight,Bookmark,CheckCircle2,Clock3,Download,FileText,Library,Upload,AlertCircle} from 'lucide-react';

import ConvergenceInstrument from '@/components/convergence-instrument';

import {Progress} from '@/components/ui/progress';

import {AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';

import Reader from '@/components/reader';

import Practice,{Picker} from '@/components/practice';

import Explorers from '@/components/explorers';

import {useProgress} from '@/hooks/use-progress';

import {blankProgress,validateProgress} from '@/lib/engine';

import {readingsFor} from '@/lib/readings';

import {topics} from '@/lib/topics';

import type {Manifest,Question,Resource,TopicId} from '@/lib/types';

import questionData from '@/content/questions.json';

import bankAudit from '@/content/bank-audit.json';

const bank=questionData as Question[];

const emptyResources:Resource[]=[];

type View='overview'|'read'|'practice'|'explore'|'library'|'progress';

const navItems=[{id:'overview',label:'Study desk'},{id:'read',label:'Read'},{id:'practice',label:'Practise'},{id:'explore',label:'Explore'},{id:'library',label:'Library'},{id:'progress',label:'Progress'}] as const;

export default function CalcPath(){

 const {progress,update,loaded,warning,setWarning}=useProgress();const [manifest,setManifest]=useState<Manifest|null>(null),[loadError,setLoadError]=useState('');

 const [view,setView]=useState<View>('overview'),[topic,setTopic]=useState<TopicId>('series'),[practiceTopic,setPracticeTopic]=useState<TopicId|'all'>('all');

 const [libraryType,setLibraryType]=useState('all'),[search,setSearch]=useState(''),[resetOpen,setResetOpen]=useState(false),[fileMessage,setFileMessage]=useState('');

 const loadManifest=useCallback(()=>{fetch('/resource-manifest.json').then(r=>{if(!r.ok)throw Error('Resource index could not load.');return r.json();}).then(data=>{setManifest(data as Manifest);setLoadError('');}).catch(()=>setLoadError('The resource index could not load. Check your connection and retry.'));},[]);

 useEffect(()=>{loadManifest();},[loadManifest]);

 useEffect(()=>{const readHash=()=>{const [v,t]=window.location.hash.slice(1).split('/');if(['overview','read','practice','explore','library','progress'].includes(v))setView(v as View);if(topics.some(x=>x.id===t)){setTopic(t as TopicId);if(v==='practice')setPracticeTopic(t as TopicId);}};readHash();window.addEventListener('hashchange',readHash);return()=>window.removeEventListener('hashchange',readHash);},[]);

 const resources=manifest?.resources??emptyResources;

 const go=useCallback((v:View,t?:TopicId)=>{setView(v);if(t){setTopic(t);if(v==='practice')setPracticeTopic(t);update(p=>({...p,lastTopic:t}));}else if(v==='practice')setPracticeTopic('all');window.location.hash=v+(t?'/'+t:'');window.scrollTo({top:0,behavior:'instant'});},[update]);

 const lastTopic=topics.find(t=>t.id===progress.lastTopic)??topics[0];

 const studied=new Set(progress.attempts.filter(a=>a.mode==='practice').map(a=>a.questionId));

 const successes=progress.attempts.filter(a=>a.mode==='practice'&&a.correct&&!a.assisted&&!a.selfAssessed).length;

 const visibleResources=useMemo(()=>resources.filter(r=>(libraryType==='all'||r.kind===libraryType)&&`${r.title} ${r.instructor} ${r.year}`.toLowerCase().includes(search.toLowerCase())),[resources,libraryType,search]);

 function exportProgress(){const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`calcpath-progress-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

 async function importProgress(file:File|undefined){if(!file)return;try{if(file.size>10_000_000)throw Error('Progress files must be under 10 MB.');const next=validateProgress(JSON.parse(await file.text()),new Set(bank.map(q=>q.id)),new Map(resources.map(r=>[r.id,r.pages])));update(()=>next);setFileMessage('Progress imported. Your reading and practice history are restored.');setWarning('');}catch(e){setFileMessage(e instanceof Error?e.message:'This progress file could not be imported.');}}

 const footer=<footer className="footer"><span>Made for learning, one question at a time.</span><span>MATH U101 · 2026–27 · Independent student resource</span></footer>;

 return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="identity-bar"><a className="brand" href="#overview" onClick={()=>go('overview')} aria-label="CalcPath study desk"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6h22L16 27Z" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M10 13h12" stroke="currentColor" strokeWidth="2"/></svg>CalcPath<span className="brand-course">MATH U101</span></a><span className="device-note">Saved on this device <span className="status-dot"/></span></div><nav className="mode-nav" aria-label="Main navigation">{navItems.map(item=><a key={item.id} className={'mode-link '+(view===item.id?'active':'')} href={'#'+item.id+(item.id==='read'?'/'+topic:'')} onClick={()=>go(item.id,item.id==='read'?topic:undefined)} aria-current={view===item.id?'page':undefined}>{item.label}</a>)}<span className="semester">Pilani · 2026–27</span></nav></header><main className="main" id="main-content" tabIndex={-1}><div className="page">{warning&&<div className="notice" role="alert"><AlertCircle size={16}/>{warning}</div>}{loadError&&<div className="notice" role="alert">{loadError}<button className="btn small light" onClick={loadManifest}>Retry</button></div>}{!loaded?<div className="panel">Restoring your study progress…</div>:<>

 {view==='overview'&&<><div className="desk-heading"><div><h1>Your calculus workbench.</h1><p className="intro">A place to read, work things out, and find your next step.</p></div><a href="#progress" onClick={()=>go('progress')} className="desk-progress">{progress.completed.length} of 11 topics read<ArrowUpRight size={15}/></a></div><div className="workbench"><section className="current-lesson"><h2>{lastTopic.title}</h2><p>{lastTopic.description}</p><a className="btn" href={'#read/'+lastTopic.id} onClick={()=>go('read',lastTopic.id)}>{progress.lastResource?'Continue reading':'Open lesson'}<ArrowRight size={16}/></a><div className="lesson-detail">Topic {topics.indexOf(lastTopic)+1} of 11 · Lectures {lastTopic.lectures}<span>Thomas’ Calculus · {lastTopic.sections}</span></div></section><ConvergenceInstrument/><section className="today-practice"><h2>Today’s practice</h2><p>{progress.session?'Return to your saved session, including your answers and hints.':'Start gently, work through tutorial-level problems, then try an evaluative.'}</p><div className="session-mix">{progress.session?<span>Question {progress.session.index+1} of {progress.session.ids.length} · saved</span>:<><span>2 foundation</span><span>3 standard</span><span>1 challenge</span></>}</div><a className="btn light" href="#practice" onClick={()=>go('practice')}>{progress.session?'Resume session':'Start practice'}<ArrowRight size={16}/></a></section></div><div className="study-record"><span><strong>{studied.size}</strong> questions attempted</span><span><strong>{successes}</strong> unaided successes</span><span>Go at your pace. Reading is recommended, never a gate.</span></div><section className="course-register" aria-labelledby="course-heading"><div className="section-heading"><div><h2 id="course-heading">The course, in order.</h2><p>Choose a topic to open its slides and tutorial practice.</p></div><span>11 topics</span></div><div className="register-labels" aria-hidden="true"><span>Topic</span><span>Reading</span><span>Practice</span></div>{topics.map((t,i)=>{const count=bank.filter(q=>q.topic===t.id&&q.origin!=='evaluative').length,reading=readingsFor(t.id,resources),complete=progress.completed.includes(t.id);return <div className={'course-row '+(progress.lastTopic===t.id?'current':'')} key={t.id}><a className="course-title" href={'#read/'+t.id} onClick={()=>go('read',t.id)}><span className="topic-number">{String(i+1).padStart(2,'0')}</span><span><h3>{t.title}</h3><span className="course-description">{t.description}</span></span></a><a className="reading-status" href={'#read/'+t.id} onClick={()=>go('read',t.id)}>{complete?<><CheckCircle2 size={15}/>Read</>:reading.length?`${reading.length} slide ${reading.length===1?'deck':'decks'}`:<span className="awaiting">Slides pending</span>}</a><a className="practice-link" href={'#practice/'+t.id} onClick={()=>go('practice',t.id)}><span>{count} questions</span><ArrowUpRight size={16}/></a></div>})}</section><div className="preview-banner"><strong>Study preview.</strong> Some source downloads are incomplete, and the full tutorial bank is still being checked. <a href="#library" onClick={()=>go('library')}>See material coverage <ArrowUpRight size={13}/></a></div></>}

 {view==='read'&&<Reader key={topic} topicId={topic} resources={resources} progress={progress} update={update} onPractice={()=>go('practice',topic)}/>}

 {view==='practice'&&<Practice key={practiceTopic} bank={bank} resources={resources} progress={progress} update={update} initialTopic={practiceTopic} onRead={t=>go('read',t)} onLeave={()=>go('overview')}/>}

 {view==='explore'&&<Explorers/>}

 {view==='library'&&<><h1>The source library.</h1><p className="intro">Original course material, with its source kept intact.</p><section className="panel"><div className="row spread"><h2>Coverage audit</h2><span className="tag amber">RELEASE BLOCKED</span></div><p style={{marginTop:12}}>{resources.length} unique teaching resources · {bank.length} curated questions · {bankAudit.originalTutorial} original tutorial items · {bankAudit.variations} fresh variations. The full collection has not yet been received or reviewed.</p><div className="notice"><AlertCircle size={16}/><div>Replace the three incomplete .opdownload files with complete ZIPs or extracted folders. The student marks list is excluded from this site. Historical material outside the current syllabus stays outside recommended practice.</div></div>{manifest?.archives.map(a=><div className="resource-link" key={a.file}><span>{a.file}</span><small>{a.complete?'Complete archive':`Incomplete · ${a.readableMembers} readable files · ${a.error}`}</small></div>)}<p style={{fontSize:12}}>Double-integral and surface-integral lecture decks are not present in the recovered slide files. MATLAB videos are referenced by the handout but were not included. Older slides may contain optional examples; the reading screen marks the relevant exclusions.</p></section><div className="row spread" style={{margin:'25px 0'}}><Picker label="Resource type" value={libraryType} onChange={setLibraryType} options={[{value:'all',label:'All resources'},{value:'slides',label:'Lecture slides'},{value:'tutorial',label:'Tutorial sheets'},{value:'solution',label:'Tutorial solutions'},{value:'evaluative',label:'Past evaluatives'},{value:'handout',label:'Course handouts'},{value:'notes',label:'Notes & extras'}]}/><label><span className="sr-only">Search resource titles or instructors</span><input className="answer-input" name="resource-search" autoComplete="off" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a resource or instructor…"/></label></div><div className="library-grid">{visibleResources.map(r=><article className="panel library-card" key={r.id}><div className="row spread" style={{margin:'0 0 12px'}}><FileText size={18} color="#698999"/><span className="source-badge">{r.kind}</span></div><h3>{r.title}</h3><p style={{fontSize:12,marginTop:8}}>{r.instructor&&`${r.instructor} · `}{r.course} · {r.year}</p><p style={{fontSize:11}}>{r.pages?`${r.pages} pages`:'Image resource'} · {(r.bytes/1_000_000).toFixed(1)} MB{r.textStatus==='scan-needs-review'?' · Scanned document':''}</p><div className="row"><a href={r.url} target="_blank" rel="noreferrer" className="btn small light">Open original <ArrowUpRight size={13}/></a><a href={r.url} download className="btn small ghost" aria-label={`Download ${r.title}`}><Download size={15}/></a></div></article>)}</div>{!visibleResources.length&&<div className="panel empty"><Library/><h2>No matching resources</h2><p>Try a different title, instructor, or resource type.</p></div>}</>}

 {view==='progress'&&<><h1>Your work, over time.</h1><p className="intro">Reading, practice, and exam rehearsals each tell a different part of the story.</p><section className="panel"><h2>Practice by topic</h2><div className="progress-list" style={{marginTop:25}}>{topics.map(t=>{const qs=new Set(bank.filter(q=>q.topic===t.id).map(q=>q.id)),attempts=progress.attempts.filter(a=>qs.has(a.questionId)&&a.mode==='practice'),correct=attempts.filter(a=>a.correct&&!a.assisted&&!a.selfAssessed).length;return <div className="progress-row" key={t.id}><button style={{textAlign:'left',cursor:'pointer'}} onClick={()=>go('practice',t.id)}>{t.short}</button><Progress aria-label={`${t.short} unaided accuracy`} value={attempts.length?correct/attempts.length*100:0}/><span className="muted-text">{correct} / {attempts.length}</span></div>})}</div><p style={{fontSize:12,marginTop:22}}>Bars show unaided, automatically checked successes out of practice attempts. Self-assessed proofs and assisted answers stay in history but do not inflate this measure.</p></section><div className="hero-grid"><section className="panel"><h2>Keep a copy of your progress</h2><p style={{margin:'15px 0'}}>Progress is stored in this browser. Clearing site data removes it. To move devices, export here and import on the other device.</p><button className="btn light" onClick={exportProgress}><Download size={15}/>Export progress</button><label style={{display:'block',marginTop:22,fontSize:13,fontWeight:600}} htmlFor="progress-file"><Upload size={15} style={{display:'inline',marginRight:6}}/>Import a progress backup</label><p style={{fontSize:11}}>Import replaces this browser’s history. Export first if you want to keep both copies.</p><input id="progress-file" className="file-input" type="file" accept="application/json,.json" disabled={!manifest} onChange={e=>{void importProgress(e.target.files?.[0]);e.target.value='';}}/>{fileMessage&&<output className="notice info">{fileMessage}</output>}<button className="btn ghost small" style={{marginTop:16}} onClick={()=>setResetOpen(true)}>Reset this browser’s progress</button></section><section className="panel"><h2>Timed practice history</h2>{progress.mockHistory.length?progress.mockHistory.slice().reverse().map((m,i)=><div className="resource-link" key={i}><span>{new Date(m.at).toLocaleDateString()} · {m.correct} / {m.total}</span><small>Practice scoring · one point per item · no negative marking</small></div>):<div className="empty" style={{padding:'30px 5px'}}><Clock3/><p>No timed sets yet. Try one when you want to practise under a time limit.</p><button className="btn light" onClick={()=>go('practice')}>Open practice room <ArrowRight size={15}/></button></div>}</section></div><section className="panel" style={{marginTop:22}}><h2>Bookmarked slides</h2>{Object.entries(progress.bookmarks).some(([,pages])=>pages.length)?Object.entries(progress.bookmarks).map(([id,pages])=>{const resource=resources.find(r=>r.id===id);return resource&&pages.length?<div key={id} className="resource-link"><strong>{resource.title}</strong><div className="row" style={{marginTop:12}}>{pages.map(page=><a className="btn small light" key={page} href={`${resource.url}#page=${page}`} target="_blank" rel="noreferrer"><Bookmark size={12}/>Page {page}</a>)}</div></div>:null}):<p style={{marginTop:12}}>Use the bookmark button in the slide reader to save an important page.</p>}</section></>}

 </>}{footer}</div></main><AlertDialog open={resetOpen} onOpenChange={setResetOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset your study history?</AlertDialogTitle><AlertDialogDescription>This removes reading progress, bookmarks, attempts, and unfinished sessions from this browser. Export a backup first if you want to keep them.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep my progress</AlertDialogCancel><AlertDialogAction onClick={()=>{update(()=>blankProgress());setResetOpen(false);setWarning('');}}>Reset progress</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>

}



