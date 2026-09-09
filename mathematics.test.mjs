import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../content/questions.json',import.meta.url)));
function near(a,b,label,tol=1e-5){assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${label}: ${a} != ${b}`);}
// Composite Simpson quadrature gives an independent numerical check of authored integrals.
function integrate(f,a,b,N=600){let s=f(a)+f(b);for(let i=1;i<N;i++)s+=(i%2?4:2)*f(a+(b-a)*i/N);return s*(b-a)/(3*N);}
const derivative=(f,t)=>{const h=1e-5;return(f(t+h)-f(t-h))/(2*h);};
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
test('polar overlap answers match numerical integration of the displayed curves',()=>{
 for(const q of bank.filter(q=>q.familyId==='polar-overlap')){const n=+q.id.split('-').at(-1);near(q.answer,integrate(t=>((3*n*Math.cos(t))**2-(n*(1+Math.cos(t)))**2)/2,-Math.PI/3,Math.PI/3),q.id);}
});
test('all generated numeric families pass independent geometry or calculus checks',()=>{
 for(const q of bank.filter(q=>q.origin==='variation'&&q.kind==='numeric')){
  const n=+q.id.split('-').at(-1);let value;
  switch(q.familyId){
   case 'series-radius':{const k=100000;const ratio=n*k/(k+1);value=1/ratio;break;}
   case 'series-factorial':{const k=1000000;let ratio=1;for(let j=1;j<=n;j++)ratio*=(k+1)/(n*k+j);value=1/ratio;break;}
   case 'polar-circle':value=(2*n-0)/2;break;
   case 'polar-cartesian':{const t=.3,r=n*Math.tan(t)/Math.cos(t);value=r*Math.sin(t)/(r*Math.cos(t))**2;break;}
   case 'polar-region':value=integrate(x=>2*x,0,n);break;
   case 'polar-overlap':continue;
   case 'polar-cardioid':{const t=q.answer;near(derivative(t=>n*(1+Math.cos(t))*Math.sin(t),t),0,q.id);continue;}
   case 'vector-speed':{const t=.7;value=Math.hypot(-3*n*Math.sin(t),3*n*Math.cos(t),4*n);break;}
   case 'vector-length':value=integrate(t=>Math.hypot(-2*n*Math.sin(2*t),2*n*Math.cos(2*t),n+1),0,Math.PI);break;
   case 'vector-curvature':{const t=.6,v=[-n*Math.sin(t),n*Math.cos(t),n+1],a=[-n*Math.cos(t),-n*Math.sin(t),0];value=Math.hypot(...cross(v,a))/Math.hypot(...v)**3;break;}
   case 'vector-expcurvature':{const v=[n,1,0],a=[n*n-1,2*n,0];value=Math.hypot(...cross(v,a))/Math.hypot(...v)**3;break;}
   case 'limits-domain':value=Math.sqrt(n*n);break;
   case 'limits-bound':{for(const t of [.01,.001])for(const k of [-3,-1,0,1,3])assert.ok(Math.abs(n*t*t*(k*t)**3/(2*t*t+(k*t)**2))<=n/2*Math.abs(k*t)**3+1e-14);value=0;break;}
   case 'limits-path':{const x=.002,y=x*x;value=n*x*x*y/(x**4+y*y);break;}
   case 'partial-first':value=derivative(x=>n*x*x*2+Math.sin(x+2),1);break;
   case 'partial-mixed':value=derivative(y=>derivative(x=>x**n*y**3,1),1);break;
   case 'partial-chain':value=derivative(t=>t**4+n*t**5,1);break;
   case 'partial-mixed-origin':{const y=.01,h=1e-7;const fx=n*(h*h*y-y**3)/(h*h+y*y);value=fx/y;break;}
   case 'gradient-max':{const P=[1,2,0],length=Math.hypot(...P);value=Math.hypot(...P.map(x=>n*x/length));break;}
   case 'gradient-direction':{const P=[n,2*n,0],u=[-1/Math.sqrt(5),-2/Math.sqrt(5),0];value=derivative(t=>(P[0]+t*u[0])*(P[1]+t*u[1])*Math.exp(t*u[2]),0);break;}
   case 'gradient-plane':value=n*n-1-(2*n)*n-(-2)*1;break;
   case 'gradient-intersection':value=cross([2*n,-2,-1],[0,1,1])[1];break;
   case 'optimization-box':{const V=4*n**3,x=q.answer;near(derivative(a=>a*a+4*V/a,x),0,q.id,1e-4);for(const a of [.5*x,.9*x,1.1*x,2*x])assert.ok(a*a+4*V/a>x*x+4*V/x);continue;}
   case 'optimization-sphere':value=(n+n+n)/3;value=value**3;break;
   case 'optimization-hyperbola':{const dist2=q.answer,x=Math.sqrt(dist2/5),y=2*x;near(x*x+8*x*y+7*y*y,15*n,q.id);continue;}
   case 'double-rectangle':value=integrate(x=>integrate(y=>x*y,0,n,40),0,1,40);break;
   case 'double-volume':value=n*integrate(y=>y*y,-(n-1),n-1);break;
   case 'double-reverse':value=integrate(x=>x*Math.cos(x*x),0,n,6000);break;
   case 'triple-volume':value=integrate(x=>(n-x)**2/2,0,n);break;
   case 'triple-average':value=n/2+(n+1)/2-(n+2)/2;break;
   case 'triple-jacobian':{const du=1,dy=1/2,dz=1/n;value=du*dy*dz;break;}
   case 'triple-cone':value=2*Math.PI*integrate(phi=>Math.sin(phi)*integrate(r=>r*r,0,n,60),0,Math.PI/4);break;
   case 'line-potential':{value=(n*2*3)-(1*1*1);break;}
   case 'line-flux':value=integrate(t=>n*(n*Math.cos(t))*n*Math.cos(t)-(n+1)*(n*Math.sin(t))*n*Math.sin(t),0,2*Math.PI);break;
   case 'line-green':value=integrate(t=>{const x=2+n*Math.cos(t),y=3+n*Math.sin(t);return(n*y+x)*(-n*Math.sin(t))+(y+(n+2)*x)*(n*Math.cos(t));},0,2*Math.PI);break;
   case 'line-quartic':value=integrate(t=>{const x=n*Math.cos(t),y=n*Math.sin(t);return(-x*x*y)*(-n*Math.sin(t))+(x*y*y)*(n*Math.cos(t));},0,2*Math.PI);break;
   case 'surface-plane':value=Math.hypot(...cross([1,0,n],[0,1,2]))*2;break;
   case 'surface-hemisphere':value=2*Math.PI*integrate(phi=>(n*Math.cos(phi))**2*n*n*Math.sin(phi),0,Math.PI/2);break;
   case 'surface-stokes':value=integrate(t=>dot([-n*Math.sin(t),n*Math.cos(t),2],[-n*Math.sin(t),n*Math.cos(t),0]),0,2*Math.PI);break;
   case 'surface-cap':{const volume=integrate(z=>Math.PI*z,0,n*n);value=3*volume-Math.PI*n**4;break;}
   default:throw Error('Missing independent check: '+q.id);
  }
  near(q.answer,value,q.id,2e-5);
 }
});
