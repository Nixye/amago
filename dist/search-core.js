/* Shared, dependency-free metadata and hybrid query engine. */
(function(root){
const normalize=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
function metadata(body=''){
 const front=body.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/),fields={};
 if(front){let key='';for(const line of front[1].split(/\r?\n/)){const match=line.match(/^([\w-]+):\s*(.*)$/);if(match){key=match[1].toLowerCase();fields[key]=match[2].replace(/^["']|["']$/g,'')}else if(key&&/^\s+-\s+/.test(line))fields[key]+=', '+line.replace(/^\s+-\s+/,'')}}
 const text=(front?body.slice(front[0].length):body).replace(/```[\s\S]*?(?:```|$)/g,'').replace(/`[^`]*`/g,'');
 const tags=[...(fields.tags||fields.tag||'').replace(/[\[\]"']/g,'').split(/[,\s]+/),...[...text.matchAll(/(?:^|\s)#([\p{L}\p{N}_/-]+)/gu)].map(m=>m[1])].map(t=>t.replace(/^#/,'' )).filter(Boolean);
 const wiki=[...text.matchAll(/\[\[([^\]]+)\]\]/g)].map(m=>m[1].split('|')[0].split('#')[0].trim()).filter(Boolean);
 const mentions=[...wiki,...[...text.matchAll(/(?:^|\s)@([\p{L}\p{N}_.-]+)/gu)].map(m=>m[1])];
 return {tags:[...new Set(tags)],mentions:[...new Set(mentions)],links:wiki,color:/^#[\da-f]{6}$/i.test(fields.color||'')?fields.color:null,date:fields.date||'',front:front?.[0]||''};
}
function tokens(query){return (query.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)||[]).map(raw=>{let value=raw,negative=false;if(value.startsWith('-')){negative=true;value=value.slice(1)}const match=value.match(/^(tag|tags|mention|mencao|menção|date|data|after|before|apos|antes|path|nome|name|content|conteudo|conteúdo):(.+)$/i);let field=match?normalize(match[1]):'text';value=match?match[2]:value;if(!match&&value.startsWith('#')){field='tag';value=value.slice(1)}if(!match&&value.startsWith('@')){field='mention';value=value.slice(1)}return {raw,negative,field,value:normalize(value.replace(/^['"]|['"]$/g,''))}})}
function documentData(doc){const meta=metadata(doc.body);return {...doc,...meta,tags:[...new Set([...(doc.tags||[]),...meta.tags])],date:meta.date||doc.updated||doc.created||''}}
function matches(doc,query){const d=documentData(doc),title=normalize((doc.title||doc.name||'')+' '+(doc.path||'')),body=normalize(doc.body),date=d.date.slice(0,10);return tokens(query).every(t=>{let yes;switch(t.field){case'tag':case'tags':yes=d.tags.some(x=>normalize(x)===t.value);break;case'mention':case'mencao':yes=d.mentions.some(x=>normalize(x).includes(t.value));break;case'date':case'data':yes=date.startsWith(t.value);break;case'after':case'apos':yes=!!date&&date>=t.value;break;case'before':case'antes':yes=!!date&&date<=t.value;break;case'path':case'nome':case'name':yes=title.includes(t.value);break;case'content':case'conteudo':yes=body.includes(t.value);break;default:yes=(title+' '+body).includes(t.value)}return t.negative?!yes:yes})}
function withColor(body,color){if(!/^#[\da-f]{6}$/i.test(color))throw Error('Cor inválida.');const meta=metadata(body);if(!meta.front)return `---\ncolor: "${color}"\n---\n\n${body}`;let front=meta.front;if(/^color:.*$/m.test(front))front=front.replace(/^color:.*$/m,`color: "${color}"`);else front=front.replace(/\r?\n---(\r?\n|$)$/,`\ncolor: "${color}"\n---\n`);return front+body.slice(meta.front.length)}
root.AmagoSearch={normalize,metadata,tokens,documentData,matches,withColor};
})(globalThis);
