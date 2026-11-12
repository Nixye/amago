import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const ctx=vm.createContext({});
for(const name of ['link-core','search-core'])vm.runInContext(readFileSync(new URL('../dist/'+name+'.js',import.meta.url),'utf8'),ctx);
const L=ctx.AmagoLinks,S=ctx.AmagoSearch;
const body='# Source\n[spaces](<../Anexos/Uma imagem.png>)\n[json](../Dados/config%20(v2).json)\n[[Notas/Outra nota#Detalhes|Wiki]]\n![[Uma imagem.png|300]]\n![Image](../Anexos/Uma%20imagem.png)\n[reference][config]\n[config]: ../Dados/config%20(v2).json "Configuração"\n`[[ignored]]`\n```md\n[x](ignored.md)\n```\n\\[[escaped]]';
const refs=L.references(body);assert.equal(refs.length,6);assert.equal(refs[1].target,'../Dados/config%20(v2).json');assert(refs[3].embed);assert(!refs.some(r=>r.target==='ignored'||r.target==='escaped'));
const source={path:'Notas/Origem.md',kind:'markdown',body},docs=[source,{path:'Notas/Outra nota.md',name:'Outra nota.md',kind:'markdown',body:'---\naliases: [Apelido]\n---\n[back](Origem.md)'},{path:'Anexos/Uma imagem.png',name:'Uma imagem.png',kind:'image'},{path:'Dados/config (v2).json',name:'config (v2).json',kind:'text'},{path:'hash#file.md',name:'hash#file.md',kind:'markdown'}];
const options={root:'C:/Vault',aliases:d=>S.metadata(d.body).aliases};
for(const r of refs)assert(L.resolve(docs,source,r.target,options),r.target);
assert.equal(L.resolve(docs,source,'Apelido',options).path,'Notas/Outra nota.md');
assert.equal(L.resolve(docs,source,'file:///C:/Vault/Dados/config%20(v2).json',options).kind,'text');
assert.equal(L.resolve(docs,source,'/hash%23file.md',options).path,'hash#file.md');
assert.equal(L.resolve(docs,source,'../../Dados/config%20(v2).json',options),null);
assert.equal(L.resolve(docs,source,'file:///C:/Outside/private.md',options),null);
assert.equal(L.resolve(docs,source,'https://example.com/Origem.md',options),null);
assert.equal(L.resolve([...docs,{path:'Other/Outra nota.md',name:'Outra nota.md'}],{},'Outra nota',options),null);
const connected=L.connections(docs,source,S.metadata,options);assert.equal(connected.outgoing.length,3);assert.equal(connected.incoming.length,1);assert.equal(connected.missing.length,0);
const {RecentProjects}=createRequire(import.meta.url)('../desktop/projects.cjs');
const temp=await mkdtemp(path.join(os.tmpdir(),'amago-recents-test-'));
try{const file=path.join(temp,'data','projects.json'),recents=new RecentProjects(file),folder=path.join(temp,'project');await mkdir(folder);const first=await recents.remember(folder);await recents.remember(folder);assert.equal((await recents.list()).length,1);assert.equal(await new RecentProjects(file).pathFor(first.id),folder);await assert.rejects(recents.pathFor(folder));await writeFile(path.join(folder,'keep.md'),'preserved');for(let i=0;i<14;i++)await recents.remember(path.join(temp,'project-'+i));assert.equal((await recents.list()).length,12);const last=(await recents.list())[0];await recents.forget(last.id);assert.equal((await recents.list()).length,11);assert.equal(readFileSync(path.join(folder,'keep.md'),'utf8'),'preserved')}
finally{if(path.dirname(temp)!==path.resolve(os.tmpdir())||!path.basename(temp).startsWith('amago-recents-test-'))throw Error('Unexpected cleanup path');await rm(temp,{recursive:true,force:true})}
// Closing a project tab must await saves and retain drafts on conflicts.
const sourceUI=readFileSync(new URL('../dist/navigation.js',import.meta.url),'utf8');
const studioUI=readFileSync(new URL('../dist/studio.js',import.meta.url),'utf8'),paneContext=vm.createContext({});
vm.runInContext(studioUI.slice(studioUI.indexOf('function paneDocument'),studioUI.indexOf('function currentPane')),paneContext);
assert.equal(paneContext.paneDocument(undefined),null,'Status updates must tolerate DOM panes removed from state during tab closure');
const tabContext=vm.createContext({workbench:{tabs:['a.md','b.md'],file:{path:'a.md'}},studio:{panes:[{source:'project',id:'a.md'},{source:'project',id:'b.md'}],active:0,files:new Map([['a.md',{dirty:true}]])},saveProjectFile:async()=>false,render(){},state:{view:'project'},openProjectFile:async()=>{},URL});
vm.runInContext(sourceUI.slice(sourceUI.indexOf('async function closeProjectTab'),sourceUI.indexOf('function connectionPanel')),tabContext);
await tabContext.closeProjectTab('a.md');assert.equal(tabContext.workbench.tabs.length,2);assert(tabContext.studio.files.has('a.md'));
tabContext.saveProjectFile=async()=>true;let opened;tabContext.openProjectFile=async id=>opened=id;await tabContext.closeProjectTab('a.md');assert.equal(opened,'b.md');assert(!tabContext.studio.files.has('a.md'));assert.equal(tabContext.studio.panes.length,1);
// A new browser session must retrieve handles from IndexedDB and renew permissions.
const browserSource=readFileSync(new URL('../dist/recent-folders.js',import.meta.url),'utf8');
const records=new Map();let requested=0,permission='granted',serial=0;
const handle={name:'Browser project',isSameEntry:async other=>other===handle,queryPermission:async()=>permission,requestPermission:async()=>{requested++;return permission}};
const indexedDB={open(){const request={result:{transaction(){const tx={objectStore(){const run=callback=>{const req={};queueMicrotask(()=>{req.result=callback();tx.oncomplete?.()});return req};return {getAll:()=>run(()=>[...records.values()]),put:r=>run(()=>records.set(r.id,r)),delete:id=>run(()=>records.delete(id))}}};return tx}}};queueMicrotask(()=>request.onsuccess());return request}};
function browserSession(db=indexedDB){const browser=vm.createContext({window:{},indexedDB:db,crypto:{randomUUID:()=>String(++serial)}});vm.runInContext(browserSource,browser);return browser.window.recentFolders}
const firstSession=browserSession(),remembered=await firstSession.remember(handle);await firstSession.remember(handle);assert.equal(records.size,1);
const secondSession=browserSession();assert.equal((await secondSession.list()).projects[0].id,remembered.id);assert.equal(await secondSession.reopen(remembered.id),handle);assert.equal(requested,0);
permission='denied';await assert.rejects(secondSession.reopen(remembered.id),/Acesso/);assert.equal(requested,1);
await secondSession.forget(remembered.id);assert.equal(records.size,0);await assert.rejects(secondSession.reopen(remembered.id),/indisponível/);
const blockedSession=browserSession({open(){throw Error('Storage unavailable')}});const transient=await blockedSession.remember(handle);assert(transient.sessionOnly);assert.equal((await blockedSession.list()).projects.length,1);
// Repeated drag updates use the original pair geometry, not its changing width.
const resizeContext=vm.createContext({interfacePrefs:()=>resizePrefs,innerWidth:1440,applyResizeLayout(){}}),resizePrefs={columnWeights:[1,1,1,1]};
vm.runInContext(sourceUI.slice(sourceUI.indexOf('function columnWeights'),sourceUI.indexOf('function applyResizeLayout')),resizeContext);
const separator={dataset:{resize:'columns',resizeIndex:'0'}},pane={nextElementSibling:{}},rect={left:0,width:500,pairWidth:1000,pairWeight:2};
resizeContext.resizeTo(separator,pane,rect,600);resizeContext.resizeTo(separator,pane,rect,650);assert.equal(resizePrefs.columnWeights[0],1.3);assert.equal(resizePrefs.columnWeights[1],.7);
console.log('Navigation: local links and backlinks, native/browser recent-project persistence, permission denial, conflict-safe tab closing and stable pane resizing passed.');
