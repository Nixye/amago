(function(root){
const normalize=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
function token(body,caret,force=false){
 const before=body.slice(0,caret),line=before.slice(before.lastIndexOf('\n')+1);
 const probe=body.slice(0,caret)+'AMAGOPROBE'+body.slice(caret);if(root.AmagoLinks.masked(probe).slice(caret,caret+10)!=='AMAGOPROBE')return null;
 let m=line.match(/\[\[([^\]\n|#]*)$/);if(m){const start=caret-m[0].length;return {kind:'page',query:m[1],start,end:body.slice(caret,caret+2)===']]'?caret+2:caret}}
 m=line.match(/(?:^|[\s([{])([@#])([\p{L}\p{N}_/.-]*)$/u);if(m){const kind=m[1]==='#'?'tag':'mention';return {kind,query:m[2],start:caret-m[2].length-1,end:caret}}
 const word=line.match(/[\p{L}\p{N}_/.-]*$/u)?.[0]||'';return force?{kind:'all',query:word,start:caret-word.length,end:caret}:null;
}
function candidates(docs){const out=[],tags=new Set(),mentions=new Set();for(const d of docs){if(d.kind&&d.kind!=='markdown')continue;const meta=root.AmagoSearch.metadata(d.body);out.push({kind:'page',label:d.title||d.name,path:root.AmagoLinks.documentPath(d),aliases:meta.aliases});for(const tag of [...(d.tags||[]),...meta.tags])tags.add(tag);for(const mention of meta.mentions)if(/^[\p{L}\p{N}_.-]+$/u.test(mention))mentions.add(mention)}for(const label of tags)out.push({kind:'tag',label});for(const label of mentions)out.push({kind:'mention',label});return out}
function suggest(items,t){const q=normalize(t.query);return items.filter(i=>(t.kind==='all'||t.kind===i.kind||t.kind==='mention'&&i.kind==='page')&&normalize([i.label,i.path,...(i.aliases||[])].join(' ')).includes(q)).sort((a,b)=>Number(normalize(b.label).startsWith(q))-Number(normalize(a.label).startsWith(q))||a.label.localeCompare(b.label)).slice(0,20)}
function insertion(item,t){return item.kind==='tag'?'#'+item.label:item.kind==='mention'?'@'+item.label:(t.kind==='mention'?'@':'')+'[[/'+item.path.split('/').map(encodeURIComponent).join('/')+'|'+item.label.replace(/[\]|\n]/g,'')+']]'}
root.AmagoCompletion={token,candidates,suggest,insertion};if(typeof module!=='undefined')module.exports=root.AmagoCompletion;
})(globalThis);
