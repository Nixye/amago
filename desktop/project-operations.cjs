const fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
require('../dist/link-core.js');require('../dist/search-core.js');require('../dist/refactor-core.js');
const Ops=require('../dist/project-ops-core.js'),Files=require('../dist/file-core.js');
function operations(workspace){
 const mkdir=async(relative,exclusive=false)=>{const parts=relative.split('/');for(let i=1;i<=parts.length;i++){const rel=parts.slice(0,i).join('/'),target=await workspace.resolve(rel,{missing:true});try{await fs.mkdir(target)}catch(e){if(e.code!=='EEXIST'||exclusive&&i===parts.length)throw e;if(!(await fs.stat(await workspace.resolve(rel))).isDirectory())throw Error('O caminho não é uma pasta.')}}};
 const io={root:workspace.root,
  async list(){const entries=[];let count=0;async function visit(base='',depth=0){if(depth>12)throw Error('A pasta excede 12 níveis.');const dir=base?await workspace.resolve(base):workspace.root;const children=await fs.readdir(dir,{withFileTypes:true});children.sort((a,b)=>Number(b.isDirectory())-Number(a.isDirectory())||a.name.localeCompare(b.name));for(const e of children){if(!base&&e.name.toLowerCase()==='.amago')continue;if(++count>3000)throw Error('O projeto excede 3.000 itens. Reduza o espaço para garantir a atualização dos links.');const relative=base?base+'/'+e.name:e.name;if(e.isSymbolicLink()||Files.ignored(e.name)){entries.push({path:relative,blocked:true,kind:e.isDirectory()?'directory':'file'});continue}const kind=e.isDirectory()?'directory':Files.kind(relative);entries.push({path:relative,kind});if(e.isDirectory())await visit(relative,depth+1)}}await visit();return entries},
  async read(relative){const target=await workspace.resolve(relative),stat=await fs.stat(target);if(stat.size>100*1024*1024)throw Error('Arquivo acima de 100 MB: '+relative);return new Uint8Array(await fs.readFile(target))},
  async exists(relative){try{await workspace.resolve(relative);return true}catch(e){if(e.code==='ENOENT')return false;throw e}},mkdir,
  async write(relative,bytes,exclusive){const parent=relative.split('/').slice(0,-1).join('/');if(parent)await mkdir(parent);const target=await workspace.resolve(relative,{missing:true});if(exclusive){await fs.writeFile(target,bytes,{flag:'wx'});return}const stat=await fs.stat(target),temp=path.join(path.dirname(target),'.amago-write-'+randomUUID());try{await fs.writeFile(temp,bytes,{flag:'wx',mode:stat.mode});await workspace.resolve(relative);await fs.rename(temp,target)}finally{await fs.unlink(temp).catch(()=>{})}},
  async remove(relative,directory){const target=await workspace.resolve(relative);if(directory)await fs.rm(target,{recursive:true});else await fs.unlink(target)}
 };
 const service=Ops.create(io);return {preview:args=>serialized(()=>service.preview(args)),apply:id=>serialized(()=>service.apply(id))};
 function serialized(fn){const job=workspace.queue.catch(()=>{}).then(fn);workspace.queue=job;return job}
}
module.exports={operations};
