'use strict';
// Opaque-origin runtime. DOM and CSS belong to this plugin's frame only.
addEventListener('message',async event=>{
 if(event.source!==parent||event.data?.type!=='amago-plugin-boot'||!event.ports[0])return;
 const port=event.ports[0],commands=new Map(),pending=new Map(),listeners=new Map();let sequence=0;
 const request=(method,value)=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(Error('A solicitação expirou.'))},120000);pending.set(id,{resolve,reject,timer});port.postMessage({type:'request',id,method,value})});
 const api=Object.freeze({version:2,
 registerCommand:(id,handler)=>{if(typeof handler==='function'&&event.data.commands.includes(id))commands.set(id,handler)},
 getActiveNote:()=>request('note:read'),getActiveDocument:()=>request('note:read'),proposeContent:body=>request('note:write',body),
 getSelection:()=>request('selection:read'),replaceSelection:text=>request('selection:write',text),
 listDocuments:()=>request('workspace:list'),readDocument:id=>request('workspace:document',id),openDocument:id=>request('workspace:open',id),
 getSettings:()=>request('settings:get'),setSettings:values=>request('settings:set',values),
 storage:Object.freeze({get:()=>request('storage:get'),set:value=>request('storage:set',value)}),
 showPanel:async({title='',width=420,html='',css=''}={})=>{await request('ui:panel',{title,width});let style=document.getElementById('plugin-style');if(!style){style=document.createElement('style');style.id='plugin-style';document.head.append(style)}style.textContent=String(css).slice(0,100000);document.body.innerHTML=String(html).slice(0,200000)},
 hidePanel:()=>request('ui:hide'),
 on:(name,handler)=>{if(typeof handler!=='function')throw Error('Informe uma função.');if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(handler);return ()=>listeners.get(name)?.delete(handler)},
 showMessage:message=>request('message',String(message).slice(0,500))});
 const report=error=>port.postMessage({type:'error',message:String(error.message).slice(0,300)});
 port.onmessage=async e=>{const data=e.data;if(data.type==='result'){const item=pending.get(data.id);if(item){clearTimeout(item.timer);pending.delete(data.id);data.error?item.reject(Error(data.error)):item.resolve(data.value)}}if(data.type==='invoke'){try{const handler=commands.get(data.command);if(!handler)throw Error('Comando não registrado pelo plugin.');await handler()}catch(error){report(error)}}if(data.type==='event'){if(data.name==='theme:change')for(const [key,value] of Object.entries(data.value.colors||{}))document.documentElement.style.setProperty('--'+key,value);for(const handler of listeners.get(data.name)||[])try{await handler(data.value)}catch(error){report(error)}}};
 try{const url=URL.createObjectURL(new Blob([event.data.code],{type:'text/javascript'}));const module=await import(url);URL.revokeObjectURL(url);if(typeof module.default!=='function')throw Error('Exporte uma função default.');await module.default(api);port.postMessage({type:'ready',commands:[...commands.keys()]})}catch(error){report(error)}
},{once:true});
