/* SVG graphs need an image role for their accessible description. */
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
'use client';

import {useState} from 'react';

import {Slider} from '@/components/ui/slider';

import {MathText} from './math';



export default function ConvergenceInstrument(){

 const [terms,setTerms]=useState(5);

 const sum=1-Math.pow(.5,terms);

 return <section className="convergence-instrument" aria-label="Interactive geometric series">

  <div className="instrument-heading">Watch a sum settle.</div>

  <div className="instrument-formula"><MathText tex={String.raw`\sum_{k=1}^{n}\frac{1}{2^k}`}/><span>→ 1</span></div>

  <svg viewBox="0 0 280 150" aria-label={`The sum of ${terms} terms is ${sum.toFixed(4)}, approaching one`} role="img">

   <line x1="24" y1="28" x2="267" y2="28" stroke="#8195b2" strokeDasharray="4 5"/>

   <text x="9" y="32" fill="#50617c" fontSize="12">1</text>

   <line x1="24" y1="130" x2="267" y2="130" stroke="#bdcadd"/>

   {Array.from({length:12},(_,i)=>{const value=1-Math.pow(.5,i+1);return <g key={i}><line x1={34+i*20} x2={34+i*20} y1="130" y2={130-102*value} stroke={i<terms?'#2457d6':'#d6dfed'} strokeWidth="7"/><circle cx={34+i*20} cy={130-102*value} r="3.5" fill={i<terms?'#2457d6':'#b4c2d8'}/></g>})}

  </svg>

  <div className="instrument-output"><span>Terms <strong>{terms}</strong></span><output aria-live="polite">Sum {sum.toFixed(4)}</output></div>

  <Slider aria-label="Number of series terms" value={[terms]} min={1} max={12} step={1} onValueChange={v=>setTerms(Array.isArray(v)?v[0]:v)}/>

  <p>Add a term. How close can you get?</p>

 </section>

}

