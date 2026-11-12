/* Shared metadata and hybrid search, compatible with Markdown vaults. */
(function(root){
const normalize=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
const unique=values=>[...new Map(values.filter(Boolean).map(value=>[normalize(value),value])).values()];
function unquote(value){value=value.trim();if(value.startsWith('"'))try{return JSON.parse(value)}catch{}return value.replace(/^['"]|['"]$/g,'')}
function list(value){if(Array.isArray(value))return value.map(String);return String(value||'').replace(/^\[|\]$/g,'').split(/,(?=(?:[^"']|"[^"]*"|'[^']*')*$)/).map(unquote).map(x=>x.trim()).filter(Boolean)}
function stripCode(body){return body.replace(/^ {0,3}(`{3,}|~{3,})[^\r\n]*\r?\n[\s\S]*?(?:^ {0,3}\1[^\r\n]*(?:\r?\n|$)|(?![\s\S]))/gm,'').replace(/(`+)[\s\S]*?\1/g,'').replace(/<!--[\s\S]*?(?:-->|$)/g,'').replace(/%%[\s\S]*?(?:%%|$)/g,'')}
function metadata(body=''){
 body=String(body||'');const front=body.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)(?:\r?\n|$)/),fields={};
 if(front){let key='';for(const line of front[1].split(/\r?\n/)){const match=line.match(/^([\w-]+):\s*(.*)$/);if(match){key=match[1].toLowerCase();fields[key]=unquote(match[2])}else if(key&&/^\s+-\s+/.test(line)){if(!Array.isArray(fields[key]))fields[key]=[];fields[key].push(unquote(line.replace(/^\s+-\s+/,'')))}}}
 const text=stripCode(front?body.slice(front[0].length):body);
 const inlineTags=[...text.matchAll(/(?:^|[^\p{L}\p{N}_/\\#])#([\p{L}\p{N}_/-]+)/gu)].map(m=>m[1]).filter(t=>/[\p{L}_/-]/u.test(t));
 const propertyTags=list(fields.tags||fields.tag).flatMap(t=>t.split(/\s+/)).map(t=>t.replace(/^#/,''));
 const references=AmagoLinks.references(body).filter(r=>AmagoLinks.local(r.target));
 const wiki=references.filter(r=>r.syntax==='wiki').map(r=>r.target).filter(Boolean);
 const localLinks=references.filter(r=>r.syntax==='markdown').map(r=>r.target).filter(Boolean);
 const at=[...text.matchAll(/(?:^|[^\p{L}\p{N}_\\])@([\p{L}\p{N}_][\p{L}\p{N}_.-]*)/gu)].map(m=>m[1].replace(/[.-]+$/,''));
 const aliases=list(fields.aliases||fields.alias);
 return {tags:unique([...propertyTags,...inlineTags]),propertyTags:unique(propertyTags),inlineTags:unique(inlineTags),mentions:unique([...wiki,...at]),links:unique([...wiki,...localLinks,...at]),aliases,properties:fields,color:/^#[\da-f]{6}$/i.test(fields.color||'')?fields.color:null,date:String(fields.date||''),front:front?.[0]||''};
}
function tokens(query){return (String(query||'').match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)||[]).map(raw=>{let value=raw,negative=false;if(value.startsWith('-')){negative=true;value=value.slice(1)}const match=value.match(/^(tag|tags|mention|mencao|menção|date|data|after|before|apos|antes|path|nome|name|content|conteudo|conteúdo):(.+)$/i);let field=match?normalize(match[1]):'text';value=match?match[2]:value;if(!match&&value.startsWith('#')){field='tag';value=value.slice(1)}if(!match&&value.startsWith('@')){field='mention';value=value.slice(1)}return {raw,negative,field,value:normalize(value.replace(/^['"]|['"]$/g,''))}})}
function documentData(doc){const meta=metadata(doc.body);return {...doc,...meta,tags:unique([...(doc.tags||[]),...meta.tags]),date:meta.date||doc.updated||doc.created||''}}
function matches(doc,query){const d=documentData(doc),title=normalize((doc.title||doc.name||'')+' '+(doc.path||'')+' '+d.aliases.join(' ')),body=normalize(doc.body),date=d.date.slice(0,10);return tokens(query).every(t=>{let yes;switch(t.field){case'tag':case'tags':yes=d.tags.some(x=>normalize(x)===t.value||normalize(x).startsWith(t.value+'/'));break;case'mention':case'mencao':yes=d.mentions.some(x=>normalize(x).includes(t.value));break;case'date':case'data':yes=date.startsWith(t.value);break;case'after':case'apos':yes=!!date&&date>=t.value;break;case'before':case'antes':yes=!!date&&date<=t.value;break;case'path':case'nome':case'name':yes=title.includes(t.value);break;case'content':case'conteudo':yes=body.includes(t.value);break;default:yes=(title+' '+body).includes(t.value)}return t.negative?!yes:yes})}
// Replace only the chosen top-level YAML blocks; leave other properties and body intact.
function withProperties(body,values){const meta=metadata(body),newline=body.includes('\r\n')?'\r\n':'\n';let lines=meta.front?meta.front.replace(/^\uFEFF?---\r?\n/,'').replace(/\r?\n(?:---|\.\.\.)(?:\r?\n|$)$/,'').split(/\r?\n/):[];
 for(const [key,value] of Object.entries(values)){if(!/^[a-z][\w-]*$/i.test(key))throw Error('Propriedade inválida.');const start=lines.findIndex(l=>new RegExp('^'+key+':','i').test(l));if(start>=0){let end=start+1;while(end<lines.length&&!/^[^\s#][^:]*:/.test(lines[end])){if(/^#/.test(lines[end]))break;end++}lines.splice(start,end-start)}if(value!==null&&value!==undefined)lines.push(key+': '+JSON.stringify(value))}
 return (body.startsWith('\uFEFF')?'\uFEFF':'')+'---'+newline+lines.join(newline)+newline+'---'+newline+(meta.front?body.slice(meta.front.length):newline+body.replace(/^\uFEFF/,''));
}
function withColor(body,color){if(!/^#[\da-f]{6}$/i.test(color))throw Error('Cor inválida.');return withProperties(body,{color})}
root.AmagoSearch={normalize,metadata,tokens,documentData,matches,withColor,withProperties};
if(typeof module!=='undefined')module.exports=root.AmagoSearch;
})(globalThis);
