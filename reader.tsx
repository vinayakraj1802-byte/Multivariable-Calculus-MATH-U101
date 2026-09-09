'use client';

import {useState} from 'react';

import {Bookmark,Check,ChevronLeft,ChevronRight,Download,ExternalLink,FileWarning,ArrowRight} from 'lucide-react';

import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';

import {Progress} from '@/components/ui/progress';

import {Pagination,PaginationContent,PaginationItem} from '@/components/ui/pagination';

import {readingsFor} from '@/lib/readings';

import {topics} from '@/lib/topics';

import {MathText} from './math';

import type {ProgressState,Resource,TopicId} from '@/lib/types';

type Props={topicId:TopicId;resources:Resource[];progress:ProgressState;update:(fn:(p:ProgressState)=>ProgressState)=>void;onPractice:()=>void};

export default function Reader({topicId,resources,progress,update,onPractice}:Props){

 const topic=topics.find(t=>t.id===topicId)!;const readings=readingsFor(topicId,resources);

 const [selected,setSelected]=useState('');const [frameError,setFrameError]=useState(false);

 const selectedReading=readings.find(r=>r.resource.id===selected)??readings.find(r=>r.resource.id===progress.lastResource)??readings[0];

 const resource=selectedReading?.resource;

 const page=resource?Math.max(selectedReading.start,Math.min(selectedReading.end,progress.reading[resource.id]??selectedReading.start)):1;

 const bookmarked=!!resource&&!!progress.bookmarks[resource.id]?.includes(page);

 const finished=progress.completed.includes(topicId);

 function go(next:number){if(!resource)return;setFrameError(false);const n=Math.max(selectedReading.start,Math.min(selectedReading.end,next));update(p=>({...p,lastTopic:topicId,lastResource:resource.id,reading:{...p.reading,[resource.id]:n}}));}

 function bookmark(){if(!resource)return;update(p=>({...p,bookmarks:{...p.bookmarks,[resource.id]:bookmarked?(p.bookmarks[resource.id]??[]).filter(n=>n!==page):[...(p.bookmarks[resource.id]??[]),page].sort((a,b)=>a-b)}}));}

 const sheets=resources.filter(r=>r.kind==='tutorial'&&r.topics.includes(topicId));

 return <><div className="learning-header"><h1>{topic.title}</h1><p className="intro">{topic.description}</p><div className="row"><span className="tag">THOMAS’ CALCULUS · {topic.sections}</span><button className="btn small light" onClick={onPractice}>Ready to practise <ArrowRight size={14}/></button></div></div><div className="learn-layout"><div>{resource?<div className="reader"><div className="reader-toolbar"><Select value={resource.id} onValueChange={v=>{if(v){setSelected(v);setFrameError(false);}}}><SelectTrigger aria-label="Choose slide deck" className="toolbar-select"><SelectValue>{resource.instructor||resource.title}</SelectValue></SelectTrigger><SelectContent>{readings.map(r=><SelectItem key={r.resource.id} value={r.resource.id}>{r.resource.instructor||r.resource.title} · pp. {r.start}–{r.end}</SelectItem>)}</SelectContent></Select><Pagination className="!w-auto !mx-0"><PaginationContent><PaginationItem><button className="btn small light" aria-label="Previous slide" disabled={page<=selectedReading.start} onClick={()=>go(page-1)}><ChevronLeft size={16}/></button></PaginationItem><PaginationItem><label className="sr-only" htmlFor="slide-page">Slide page</label><input id="slide-page" type="number" min={selectedReading.start} max={selectedReading.end} value={page} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=selectedReading.start&&n<=selectedReading.end)go(n);}}/></PaginationItem><PaginationItem><button className="btn small light" aria-label="Next slide" disabled={page>=selectedReading.end} onClick={()=>go(page+1)}><ChevronRight size={16}/></button></PaginationItem></PaginationContent></Pagination><span className="muted-text">/ {resource.pages}</span><button className="btn small light" onClick={bookmark} aria-label={bookmarked?'Remove bookmark':'Bookmark slide'} aria-pressed={bookmarked}><Bookmark size={16} fill={bookmarked?'currentColor':'none'}/></button></div>{frameError?<div className="empty"><FileWarning/><h2>The slide preview could not load.</h2><p>Open the original PDF below to continue reading.</p></div>:<iframe key={`${resource.id}-${page}`} className="reader-frame" title={`${topic.title} · ${resource.instructor} · page ${page}`} src={`${resource.url}#page=${page}&view=FitH`} onError={()=>setFrameError(true)}/>}<div className="reader-caption"><div className="row spread"><span>Reading range: pp. {selectedReading.start}–{selectedReading.end}</span><div className="row"><a href={`${resource.url}#page=${page}`} target="_blank" rel="noreferrer" className="btn small light">Open PDF <ExternalLink size={13}/></a><a href={resource.url} download={`${resource.title}.pdf`} className="btn small light"><Download size={13}/>Download</a></div></div><p style={{marginTop:12}}>Use the page controls above to save your position. If your browser does not display PDFs inline, choose Open PDF.</p>{selectedReading.note&&<div className="notice">{selectedReading.note}</div>}<Progress aria-label="Reading position" value={100*(page-selectedReading.start+1)/(selectedReading.end-selectedReading.start+1)}/></div></div>:<div className="panel empty"><FileWarning/><h2>This slide deck is missing from the incomplete download.</h2><p>The practice questions and tutorial sheets for this topic are available below. The original slides will appear once the complete collection is imported.</p><button className="btn" onClick={onPractice}>Go to practice <ArrowRight size={16}/></button></div>}<div className="section-heading"><h2>From your tutorial sheets</h2></div>{sheets.map(s=><a key={s.id} className="resource-link" href={s.url} target="_blank" rel="noreferrer">{s.title}<small>{s.course} · {s.year} · {s.pages} {s.pages===1?'page':'pages'} · Original PDF ↗</small></a>)}{resource&&(progress.bookmarks[resource.id]??[]).length>0&&<div className="panel" style={{marginTop:18}}><h3>Your bookmarks</h3><div className="row" style={{marginTop:12}}>{progress.bookmarks[resource.id].map(n=><button key={n} className="btn small light" onClick={()=>go(n)}>Page {n}</button>)}</div></div>}</div><aside className="learning-aside"><section className="panel"><h2>Learning goals</h2><ul className="goals">{topic.goals.map(g=><li key={g}><Check size={15}/>{g}</li>)}</ul><div className="formula"><MathText tex={topic.formula}/></div><button className={'btn '+(finished?'light':'')} disabled={!resource} onClick={()=>update(p=>({...p,completed:finished?p.completed.filter(t=>t!==topicId):[...p.completed,topicId],lastTopic:topicId}))}>{finished?<><Check size={16}/>Reading complete</>:'Mark reading complete'}</button><p style={{fontSize:12,marginTop:12}}>This is your own reading checklist. You can practise whenever you feel ready.</p></section><section className="panel" style={{marginTop:18}}><h3 style={{margin:'15px 0 10px'}}>Read. Try. Reflect.</h3><p>Attempt a question on paper before using a hint. After checking the solution, note the step that made the difference.</p><button className="btn light" style={{marginTop:18}} onClick={onPractice}>Practise this topic <ArrowRight size={16}/></button></section></aside></div></>

}

