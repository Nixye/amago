const fs=require('node:fs/promises');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
class RecentProjects {
 constructor(file){this.file=file;this.queue=Promise.resolve()}
 async list(){try{const entries=JSON.parse(await fs.readFile(this.file,'utf8'));return Array.isArray(entries)?entries.filter(e=>typeof e.id==='string'&&typeof e.path==='string'&&path.isAbsolute(e.path)&&typeof e.name==='string').slice(0,12):[]}catch(e){if(e.code==='ENOENT')return [];throw Error('Não foi possível ler os projetos recentes.')}}
 update(change){const task=this.queue.catch(()=>{}).then(async()=>{const next=change(await this.list());await fs.mkdir(path.dirname(this.file),{recursive:true});await fs.writeFile(this.file+'.tmp',JSON.stringify(next),'utf8');await fs.rename(this.file+'.tmp',this.file);return next});this.queue=task;return task}
 async remember(root){let record;await this.update(entries=>{const same=e=>process.platform==='win32'?e.path.toLowerCase()===root.toLowerCase():e.path===root;record={id:entries.find(same)?.id||randomUUID(),name:path.basename(root)||root,path:root,lastOpened:new Date().toISOString()};return [record,...entries.filter(e=>!same(e))].slice(0,12)});return record}
 async pathFor(id){if(typeof id!=='string')throw Error('Projeto inválido.');const record=(await this.list()).find(e=>e.id===id);if(!record)throw Error('Projeto não encontrado nos recentes.');return record.path}
 async forget(id){await this.update(entries=>entries.filter(e=>e.id!==id));return {removed:true}}
}
module.exports={RecentProjects};
