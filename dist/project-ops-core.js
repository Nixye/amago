/* IO is supplied by the scoped native workspace or a user-granted directory handle. */
(function(root){
const R=root.AmagoRefactor,encode=s=>new TextEncoder().encode(s),decode=b=>new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(b);
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
function create(io){let pending=null,busy=false;
 async function snapshot(from){const entries=await io.list();if(!entries.some(e=>e.path===from))throw Error('O item não existe mais. Atualize o projeto.');if(entries.some(e=>e.blocked&&R.inside(e.path,from)))throw Error('A pasta contém itens protegidos ou links simbólicos. Gerencie esses itens no explorador do sistema.');const bytes=new Map(),docs=[];let total=0;
  for(const entry of entries){if(entry.kind==='directory'||entry.blocked)continue;const markdown=/\.(md|markdown)$/i.test(entry.path);if(!markdown&&!R.inside(entry.path,from)){docs.push({...entry,body:''});continue}const data=await io.read(entry.path);total+=data.length;if(total>100*1024*1024)throw Error('Esta operação excede 100 MB. Divida a pasta em operações menores.');bytes.set(entry.path,data);let body='';if(markdown){if(data.length>5*1024*1024)throw Error('Há um Markdown acima de 5 MB. Não é possível garantir a atualização de todos os links.');body=decode(data);if(body.includes('\0'))throw Error('Há um Markdown que não está em UTF-8. Converta-o antes de renomear.')}docs.push({...entry,kind:markdown?'markdown':entry.kind,body,title:entry.path.split('/').at(-1).replace(/\.(md|markdown)$/i,'')})}
  return {entries,bytes,docs};
 }
 async function preview({action,path,name}){if(busy)throw Error('Aguarde a operação atual.');if(!['rename','remove'].includes(action)||typeof path!=='string'||!path||path.split('/').some(p=>!p||p==='.'||p==='..'||/[\\:]/.test(p)||p.toLowerCase()==='.amago'))throw Error('Operação inválida.');const snap=await snapshot(path),entry=snap.entries.find(e=>e.path===path);let to='';if(action==='rename'){R.validName(name);to=[...path.split('/').slice(0,-1),name].join('/');if(to===path)throw Error('Escolha um nome diferente.');if(snap.entries.some(e=>e.path.toLowerCase()===to.toLowerCase()))throw Error('Esse nome já existe. Para mudar somente maiúsculas, use primeiro um nome temporário.');if(entry.kind!=='directory'&&path.includes('.')&&name.split('.').at(-1).toLowerCase()!==path.split('.').at(-1).toLowerCase())throw Error('Mantenha a extensão original do arquivo.')}
  const plan=action==='rename'?R.plan(snap.docs,path,to,{root:io.root}):{changes:[],referenceCount:0};const references=action==='remove'?snap.docs.filter(d=>!R.inside(d.path,path)&&root.AmagoSearch.metadata(d.body).links.some(link=>{const target=root.AmagoLinks.resolve(snap.docs,d,link,{root:io.root,aliases:d=>root.AmagoSearch.metadata(d.body).aliases});return target&&R.inside(target.path,path)})).map(d=>d.path):plan.changes.map(c=>c.path);
  const id=crypto.randomUUID();pending={id,action,from:path,to,entry,...snap,...plan};return {id,action,from:path,to,kind:entry.kind,files:snap.entries.filter(e=>e.kind!=='directory'&&R.inside(e.path,path)).map(e=>e.path),references,referenceCount:plan.referenceCount};
 }
 async function apply(id){if(busy||!pending||pending.id!==id)throw Error('A prévia expirou. Abra a operação novamente.');busy=true;const p=pending;pending=null;const backup='.amago/operations/'+p.id,changed=[],created=[];let backupReady=false;
  try{
   const fresh=await snapshot(p.from);if(JSON.stringify(fresh.entries)!==JSON.stringify(p.entries)||fresh.bytes.size!==p.bytes.size||[...p.bytes].some(([path,bytes])=>!same(bytes,fresh.bytes.get(path)||new Uint8Array())))throw Error('Os arquivos mudaram desde a prévia. Revise a operação novamente.');
   const affected=new Set([...p.bytes.keys()].filter(path=>R.inside(path,p.from)));for(const c of p.changes)affected.add(c.path);
   for(const path of affected){await io.write(backup+'/original/'+path,p.bytes.get(path),true);if(!same(await io.read(backup+'/original/'+path),p.bytes.get(path)))throw Error('Não foi possível verificar a cópia de segurança.')}
   for(const d of p.entries.filter(e=>e.kind==='directory'&&R.inside(e.path,p.from)))await io.mkdir(backup+'/original/'+d.path);
   await io.write(backup+'/manifest.json',encode(JSON.stringify({action:p.action,from:p.from,to:p.to,created:new Date().toISOString(),references:p.changes.map(c=>c.path)},null,2)),true);backupReady=true;
   if(p.action==='rename'){
    for(const e of p.entries.filter(e=>R.inside(e.path,p.from))){const dest=R.mapPath(e.path,p.from,p.to);if(e.kind==='directory'){await io.mkdir(dest,true);created.push({path:dest,kind:'directory'})}else{const change=p.changes.find(c=>c.path===e.path),bytes=change?encode(change.body):p.bytes.get(e.path);await io.write(dest,bytes,true);created.push({path:dest,kind:e.kind,bytes});if(!same(await io.read(dest),bytes))throw Error('A verificação do arquivo renomeado falhou.')}}
    for(const c of p.changes.filter(c=>!R.inside(c.path,p.from))){if(!same(await io.read(c.path),p.bytes.get(c.path)))throw Error('Um documento mudou durante a operação: '+c.path);const bytes=encode(c.body);changed.push({path:c.path,bytes});await io.write(c.path,bytes,false);if(!same(await io.read(c.path),bytes))throw Error('Falha ao verificar os links de '+c.path)}
   }
   // Recheck the complete source immediately before removal; never delete an unseen child.
   const last=await snapshot(p.from),oldEntries=p.entries.filter(e=>R.inside(e.path,p.from)),newEntries=last.entries.filter(e=>R.inside(e.path,p.from));if(JSON.stringify(oldEntries)!==JSON.stringify(newEntries)||[...p.bytes].some(([path,bytes])=>R.inside(path,p.from)&&!same(bytes,last.bytes.get(path)||new Uint8Array())))throw Error('A origem mudou durante a operação. Nenhum arquivo novo será removido.');
   await io.remove(p.from,p.entry.kind==='directory');return {done:true,backup,from:p.from,to:p.to,action:p.action};
  }catch(error){
   const unresolved=[];for(const c of changed.reverse()){try{if(same(await io.read(c.path),c.bytes))await io.write(c.path,p.bytes.get(c.path),false);else unresolved.push(c.path)}catch{unresolved.push(c.path)}}
   // Restore missing source files after a partial browser removal; do not overwrite external edits.
   if(backupReady){for(const e of p.entries.filter(e=>R.inside(e.path,p.from))){try{if(e.kind==='directory')await io.mkdir(e.path);else if(!await io.exists(e.path))await io.write(e.path,p.bytes.get(e.path),true)}catch{unresolved.push(e.path)}}}
   // A failed rename keeps its new copy for review; removing it could erase concurrent external changes.
   throw Error(error.message+(backupReady?' Cópia de segurança: '+backup+'.':'')+(created.length?' A cópia no novo nome foi mantida para conferência.':'')+(unresolved.length?' Confira também: '+unresolved.join(', '):''));
  }finally{busy=false}
 }
 return {preview,apply};
}
root.AmagoProjectOps={create};if(typeof module!=='undefined')module.exports=root.AmagoProjectOps;
})(globalThis);
