import vm from 'node:vm';import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';
const ctx=vm.createContext({TextEncoder});for(const file of ['file-core','link-core','search-core','extension-core'])vm.runInContext(readFileSync(new URL('../dist/'+file+'.js',import.meta.url),'utf8'),ctx);
const {AmagoSearch:S,AmagoFiles:F,AmagoExtensions:E}=ctx;
const body='---\r\ntags:\r\n  - origem\r\naliases: ["Nome alternativo", "Alias"]\r\ncustom: true\r\nlink: "[[Outra nota]]"\r\n---\r\n# Título\r\n**#teste** (#estudo/livros), @luna e [[Outra nota#Seção|Título]].\r\n[Destino](../Outra%20nota.md)\r\n\\#escapada\r\n~~~js\r\n#oculta @oculto\r\n~~~\r\n`#codigo` %% #comentario %%';
const meta=S.metadata(body);for(const tag of ['origem','teste','estudo/livros'])assert(meta.tags.includes(tag));for(const tag of ['oculta','codigo','comentario','escapada'])assert(!meta.tags.includes(tag));assert(meta.mentions.includes('luna'));assert(meta.links.includes('../Outra%20nota.md'));assert(meta.aliases.includes('Nome alternativo'));assert(S.matches({body},'#estudo @luna name:"Nome alternativo"'));
const changed=S.withProperties(body,{tags:['nova'],aliases:['Apelido'],color:'#123456'});assert(changed.includes('custom: true\r\nlink: "[[Outra nota]]"'));assert.equal(changed.slice(S.metadata(changed).front.length),body.slice(meta.front.length));assert(S.metadata(changed).tags.includes('teste'));assert(!S.metadata(changed).tags.includes('origem'));assert.equal(S.metadata(changed).color,'#123456');assert.equal(S.metadata(S.withProperties(changed,{color:null})).color,null);
for(const file of ['note.md','data.JSON','plan.CSV','log.txt','data.yaml','script.js','index.html','.env'])assert(F.editable(file));for(const file of ['report.docx','sheet.xlsx','archive.zip','program.exe','image.png'])assert(!F.editable(file));assert.equal(F.kind('image.avif'),'image');assert(F.ignored('.obsidian'));
const plugin=E.plugin({format:'amago-plugin-v2',id:'inspector',name:'Inspector',code:'export default ()=>{}',permissions:['workspace:read','ui:panel','storage'],commands:[{id:'open',title:'Open'}],toolbar:['open'],settings:[{key:'limit',type:'number',label:'Limit',default:10,min:1,max:50},{key:'theme',type:'select',label:'Theme',options:['dark','light']}]});assert.equal(E.settingsValues(plugin).limit,10);assert.throws(()=>E.settingsValues(plugin,{limit:100}));assert.throws(()=>E.plugin({...plugin,toolbar:['missing']}));assert.throws(()=>E.plugin({...plugin,permissions:['shell']}));assert.throws(()=>E.plugin({...plugin,settings:[{key:'constructor',label:'Bad',type:'text'}]}));
const source=readFileSync(new URL('../dist/personalization.js',import.meta.url),'utf8');vm.runInContext(source.slice(source.indexOf('async function extensionRequest'),source.indexOf('function pluginReady')),ctx);ctx.pluginScope=()=> 'vault';ctx.workbench={source:'vault'};ctx.vault={notes:[{id:'a',title:'A',body:'#teste'}]};ctx.activeDocument=()=>({id:'a',title:'A',body:'#teste',source:'vault'});ctx.persist=()=>{};
const request=ctx.extensionRequest,runtime={port:{postMessage(){}}},none={id:'none',permissions:[]};await assert.rejects(request(none,runtime,'workspace:document','a'),/Permissão/);await assert.rejects(request(none,runtime,'note:read'),/Permissão/);await assert.rejects(request(none,runtime,'storage:set',{}),/Permissão/);await assert.rejects(request(none,runtime,'shell','whoami'),/suportado/);
const allowed={id:'allowed',permissions:['workspace:read','storage']};assert.equal((await request(allowed,runtime,'workspace:document','a')).body,'#teste');await assert.rejects(request(allowed,runtime,'workspace:document','../outside.md'),/fora/);await request(allowed,runtime,'storage:set',{count:3});assert.equal((await request(allowed,runtime,'storage:get')).count,3);assert.equal(await request({id:'other',permissions:['storage']},runtime,'storage:get'),null);await assert.rejects(request(allowed,runtime,'storage:set','x'.repeat(70000)),/limite/);
console.log('Compatibility: Obsidian tags/aliases/links, preserved YAML/body, text formats, plugin schema, permissions and isolated storage passed.');

// Exercise the real MessageChannel dispatcher, including v2 method-to-capability mapping.
const responses=[],runtimes=new Map();
const host=vm.createContext({TextEncoder,AmagoExtensions:E,AmagoSearch:S,AmagoFiles:F,
 document:{createElement:()=>({setAttribute(){}})},pluginRuntime:runtimes,stopPlugin(){},
 MessageChannel:class{constructor(){this.port1={postMessage:r=>responses.push(r)};this.port2={}}},
 attachPluginFrame(_p,r){r.surface={style:{setProperty(){}},hidden:true};r.panelTitle={};r.frame.focus=()=>{}},
 setTimeout:()=>1,clearTimeout(){},persist(){},vault:{},pluginSettings:()=>({limit:20})});
vm.runInContext(source.slice(source.indexOf('function startPlugin'),source.indexOf('const permissionLabel')),host);
vm.runInContext(source.slice(source.indexOf('async function extensionRequest'),source.indexOf('function pluginReady')),host);
const enabled={id:'test-panel',enabled:true,permissions:['ui:panel'],commands:[]};host.startPlugin(enabled);
const runtimeHost=runtimes.get(enabled.id);
await runtimeHost.port.onmessage({data:{type:'request',id:1,method:'ui:panel',value:{title:'Test',width:400}}});
assert.equal(responses.at(-1).value,true);assert.equal(runtimeHost.surface.hidden,false);
await runtimeHost.port.onmessage({data:{type:'request',id:2,method:'settings:get'}});
assert.equal(responses.at(-1).value.limit,20);
await runtimeHost.port.onmessage({data:{type:'request',id:3,method:'workspace:list'}});
assert.match(responses.at(-1).error,/Permissão/);
console.log('Plugin host: v2 messages reach capability checks, panels and settings; denied workspace access is rejected.');
