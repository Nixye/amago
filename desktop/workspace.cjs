const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const MARKDOWN=/\.(md|markdown)$/i, IMAGE=/\.(png|jpe?g|gif|webp|bmp|svg)$/i;
const files=require('../dist/file-core.js');
class Workspace {
  constructor(root){this.root=root;this.queue=Promise.resolve()}
  static async open(root){const resolved=await fs.realpath(root);if(!(await fs.stat(resolved)).isDirectory())throw Error('Selecione uma pasta.');return new Workspace(resolved)}
  async resolve(relative,{missing=false}={}){
    if(typeof relative!=='string'||relative.includes('\0')||relative.includes(':')||path.isAbsolute(relative)||relative.split(/[\\/]/).some(p=>p==='..'))throw Error('Caminho inválido.');
    const target=path.resolve(this.root,relative),inside=p=>p===this.root||p.startsWith(this.root+path.sep);
    if(!inside(target))throw Error('O arquivo está fora do projeto.');
    if((await fs.lstat(this.root)).isSymbolicLink())throw Error('A pasta original foi substituída por um link.');let cursor=this.root;const segments=path.relative(this.root,target).split(path.sep).filter(Boolean);
    for(let i=0;i<segments.length;i++){cursor=path.join(cursor,segments[i]);let stat;try{stat=await fs.lstat(cursor)}catch(e){if(missing&&i===segments.length-1&&e.code==='ENOENT')return target;throw e}if(stat.isSymbolicLink())throw Error('Links simbólicos não são acessados pelo projeto.')}
    if(!inside(await fs.realpath(target)))throw Error('O arquivo está fora do projeto.');return target;
  }
  async tree(){let count=0,truncated=false,warnings=0;
    const visit=async(dir,relative='',depth=0)=>{if(depth>12){truncated=true;return []}let entries;try{entries=await fs.readdir(dir,{withFileTypes:true})}catch{warnings++;return []}entries.sort((a,b)=>Number(b.isDirectory())-Number(a.isDirectory())||a.name.localeCompare(b.name));const result=[];
      for(const entry of entries){if(count>=3000){truncated=true;break}if(entry.isSymbolicLink()||files.ignored(entry.name))continue;count++;const rel=relative?relative+'/'+entry.name:entry.name;
        if(entry.isDirectory())result.push({name:entry.name,path:rel,kind:'directory',children:await visit(path.join(dir,entry.name),rel,depth+1)});
        else if(entry.isFile()){const stat=await fs.stat(path.join(dir,entry.name)).catch(()=>null);result.push({updated:stat?.mtime.toISOString(),created:stat?.birthtime.toISOString(),name:entry.name,path:rel,kind:files.kind(entry.name)})};
      }return result;
    };return {name:path.basename(this.root)||this.root,root:this.root,entries:await visit(this.root),truncated,warnings};
  }
  async read(relative){const file=await this.resolve(relative);if(!files.editable(file))throw Error('Este formato ainda não é suportado para edição.');const stat=await fs.stat(file);if(!stat.isFile()||stat.size>5*1024*1024)throw Error('O limite para edição é 5 MB por arquivo.');const data=await fs.readFile(file);if(data.includes(0))throw Error('Arquivo binário ou UTF-16. Converta para UTF-8 antes de editar.');let body;try{body=new TextDecoder('utf-8',{fatal:true}).decode(data)}catch{throw Error('Converta este arquivo para UTF-8.')}return {body,version:hash(data),size:data.length}}
  async image(relative){const file=await this.resolve(relative);if(files.kind(file)!=='image')throw Error('Imagem não suportada.');const stat=await fs.stat(file);if(stat.size>25*1024*1024)throw Error('O limite de prévia é 25 MB.');const bytes=await fs.readFile(file),ext=path.extname(file).slice(1).toLowerCase();return {url:`data:image/${ext==='svg'?'svg+xml':ext==='jpg'?'jpeg':ext};base64,${bytes.toString('base64')}`,size:bytes.length}}
  save(relative,body,version){const operation=this.queue.catch(()=>{}).then(async()=>{
    if(typeof body!=='string'||Buffer.byteLength(body)>5*1024*1024)throw Error('Conteúdo inválido ou maior que 5 MB.');const file=await this.resolve(relative);if(!files.editable(file))throw Error('Este formato ainda não é suportado para edição.');
    const current=await fs.readFile(file);if(hash(current)!==version)return {conflict:true};const mode=(await fs.stat(file)).mode;
    const temp=path.join(path.dirname(file),'.amago-write-'+randomUUID());
    try{await fs.writeFile(temp,body,{flag:'wx',mode});await this.resolve(relative);if(hash(await fs.readFile(file))!==version)return {conflict:true};await fs.rename(temp,file);return {version:hash(Buffer.from(body)),saved:true}}finally{await fs.unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e})}
  });this.queue=operation;return operation}
  async create(relative,kind){if(!['markdown','directory'].includes(kind))throw Error('Tipo inválido.');const file=await this.resolve(relative,{missing:true});if(kind==='directory')await fs.mkdir(file);else{if(!MARKDOWN.test(file))throw Error('Use a extensão .md.');await fs.writeFile(file,'',{flag:'wx'})}return {created:true}}
}
module.exports={Workspace};
