'use strict';
const atlasPreviousData=graphData;
graphData=function(){
 const prefs=graphPreferences(),kind=prefs.relation||'links';
 if(kind==='links')return atlasPreviousData();
 const all=discoveryDocs().filter(d=>!d.kind||d.kind==='markdown'),meta=new Map(all.map(d=>[docId(d),AmagoSearch.metadata(d.body)])),edges=[];
 const candidates=all.filter(d=>AmagoSearch.matches(d,discovery.graphQuery)).slice(0,500);
 for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){
  const a=candidates[i],b=candidates[j],key=kind==='tags'?'tags':'mentions',left=[...(meta.get(docId(a))[key]||[]),...(key==='tags'?a.tags||[]:[])],right=[...(meta.get(docId(b))[key]||[]),...(key==='tags'?b.tags||[]:[])];
  const shared=left.filter(v=>right.some(w=>AmagoSearch.normalize(w)===AmagoSearch.normalize(v)));
  if(shared.length)edges.push({a:docId(a),b:docId(b),label:shared.join(', ')});
 }
 const visible=discovery.localFocus?graphNeighborhood(edges,discovery.localFocus,prefs.depth||1):new Set(candidates.map(docId)),connected=new Set(edges.flatMap(e=>[e.a,e.b]));
 const docs=candidates.filter(d=>visible.has(docId(d))&&(!discovery.linked||connected.has(docId(d)))),ids=new Set(docs.map(docId));
 return {docs,edges:edges.filter(e=>ids.has(e.a)&&ids.has(e.b)),total:all.filter(d=>AmagoSearch.matches(d,discovery.graphQuery)).length};
};
const atlasPosition=graphPosition,atlasOrders=new WeakMap();
const atlasLayers=new WeakMap();
graphPosition=function(docs,index,layout){
 if(layout==='flow'){
  if(!atlasLayers.has(docs)){
   const edges=graphData().edges,levels=new Map(),incoming=new Set(edges.map(e=>e.b)),queue=docs.filter(d=>!incoming.has(docId(d))).map(docId);
   if(!queue.length&&docs.length)queue.push(docId(docs[0]));for(const id of queue)levels.set(id,0);
   for(let i=0;i<queue.length;i++)for(const edge of edges)if(edge.a===queue[i]&&!levels.has(edge.b)){levels.set(edge.b,levels.get(edge.a)+1);queue.push(edge.b)}
   for(const doc of docs)if(!levels.has(docId(doc)))levels.set(docId(doc),0);
   atlasLayers.set(docs,levels);
  }
  const levels=atlasLayers.get(docs),level=levels.get(docId(docs[index])),group=docs.filter(d=>levels.get(docId(d))===level),depth=Math.max(...levels.values(),1);
  return {x:100+level*800/depth,y:70+group.indexOf(docs[index])*420/Math.max(1,group.length-1)};
 }
 if(layout==='columns'){const cols=3,rows=Math.ceil(docs.length/cols);return {x:100+(index%cols)*400,y:70+Math.floor(index/cols)*420/Math.max(1,rows-1)}}
 if(layout==='organic'){if(!atlasOrders.has(docs)){const degree=new Map();for(const e of graphData().edges){degree.set(e.a,(degree.get(e.a)||0)+1);degree.set(e.b,(degree.get(e.b)||0)+1)}atlasOrders.set(docs,[...docs].sort((a,b)=>(degree.get(docId(b))||0)-(degree.get(docId(a))||0)))}const ordered=atlasOrders.get(docs);if(ordered[0]===docs[index])return {x:500,y:290};return atlasPosition(ordered,ordered.indexOf(docs[index]),layout)}
 return atlasPosition(docs,index,layout);
};
const atlasRender=renderUniverse;
renderUniverse=function(){atlasRender();const prefs=graphPreferences(),svg=$('#universe-svg');
 $('.universe-toolbar').insertAdjacentHTML('afterbegin',`<label>Relações <select id="atlas-relation"><option value="links">Links entre documentos</option><option value="tags">Tags em comum</option><option value="mentions">Menções em comum</option></select></label><label><input type="checkbox" id="atlas-motion" ${prefs.motion!==false?'checked':''}>Animar conexões</label>`);
 $('#atlas-relation').value=prefs.relation||'links';$('#atlas-relation').onchange=e=>{prefs.relation=e.target.value;prefs.positions={};persist();renderUniverse()};
 const motion=()=>{const enabled=prefs.motion!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches;svg.classList.toggle('atlas-motion',enabled);enabled?svg.unpauseAnimations():svg.pauseAnimations()};motion();$('#atlas-motion').onchange=e=>{prefs.motion=e.target.checked;persist();motion()};
 const data=graphData(),degrees=new Map();for(const e of data.edges){degrees.set(e.a,(degrees.get(e.a)||0)+1);degrees.set(e.b,(degrees.get(e.b)||0)+1)}const max=Math.max(0,...degrees.values());document.querySelectorAll('.universe-node').forEach(n=>{n.classList.toggle('atlas-hub',max>0&&degrees.get(n.dataset.node)===max)});
 const ns='http://www.w3.org/2000/svg',signals=document.createElementNS(ns,'g');signals.classList.add('atlas-signals');$('#universe-camera').append(signals);
 [...document.querySelectorAll('[data-edge]')].slice(0,100).forEach((line,i)=>{const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','3');dot.setAttribute('fill','var(--accent)');const animation=document.createElementNS(ns,'animateMotion');animation.setAttribute('dur','3s');animation.setAttribute('repeatCount','indefinite');animation.setAttribute('begin',(i%8)*.25+'s');const update=()=>animation.setAttribute('path','M '+line.getAttribute('x1')+' '+line.getAttribute('y1')+' L '+line.getAttribute('x2')+' '+line.getAttribute('y2'));update();const observer=new MutationObserver(update);observer.observe(line,{attributes:true,attributeFilter:['x1','y1','x2','y2']});dot.append(animation);signals.append(dot);const target=[...document.querySelectorAll('.universe-node')].find(n=>n.dataset.node===data.edges[i]?.b);if(target){const blink=document.createElementNS(ns,'animate');blink.setAttribute('attributeName','opacity');blink.setAttribute('values','1;1;.35;1');blink.setAttribute('keyTimes','0;0.85;0.92;1');blink.setAttribute('dur','3s');blink.setAttribute('begin',(i%8)*.25+'s');blink.setAttribute('repeatCount','indefinite');target.append(blink)}});
 document.querySelectorAll('[data-edge]').forEach((edge,i)=>{const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=data.edges[i]?.label||'Referência entre documentos';edge.append(title)});
 if(['flow','columns'].includes(prefs.layout)){svg.classList.add('atlas-cards');document.querySelectorAll('.universe-node').forEach(node=>{const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');for(const [k,v] of Object.entries({x:-70,y:-22,width:140,height:58,rx:9}))rect.setAttribute(k,v);node.insertBefore(rect,node.firstChild);node.querySelector('text').setAttribute('y','10')});$('#node-size').disabled=true}
};
