'use strict';
// This document runs with sandbox="allow-scripts" and an opaque origin.
addEventListener('message',async event=>{
 if(event.source!==parent||event.data?.type!=='amago-plugin-boot'||!event.ports[0])return;
 const port=event.ports[0],commands=new Map(),pending=new Map();let sequence=0;
 const request=(method,value)=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(Error('A solicitação expirou.'))},120000);pending.set(id,{resolve,reject,timer});port.postMessage({type:'request',id,method,value})});
 const api=Object.freeze({registerCommand:(id,handler)=>{if(typeof handler==='function'&&event.data.commands.includes(id))commands.set(id,handler)},getActiveNote:()=>request('note:read'),proposeContent:body=>request('note:write',body),showMessage:message=>request('message',String(message).slice(0,500))});
 port.onmessage=async e=>{const data=e.data;if(data.type==='result'){const item=pending.get(data.id);if(item){clearTimeout(item.timer);pending.delete(data.id);data.error?item.reject(Error(data.error)):item.resolve(data.value)}}if(data.type==='invoke'){try{const handler=commands.get(data.command);if(!handler)throw Error('Comando não registrado pelo plugin.');await handler()}catch(error){port.postMessage({type:'error',message:String(error.message).slice(0,300)})}}};
 try{const url=URL.createObjectURL(new Blob([event.data.code],{type:'text/javascript'}));const module=await import(url);URL.revokeObjectURL(url);if(typeof module.default!=='function')throw Error('Exporte uma função default.');await module.default(api);port.postMessage({type:'ready',commands:[...commands.keys()]})}catch(error){port.postMessage({type:'error',message:String(error.message).slice(0,300)})}
},{once:true});
