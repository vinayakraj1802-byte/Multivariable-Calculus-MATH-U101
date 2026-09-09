import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync('content/manifest.json'));
const audit=JSON.parse(readFileSync('content/bank-audit.json'));
const blockers=[...manifest.blockers];
if(!audit.complete)blockers.push('Full tutorial transcription, per-question variations, and source-page review are incomplete.');
if(!manifest.releaseReady)blockers.push('The resource coverage review has not passed.');
if(blockers.length){console.error('RELEASE BLOCKED:\n'+blockers.map(b=>' - '+b).join('\n'));process.exit(1);}
console.log('Release content gate passed.');
