import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {blankProgress,checkAnswer,createSession,finishMock,parseNumeric,present,recordAnswer,recommendation,selectQuestions,validateProgress} from '../lib/engine.ts';
const bank=JSON.parse(readFileSync(new URL('../content/questions.json',import.meta.url)));
const manifest=JSON.parse(readFileSync(new URL('../content/manifest.json',import.meta.url)));
const ids=new Set(bank.map(q=>q.id));
const pages=new Map(manifest.resources.map(r=>[r.id,r.pages]));
test('fresh balanced sessions span six questions with the requested difficulty mix',()=>{
 const chosen=selectQuestions(bank,[],'all');assert.equal(chosen.length,6);
 assert.deepEqual(['foundation','standard','evaluative'].map(d=>chosen.filter(q=>q.difficulty===d).length),[2,3,1]);
 assert.equal(new Set(chosen.map(q=>q.familyId)).size,6);
});
test('every topic has foundation, standard and evaluative practice',()=>{
 for(const topic of new Set(bank.map(q=>q.topic))){const q=selectQuestions(bank,[],topic);assert.equal(q.length,6,topic);assert.deepEqual(['foundation','standard','evaluative'].map(d=>q.filter(q=>q.difficulty===d).length),[2,3,1],topic);}
});
test('bank exhaustion never silently repeats an item',()=>{
 const seen=[];for(let i=0;i<100;i++){const set=selectQuestions(bank,seen,'all');if(!set.length)break;for(const q of set){assert.ok(!seen.includes(q.id));seen.push(q.id);}}
 assert.equal(seen.length,bank.length);assert.deepEqual(selectQuestions(bank,seen,'all'),[]);
 assert.equal(selectQuestions(bank,seen,'all','review').length,6);
});
test('session, draft answer, hint, page position and bookmark survive a JSON roundtrip',()=>{
 let p=blankProgress();const chosen=selectQuestions(bank,[],'series');p=present(p,createSession(chosen.map(q=>q.id),'practice',1000));
 p.session.answers[chosen[0].id]='1/3';p.session.hints[chosen[0].id]=1;
 const r=manifest.resources.find(r=>r.pages>1);p.reading[r.id]=2;p.bookmarks[r.id]=[2];p.lastResource=r.id;
 const restored=validateProgress(JSON.parse(JSON.stringify(p)),ids,pages);assert.deepEqual(restored,p);
 assert.ok(!selectQuestions(bank,restored.seen,'series').some(q=>q.id===chosen[0].id));
});
test('invalid imports cannot inject properties or impossible page numbers',()=>{
 const p=blankProgress();assert.throws(()=>validateProgress({...p,version:9},ids,pages));
 assert.throws(()=>validateProgress({...p,lastTopic:'made-up'},ids,pages));
 assert.throws(()=>validateProgress({...p,reading:JSON.parse('{"__proto__":1}')},ids,pages));
 assert.throws(()=>validateProgress({...p,seen:['not-a-question']},ids,pages));
 const r=manifest.resources[0];assert.throws(()=>validateProgress({...p,reading:{[r.id]:r.pages+1}},ids,pages));
 assert.throws(()=>validateProgress({...p,session:{...createSession(['x'],'mock',1000),deadline:999}},ids,pages));
});
test('answer parsing accepts arithmetic and rejects executable or nonfinite input',()=>{
 assert.equal(parseNumeric('1/3'),1/3);assert.equal(parseNumeric('2*pi'),2*Math.PI);assert.equal(parseNumeric('sqrt(2)^2'),2.0000000000000004);
 assert.equal(parseNumeric('-2^2'),-4);assert.equal(parseNumeric('2^-2'),.25);assert.equal(parseNumeric('2^3^2'),512);
 for(const s of ['','NaN','Infinity','1/0','sqrt(-1)','alert(1)','globalThis','2;3','<script>','2pi','1+'])assert.equal(parseNumeric(s),null,s);
});
test('feedback records one attempt and preserves assisted status',()=>{
 const q=bank.find(q=>q.kind==='numeric');let p=present(blankProgress(),createSession([q.id],'practice'));
 p.session.hints[q.id]=1;p=recordAnswer(p,q,true);assert.equal(p.attempts.length,1);assert.equal(p.attempts[0].assisted,true);
 p=recordAnswer(p,q,false);assert.equal(p.attempts.length,1);assert.equal(p.session.graded[q.id],true);
});
test('adaptive suggestions ignore mock and self-assessed success streaks',()=>{
 const a=(correct,extra={})=>({questionId:'x',correct,assisted:false,selfAssessed:false,at:1,mode:'practice',...extra});
 assert.equal(recommendation([a(false),a(false)]),'foundation');
 assert.equal(recommendation([a(true),a(true),a(true)]),'evaluative');
 assert.equal(recommendation([a(true),a(true),a(true,{assisted:true})]),'balanced');
 assert.equal(recommendation([a(true),a(true),a(true,{selfAssessed:true})]),'balanced');
 assert.equal(recommendation([a(true,{mode:'mock'}),a(true,{mode:'mock'}),a(true,{mode:'mock'})]),'balanced');
});
test('mock selection contains only unseen verified evaluatives and grades once',()=>{
 const chosen=selectQuestions(bank,[],'all','mock');assert.equal(chosen.length,6);assert.ok(chosen.every(q=>q.origin==='evaluative'));
 let p=present(blankProgress(),createSession(chosen.map(q=>q.id),'mock',1000));
 for(const q of chosen)p.session.answers[q.id]=String(q.answer);
 p=finishMock(p,bank,10000);assert.equal(p.session.submitted,true);assert.equal(p.mockHistory[0].correct,6);assert.equal(p.attempts.filter(a=>a.mode==='mock').length,6);
 assert.deepEqual(finishMock(p,bank,20000),p);
});
test('all rendered mathematics parses and all numeric answer values are checkable',()=>{
 assert.equal(ids.size,bank.length);assert.equal(new Set(bank.map(q=>q.fingerprint)).size,bank.length);
 for(const q of bank){assert.ok(q.verified&&q.eligible,q.id);assert.ok(q.hints.length&&q.steps.length,q.id);
  for(const expr of [q.math,q.answerTex,...[...q.steps,...q.hints,...(q.options??[])].flatMap(s=>[...s.matchAll(/\$([^$]+)\$/g)].map(m=>m[1]))])assert.doesNotThrow(()=>katex.renderToString(expr,{throwOnError:true,trust:false}),q.id+': '+expr);
  if(q.kind==='numeric'){assert.ok(Number.isFinite(q.answer));assert.equal(checkAnswer(q,String(q.answer)),true,q.id);assert.equal(checkAnswer(q,String(q.answer+Math.max(1,Math.abs(q.answer)))),false,q.id);}
 }
});
test('every source reference resolves and private grade records are absent from assets',()=>{
 for(const q of bank){const r=manifest.resources.find(r=>q.source.path?r.originalPath===q.source.path:r.kind==='tutorial'&&r.title===`Tutorial Sheet ${q.source.sheet}`);assert.ok(r,q.id);assert.ok(q.source.page<=r.pages,q.id);}
 assert.ok(!manifest.resources.some(r=>/marks_total|student.?list/i.test(r.originalPath)));
 assert.equal(manifest.archives.filter(a=>!a.complete).length,3);assert.equal(manifest.releaseReady,false);
});
