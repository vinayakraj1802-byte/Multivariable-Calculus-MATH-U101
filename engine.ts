import type {Attempt,Difficulty,ProgressState,Question,Session,TopicId} from './types';
export const STORAGE_KEY='calcpath.progress.v1';
export const blankProgress=():ProgressState=>({version:1,seen:[],attempts:[],reading:{},bookmarks:{},completed:[],lastTopic:'series',session:null,mockHistory:[]});
export function recommendation(attempts:Attempt[]):Difficulty|'balanced'{
 const a=attempts.filter(a=>a.mode==='practice').slice(-3);
 if(a.length>=2&&a.slice(-2).every(x=>!x.correct))return 'foundation';
 if(a.length===3&&a.every(x=>x.correct&&!x.assisted&&!x.selfAssessed))return 'evaluative';
 return 'balanced';
}
export function selectQuestions(bank:Question[],seen:string[],topic:TopicId|'all',mode:Session['mode']='practice',difficulty:Difficulty|'balanced'='balanced'):Question[]{
 const history=new Set(seen);
 const eligible=bank.filter(q=>q.eligible&&q.verified&&(topic==='all'||q.topic===topic)&&(mode==='review'?history.has(q.id):!history.has(q.id))&&(mode!=='mock'||q.origin==='evaluative'));
 const picked:Question[]=[];
 const take=(d?:Difficulty)=>{
  const candidates=eligible.filter(q=>!picked.some(p=>p.id===q.id)&&(!d||q.difficulty===d));
  // Avoid consecutive variations of the same family, then distribute across topics.
  candidates.sort((a,b)=>Number(picked.some(p=>p.familyId===a.familyId))-Number(picked.some(p=>p.familyId===b.familyId))||picked.filter(p=>p.topic===a.topic).length-picked.filter(p=>p.topic===b.topic).length||a.id.localeCompare(b.id));
  if(candidates[0])picked.push(candidates[0]);
 };
 const mix:Difficulty[]=difficulty==='foundation'?['foundation','foundation','foundation','standard','standard','evaluative']:difficulty==='evaluative'?['foundation','standard','standard','standard','evaluative','evaluative']:['foundation','foundation','standard','standard','standard','evaluative'];
 for(const d of mix)take(mode==='mock'?undefined:d);
 while(picked.length<Math.min(6,eligible.length))take();
 return picked;
}
export function createSession(ids:string[],mode:Session['mode'],now=Date.now()):Session{
 return {id:`${mode}-${now}`,mode,ids,index:0,startedAt:now,...(mode==='mock'?{deadline:now+20*60*1000}:{}),answers:{},hints:{},graded:{},revealed:{},submitted:false};
}
export function present(p:ProgressState,s:Session):ProgressState{
 const id=s.ids[s.index];return {...p,session:s,seen:id&&!p.seen.includes(id)?[...p.seen,id]:p.seen};
}
// A small arithmetic grammar: never eval/Function, never execute imported text.
export function parseNumeric(raw:string):number|null{
 const src=raw.trim().toLowerCase().replaceAll('π','pi').replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/');
 if(!src||src.length>160)return null;
 const tokens=src.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|sqrt|pi|[()+\-*/^]/g);
 if(!tokens||tokens.join('')!==src.replace(/\s+/g,''))return null;
 let i=0,depth=0;
 function primary():number{if(++depth>25)throw Error();let n:number;const t=tokens![i++];if(t==='('){n=expr();if(tokens![i++]!==')')throw Error();}else if(t==='sqrt'){if(tokens![i++]!=='(')throw Error();n=Math.sqrt(expr());if(tokens![i++]!==')')throw Error();}else if(t==='pi')n=Math.PI;else if(t&&/^(\d|\.)/.test(t))n=Number(t);else throw Error();depth--;return n;}
 function power():number{const a=primary();return tokens![i]==='^'?(i++,a**unary()):a;}
 function unary():number{if(tokens![i]==='+'){i++;return unary();}if(tokens![i]==='-'){i++;return -unary();}return power();}
 function term():number{let a=unary();while(tokens![i]==='*'||tokens![i]==='/'){const op=tokens![i++],b=unary();a=op==='*'?a*b:a/b;}return a;}
 function expr():number{let a=term();while(tokens![i]==='+'||tokens![i]==='-'){const op=tokens![i++],b=term();a=op==='+'?a+b:a-b;}return a;}
 try{const result=expr();return i===tokens.length&&Number.isFinite(result)?result:null;}catch{return null;}
}
export function checkAnswer(q:Question,input:string):boolean|null{
 if(q.kind==='self')return null;
 if(q.kind==='choice')return input===q.answer;
 const n=parseNumeric(input);if(n===null)return null;
 return Math.abs(n-Number(q.answer))<=1e-6*Math.max(1,Math.abs(Number(q.answer)));
}
export function recordAnswer(p:ProgressState,q:Question,correct:boolean,selfAssessed=false,now=Date.now()):ProgressState{
 const s=p.session;if(!s||s.submitted||s.graded[q.id]!==undefined)return p;
 const assisted=(s.hints[q.id]??0)>0||!!s.revealed[q.id];
 return {...p,attempts:[...p.attempts,{questionId:q.id,correct,assisted,selfAssessed,at:now,mode:s.mode}],session:{...s,graded:{...s.graded,[q.id]:correct}}};
}
export function finishMock(p:ProgressState,bank:Question[],now=Date.now()):ProgressState{
 const s=p.session;if(!s||s.mode!=='mock'||s.submitted)return p;
 const graded:Record<string,boolean>={};const attempts:Attempt[]=[];
 for(const id of s.ids){const q=bank.find(q=>q.id===id);if(!q)continue;const correct=checkAnswer(q,s.answers[id]??'')===true;graded[id]=correct;attempts.push({questionId:id,correct,assisted:false,selfAssessed:false,at:now,mode:'mock'});}
 return {...p,seen:[...new Set([...p.seen,...s.ids])],attempts:[...p.attempts,...attempts],session:{...s,graded,submitted:true},mockHistory:[...p.mockHistory,{at:now,total:s.ids.length,correct:Object.values(graded).filter(Boolean).length}]};
}
const topicIds=['series','polar','vectors','limits','partials','gradient','optimization','double','triple','line','surface'];
export function validateProgress(data:unknown,questionIds?:Set<string>,resourcePages?:Map<string,number>):ProgressState{
 function fail():never{throw Error('This is not a valid CalcPath progress file. Your current progress was kept.');}
 function obj(x:unknown):Record<string,unknown>{if(!x||typeof x!=='object'||Array.isArray(x))return fail();return x as Record<string,unknown>;}
 function str(x:unknown):string{if(typeof x!=='string'||x.length>10000)return fail();return x;}
 function finite(x:unknown):number{if(typeof x!=='number'||!Number.isFinite(x)||x<0)return fail();return x;}
 function bool(x:unknown):boolean{if(typeof x!=='boolean')return fail();return x;}
 function strs(x:unknown):string[]{if(!Array.isArray(x)||x.length>100000)return fail();return [...new Set(x.map(str))];}
 function qid(x:unknown):string{const s=str(x);if(questionIds&&!questionIds.has(s))return fail();return s;}
 function dict<T>(x:unknown,fn:(v:unknown,k:string)=>T):Record<string,T>{const r=obj(x),out:Record<string,T>={};for(const [k,v] of Object.entries(r)){if(['__proto__','constructor','prototype'].includes(k)||k.length>250)return fail();out[k]=fn(v,k);}return out;}
 const p=obj(data);if(p.version!==1)return fail();
 const mode=(x:unknown):Session['mode']=>{if(x!=='practice'&&x!=='review'&&x!=='mock')return fail();return x;};
 const validatePage=(v:unknown,k:string)=>{const n=finite(v);if(!Number.isInteger(n)||n<1||(resourcePages&&(!resourcePages.has(k)||n>resourcePages.get(k)!)))return fail();return n;};
 const result:ProgressState={version:1,seen:strs(p.seen).map(qid),attempts:[],reading:dict(p.reading,validatePage),bookmarks:dict(p.bookmarks,(v,k)=>{if(!Array.isArray(v))return fail();return [...new Set(v.map(n=>validatePage(n,k)))];}),completed:strs(p.completed),lastTopic:str(p.lastTopic) as TopicId,session:null,mockHistory:[]};
 if(!topicIds.includes(result.lastTopic)||result.completed.some(t=>!topicIds.includes(t)))return fail();
 if(p.lastResource!==undefined){result.lastResource=str(p.lastResource);if(resourcePages&&!resourcePages.has(result.lastResource))return fail();}
 if(!Array.isArray(p.attempts)||p.attempts.length>100000||!Array.isArray(p.mockHistory))return fail();
 result.attempts=p.attempts.map(x=>{const a=obj(x);return {questionId:qid(a.questionId),correct:bool(a.correct),assisted:bool(a.assisted),selfAssessed:bool(a.selfAssessed),at:finite(a.at),mode:mode(a.mode)};});
 result.mockHistory=p.mockHistory.map(x=>{const a=obj(x),total=finite(a.total),correct=finite(a.correct);if(correct>total||!Number.isInteger(total)||!Number.isInteger(correct))return fail();return {at:finite(a.at),total,correct};});
 if(p.session!==null){const s=obj(p.session),ids=strs(s.ids).map(qid),index=finite(s.index);if(!ids.length||ids.length>6||!Number.isInteger(index)||index>=ids.length)return fail();
 const perQ=<T>(x:unknown,fn:(v:unknown)=>T)=>dict(x,(v,k)=>{if(!ids.includes(k))return fail();return fn(v);});
 const session:Session={id:str(s.id),mode:mode(s.mode),ids,index,startedAt:finite(s.startedAt),answers:perQ(s.answers,str),hints:perQ(s.hints,v=>{const n=finite(v);if(!Number.isInteger(n)||n>10)return fail();return n;}),graded:perQ(s.graded,bool),revealed:perQ(s.revealed,bool),submitted:bool(s.submitted)};
 if(session.mode==='mock'){session.deadline=finite(s.deadline);if(session.deadline!==session.startedAt+20*60*1000)return fail();}
 result.session=session;
 }
 return result;
}
