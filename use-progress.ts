'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {blankProgress,STORAGE_KEY,validateProgress} from '@/lib/engine';
import type {ProgressState} from '@/lib/types';
export function useProgress(){
 const [progress,setProgress]=useState<ProgressState>(blankProgress),[loaded,setLoaded]=useState(false),[warning,setWarning]=useState('');
 const current=useRef(progress);
 // Hydration synchronizes an external browser store after SSR; it is not derived render state.
 // oxlint-disable-next-line react/react-compiler
 useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const next=validateProgress(JSON.parse(raw));current.current=next;setProgress(next);}}catch{setWarning('Saved progress could not be read. Import a valid backup to recover your history. New practice will start a new history in this browser.');}setLoaded(true);},[]);
 const update=useCallback((fn:(p:ProgressState)=>ProgressState)=>{const next=fn(current.current);current.current=next;setProgress(next);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{setWarning('Your browser could not save progress. Export a backup before closing this page.');}},[]);
 return {progress,update,loaded,warning,setWarning};
}
