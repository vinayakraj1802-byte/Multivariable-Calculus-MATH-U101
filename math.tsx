import katex from 'katex';
export function MathText({tex,display=false}:{tex:string;display?:boolean}){
 return <span className={display?'math-display':'math-inline'} dangerouslySetInnerHTML={{__html:katex.renderToString(tex,{displayMode:display,throwOnError:false,strict:'warn',trust:false,output:'htmlAndMathml'})}}/>;
}
export function RichText({text}:{text:string}){
 return <>{text.split(/(\$[^$]+\$)/g).map((s,i)=>s.startsWith('$')&&s.endsWith('$')?<MathText key={i} tex={s.slice(1,-1)}/>:<span key={i}>{s}</span>)}</>;
}
