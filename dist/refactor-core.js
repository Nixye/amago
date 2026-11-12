/* Pure reference-preserving rename planner, shared by Windows and browser. */
(function(root){
const L=root.AmagoLinks,S=root.AmagoSearch;
const inside=(p,base)=>p===base||p.startsWith(base+'/');
const mapPath=(p,from,to)=>inside(p,from)?to+p.slice(from.length):p;
function validName(name){if(typeof name!=='string'||!name.trim()||name!==name.trim()||/[<>:"/\\|?*\x00-\x1f]/.test(name)||/[. ]$/.test(name)||/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)||name.toLowerCase().startsWith('.amago')||['.','..','.git','.obsidian','node_modules'].includes(name.toLowerCase()))throw Error('Use um nome válido, sem barras, caracteres reservados ou ponto final.');return name}
function relative(source,target){const a=source.split('/').slice(0,-1),b=target.split('/');while(a.length&&a[0]===b[0]){a.shift();b.shift()}return [...a.map(()=>'..'),...b].join('/')}
const encoded=p=>p.split('/').map(encodeURIComponent).join('/');
function plan(docs,from,to,options={}){
 const moved=docs.map(d=>({...d,path:mapPath(d.path,from,to),name:mapPath(d.path,from,to).split('/').at(-1),title:mapPath(d.path,from,to).split('/').at(-1).replace(/\.(md|markdown)$/i,'')}));
 const resolver={...options,aliases:d=>S.metadata(d.body).aliases},changes=[];
 for(let index=0;index<docs.length;index++){
  const doc=docs[index];if(doc.kind&&doc.kind!=='markdown')continue;const next=moved[index],refs=L.references(doc.body),patches=[];
  // Plain @mentions are adjusted only when they resolve to an actual document.
  for(const m of L.masked(doc.body).matchAll(/(?:^|[^\p{L}\p{N}_\\])@([\p{L}\p{N}_][\p{L}\p{N}_.-]*)/gu)){const start=m.index+m[0].indexOf('@');if(!refs.some(r=>start>=r.start&&start<r.end))refs.push({start,end:start+m[1].length+1,target:m[1],syntax:'mention',label:m[1]})}
  for(const ref of refs){const target=L.resolve(docs,doc,ref.target,resolver);if(!target)continue;const wanted=mapPath(target.path,from,to),resolved=L.resolve(moved,next,ref.target,resolver);if(resolved?.path===wanted)continue;
   const fragment=L.targetParts(ref.target).fragment,suffix=fragment?'#'+encodeURIComponent(fragment):'',path=encoded(wanted);
   let text;if(ref.syntax==='wiki'){const old=doc.body.slice(ref.start,ref.end),pipe=old.indexOf('|');text=(ref.embed?'!':'')+'[['+'/'+path+suffix+(pipe>=0?old.slice(pipe,-2):'')+']]'}
   else if(ref.syntax==='mention')text='@[[/'+path+suffix+']]';
   else {const old=doc.body.slice(ref.start,ref.end),label=old.slice(0,old.indexOf(']')+1);text=label+'(<'+encoded(relative(next.path,wanted))+suffix+'>)'}
   patches.push({...ref,text});
  }
  if(patches.length){let body=doc.body;for(const patch of patches.sort((a,b)=>b.start-a.start))body=body.slice(0,patch.start)+patch.text+body.slice(patch.end);changes.push({path:doc.path,newPath:next.path,body,before:doc.body,count:patches.length})}
 }
 return {from,to,changes,referenceCount:changes.reduce((n,c)=>n+c.count,0)};
}
root.AmagoRefactor={inside,mapPath,validName,relative,plan};if(typeof module!=='undefined')module.exports=root.AmagoRefactor;
})(globalThis);
