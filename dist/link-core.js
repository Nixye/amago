/* One parser and resolver for previews, metadata, backlinks and the graph. */
(function(root){
const norm=x=>String(x||'').normalize('NFC').toLocaleLowerCase();
const decode=x=>{try{return decodeURIComponent(x)}catch{return x}};
function masked(body){return String(body||'').replace(/^ {0,3}(`{3,}|~{3,})[^\r\n]*\r?\n[\s\S]*?(?:^ {0,3}\1[^\r\n]*(?:\r?\n|$)|(?![\s\S]))/gm,m=>m.replace(/[^\n]/g,' ')).replace(/(`+)[\s\S]*?\1|<!--[\s\S]*?(?:-->|$)|%%[\s\S]*?(?:%%|$)/g,m=>' '.repeat(m.length))}
function destination(value){value=value.trim();if(value.startsWith('<'))return value.slice(1,value.indexOf('>')<0?undefined:value.indexOf('>'));return value.replace(/\s+["'][^\n]*["']\s*$/,'').replace(/\\([()\[\] ])/g,'$1').trim()}
function references(body=''){
 const text=masked(body),out=[],definitions=new Map();
 for(const m of text.matchAll(/^ {0,3}\[([^\]\n]+)\]:\s*(.+)$/gm))definitions.set(norm(m[1]),destination(m[2]));
 for(let i=0;i<text.length;i++){
  if(text[i]==='\\'){i++;continue}const start=i,embed=text[i]==='!'&&text[i+1]==='[';if(embed)i++;if(text[i]!=='[')continue;
  if(text[i+1]==='['){const end=text.indexOf(']]',i+2);if(end<0)continue;const parts=text.slice(i+2,end).split('|'),target=parts.shift().trim();out.push({start,end:end+2,target,label:parts.join('|')||target,embed,syntax:'wiki'});i=end+1;continue}
  const close=text.indexOf(']',i+1);if(close<0||text.slice(i,close).includes('\n'))continue;const label=text.slice(i+1,close);let end=close+1,target;
  if(text[end]==='('){let depth=1,j=end+1,angle=false;for(;j<text.length&&text[j]!=='\n';j++){if(text[j]==='\\'){j++;continue}if(text[j]==='<')angle=true;else if(text[j]==='>')angle=false;else if(!angle&&text[j]==='(')depth++;else if(!angle&&text[j]===')'&&!--depth)break}if(depth)continue;target=destination(text.slice(end+1,j));end=j+1}
  else if(text[end]==='['){const j=text.indexOf(']',end+1);if(j<0)continue;target=definitions.get(norm(text.slice(end+1,j)||label));end=j+1}
  else if(text[end]!==':')target=definitions.get(norm(label));
  if(target!==undefined){out.push({start,end,target,label:label||target,embed,syntax:'markdown'});i=end-1}
 }
 return out;
}
function local(target){return !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(String(target).trim())||/^file:\/\//i.test(target)}
function targetParts(raw){const value=String(raw||'').split('|')[0].trim(),hash=value.indexOf('#');return {path:decode(hash<0?value:value.slice(0,hash)).replaceAll('\\','/'),fragment:decode(hash<0?'':value.slice(hash+1))}}
function canonical(path){const result=[];for(const part of path.split('/')){if(part==='..'){if(!result.length)return null;result.pop()}else if(part&&part!=='.')result.push(part)}return result.join('/')}
function documentPath(doc){return doc?.path||[doc?.folder,(doc?.title||doc?.name||'')+'.md'].filter(Boolean).join('/')}
function resolve(docs,source,raw,options={}){
 if(!local(raw))return null;let {path:name}=targetParts(raw);const workspace=String(options.root||'').replaceAll('\\','/').replace(/\/$/,'');
 if(/^file:\/\//i.test(name)){name=name.replace(/^file:\/\/(?:localhost)?/i,'').replace(/^\/([a-z]:\/)/i,'$1');if(!workspace||!norm(name).startsWith(norm(workspace)+'/'))return null;name='/'+name.slice(workspace.length+1)}
 if(/^[a-z]:\//i.test(name))return null;if(!name)return docs.find(d=>(d.path||d.id)===(source?.path||source?.id))||null;
 const clean=x=>norm(x).replace(/\.(md|markdown)$/,'');const rootPath=canonical(name),base=documentPath(source).split('/').slice(0,-1).join('/')||'',relative=name.startsWith('/')?null:canonical((base?base+'/':'')+name);
 const candidates=[relative,rootPath].filter(x=>x!==null),exact=candidate=>docs.find(d=>norm(documentPath(d))===norm(candidate))||docs.find(d=>clean(documentPath(d))===clean(candidate));
 for(const candidate of candidates){const found=exact(candidate);if(found)return found}
 if(name.includes('/')||name.startsWith('.'))return null;
 const key=clean(name),matches=docs.filter(d=>clean(d.title||d.name||'')===key||clean(d.path?.split('/').at(-1)||'')===key);
 if(matches.length===1)return matches[0];if(matches.length>1)return null;
 const aliases=docs.filter(d=>(options.aliases?.(d)||[]).some(a=>clean(a)===key));return aliases.length===1?aliases[0]:null;
}
function connections(docs,source,metadata,options={}){const outgoing=[],missing=[],seen=new Set();for(const link of metadata(source?.body).links){const target=resolve(docs,source,link,options),id=target?.path||target?.id;if(target){if(id!==(source.path||source.id)&&!seen.has(id)){seen.add(id);outgoing.push(target)}}else missing.push(link)}const incoming=docs.filter(d=>(d.path||d.id)!==(source.path||source.id)&&metadata(d.body).links.some(link=>{const target=resolve(docs,d,link,options);return target&&(target.path||target.id)===(source.path||source.id)}));return {outgoing,incoming,missing:[...new Set(missing)]}}
root.AmagoLinks={references,masked,local,targetParts,canonical,documentPath,resolve,connections};
if(typeof module!=='undefined')module.exports=root.AmagoLinks;
})(globalThis);
