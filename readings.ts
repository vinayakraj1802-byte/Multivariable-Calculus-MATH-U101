import type {Resource,TopicId} from './types';
export type Reading={resource:Resource;start:number;end:number;note?:string};
// Curated by document title and inspected section boundaries. Keyword hits are
// kept only in the resource audit, never treated as authoritative lesson maps.
const map:Partial<Record<TopicId,{id:string;start:number;end:number;note?:string}[]>>={
 series:[{id:'r-7d0c120807318c01',start:1,end:109},{id:'r-d1eefdbbc0cbdfd2',start:1,end:299}],
 polar:[{id:'r-c40f8e14553b25c6',start:1,end:50,note:'Older deck: graphing examples beyond a ± b sinθ or cosθ are optional. Polar arc length is excluded.'}],
 vectors:[{id:'r-1a3ee4f4831f3b4c',start:7,end:144,note:'Older deck: skip projectile motion and optional material beyond the current vector-function syllabus.'},{id:'r-fba12e08ff21688f',start:1,end:76,note:'Alternative instructor; skip projectile-motion examples.'}],
 limits:[{id:'r-679054011ff39914',start:4,end:95},{id:'r-6b56357d3ea2e64c',start:4,end:57,note:'Functions, domains, limits and continuity; section boundary awaiting full slide audit.'}],
 partials:[{id:'r-fcc0b548e16a8c63',start:1,end:82},{id:'r-6b56357d3ea2e64c',start:58,end:129,note:'Alternative instructor; start-page mapping is provisional.'}],
 gradient:[{id:'r-9abd6fe43ec144cf',start:1,end:59},{id:'r-4ad697352aa2cc6c',start:1,end:12,note:'Linearization only. Error estimation is excluded from this syllabus.'}],
 optimization:[{id:'r-4ad697352aa2cc6c',start:13,end:127}],
 triple:[{id:'r-b062cf48f9705a3a',start:1,end:104}],
 line:[{id:'r-2ad26025f1c96847',start:1,end:81},{id:'r-e4513ca62b8ac14b',start:1,end:76}],
};
export function readingsFor(topic:TopicId,resources:Resource[]):Reading[]{return (map[topic]??[]).flatMap(item=>{const resource=resources.find(r=>r.id===item.id);return resource?[{...item,resource,end:Math.min(resource.pages,item.end)}]:[];});}
export function sourceResource(source:{sheet?:number;path?:string},resources:Resource[]){return resources.find(r=>source.path?r.originalPath===source.path:r.kind==='tutorial'&&r.title===`Tutorial Sheet ${source.sheet}`);}
