/* Âmago — a browser-local Markdown notebook. No note data leaves the browser. */
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const KEY='amago-vault-v1', stamp=()=>new Date().toISOString();
const initialNotes=[
 {id:'welcome',title:'Um lugar para suas ideias',folder:'Comece aqui',tags:['boas-vindas'],favorite:true,body:`Toda grande ideia começa com um pequeno registro. Este é o seu espaço para pensar em voz alta, conectar descobertas e dar forma ao que importa.

> Sua mente é para ter ideias, não para guardá-las.\n> — David Allen

## Seu segundo cérebro começa aqui

O **Âmago** é um lugar tranquilo para o seu conhecimento crescer. Sem pressa, sem uma estrutura perfeita. Apenas você e as suas ideias.

Escreva uma nota. Conecte-a a outra. Aos poucos, um universo só seu começa a aparecer.

## Pequenos passos, novas possibilidades

- [x] Encontrar um novo lar para suas ideias
- [ ] Criar sua primeira nota
- [ ] Conectar dois pensamentos com \`[[links]]\`
- [ ] Explorar o seu mapa de conexões

## Tudo está conectado

Uma nota nunca precisa ficar sozinha. Use **links entre notas** para descobrir relações que você ainda não tinha percebido.

Que tal começar por [[Jardim de ideias]], explorar [[A arte de observar]] ou organizar seus [[Projetos em movimento]]?

---

**Um espaço seu, do seu jeito.** Suas notas são salvas automaticamente neste navegador. Faça uma cópia nas configurações para levar seu universo com você.`},
 {id:'guide',title:'Guia de Markdown',folder:'Comece aqui',tags:['guia'],favorite:false,body:`O Markdown dá forma ao que você escreve usando alguns símbolos simples.

## Dê destaque ao que importa

Use **dois asteriscos** para negrito, *um asterisco* para itálico e \`crases\` para código.

## Organize o pensamento

- Comece uma lista com um hífen
- Crie títulos com ##
- Use > para uma citação
- Crie tarefas com - [ ]

## Conecte as ideias

Escreva [[Jardim de ideias]] para conectar esta nota a outra. Se a nota ainda não existir, você poderá criá-la ao clicar no link.

## Um pouco de código

\`\`\`js
const ideia = "começar pequeno";
console.log(ideia);
\`\`\`

Volte para [[Um lugar para suas ideias]] quando quiser.`},
 {id:'garden',title:'Jardim de ideias',folder:'Pessoal',tags:['ideias','pessoal'],favorite:true,body:`Ideias são sementes. Algumas precisam de tempo, outras só precisam de um primeiro passo.

## Sementes para cultivar

- Criar um espaço digital que pareça casa
- Registrar uma descoberta por dia
- Construir algo que eu gostaria de usar

## Conexões inesperadas

Observar melhor é o primeiro passo para criar melhor. Tenho pensado nisso desde que escrevi [[A arte de observar]].

Talvez uma dessas sementes se transforme em um dos meus [[Projetos em movimento]].

> Não é preciso saber aonde a ideia vai chegar para começar a escrevê-la.`},
 {id:'observe',title:'A arte de observar',folder:'Pessoal',tags:['reflexões','pessoal'],favorite:false,body:`O cotidiano guarda mais possibilidades do que a gente percebe.

## Prestar atenção é uma escolha

Hoje eu quero colecionar detalhes: uma conversa, uma sombra bonita na parede, um problema pequeno que ninguém resolveu.

## Um exercício simples

- [ ] Sair sem fones por alguns minutos
- [ ] Anotar três coisas que normalmente passam despercebidas
- [ ] Levar uma descoberta para o [[Jardim de ideias]]

Pensar com calma também é uma forma de avançar.`},
 {id:'reading',title:'Leituras e descobertas',folder:'Pessoal',tags:['leituras'],favorite:false,body:`Um lugar para guardar o que vale a pena lembrar.

## Na minha estante

- Hábitos Atômicos — James Clear
- Roube como um Artista — Austin Kleon
- A arte de fazer acontecer — David Allen

## Uma ideia para levar comigo

Não basta consumir ideias. Preciso relacionar o que leio com o que vivo.

Essas conexões podem nascer no [[Jardim de ideias]] ou virar [[Projetos em movimento]].`},
 {id:'projects',title:'Projetos em movimento',folder:'Projetos',tags:['projetos'],favorite:true,body:`Um pouco de intenção, um pouco de constância. Aqui moram as coisas que quero tirar do papel.

## Meu espaço de conhecimento

Construir uma aplicação web pessoal para escrever, conectar e encontrar minhas ideias.

- [x] Definir o primeiro passo
- [ ] Explorar o editor de Markdown
- [ ] Criar uma estrutura que faça sentido para mim
- [ ] Experimentar conexões entre notas

## Próximos passos

Revisitar as sementes no [[Jardim de ideias]] e escolher uma para cultivar esta semana.

Veja também [[Referências e inspirações]].`},
 {id:'references',title:'Referências e inspirações',folder:'Projetos',tags:['referências','projetos'],favorite:false,body:`O que me inspira a construir algo meu.

## Um bom espaço de escrita

- Pouco ruído visual
- Organização flexível
- Conexões que ajudam a pensar
- Liberdade para levar minhas notas comigo

## Para explorar

Como as ideias se relacionam no [[Jardim de ideias]]? Como transformar uma referência em um dos meus [[Projetos em movimento]]?

> Comece de onde você está. Use o que você tem. Faça o que você pode.`}
].map(n=>({...n,created:stamp(),updated:stamp()}));
let vault;try{vault=JSON.parse(localStorage.getItem(KEY))}catch{}
if(!vault||!Array.isArray(vault.notes)||!vault.notes.length)vault={notes:initialNotes,folders:['Comece aqui','Pessoal','Projetos'],theme:'dark'};
let state={id:vault.notes[0].id,tabs:[vault.notes[0].id],view:'notes',mode:'read',openFolders:new Set(vault.folders),tag:null};
let saveTimer,toastTimer,storageOK=true;
const note=()=>vault.notes.find(n=>n.id===state.id);
const uid=()=>crypto.randomUUID();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(vault));storageOK=true;$('#save-state').innerHTML='<i class="online-dot"></i>Alterações salvas'}catch{storageOK=false;$('#save-state').textContent='Falha ao salvar';toast('Não foi possível salvar. Exporte uma cópia das suas notas.')} }
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function links(n){const text=n.body.replace(/```[\s\S]*?(?:```|$)/g,'').replace(/`[^`]*`/g,'');return [...text.matchAll(/\[\[([^\]]+)\]\]/g)].map(x=>x[1].trim())}
function findTitle(title){return vault.notes.find(n=>n.title.toLocaleLowerCase()===title.toLocaleLowerCase())}
function backlinks(n){return vault.notes.filter(x=>x.id!==n.id&&links(x).some(t=>t.toLocaleLowerCase()===n.title.toLocaleLowerCase()))}
function formatDate(iso){return new Date(iso).toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}
function inline(s){const codes=[];return esc(s).replace(/`([^`]+)`/g,(_,code)=>'\u0000'+(codes.push(code)-1)+'\u0000').replace(/\[\[([^\]]+)\]\]/g,(_,t)=>`<button class="wiki-link" data-wiki="${t}">${t}</button>`).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\u0000(\d+)\u0000/g,(_,i)=>'<code>'+codes[i]+'</code>')}
function markdown(body,interactive=true){
 const lines=body.replace(/\r/g,'').split('\n');let html='',list='',inCode=false,code=[],para=[],quote=[],heading=0;
 const flushP=()=>{if(para.length){html+=`<p>${inline(para.join(' '))}</p>`;para=[]}};
 const flushQ=()=>{if(quote.length){html+=`<blockquote>${quote.map(t=>`<p>${inline(t)}</p>`).join('')}</blockquote>`;quote=[]}};
 const endList=()=>{if(list){html+=`</${list}>`;list=''}};
 lines.forEach((line,idx)=>{
  if(line.startsWith('```')){flushP();flushQ();endList();if(inCode){html+=`<pre><code>${esc(code.join('\n'))}</code></pre>`;code=[]}inCode=!inCode;return}
  if(inCode){code.push(line);return}
  const h=line.match(/^(#{1,3})\s+(.+)/),q=line.match(/^>\s?(.*)/),li=line.match(/^\s*(?:([-*])|(\d+)\.)\s+(.*)/);
  if(!line.trim()){flushP();flushQ();endList();return}
  if(h){flushP();flushQ();endList();html+=`<h${h[1].length} id="heading-${heading++}">${inline(h[2])}</h${h[1].length}>`;return}
  if(q){flushP();endList();quote.push(q[1]);return}flushQ();
  if(/^---+$/.test(line.trim())){flushP();endList();html+='<hr>';return}
  if(li){flushP();const type=li[2]?'ol':'ul';if(list!==type){endList();html+=`<${type}>`;list=type}const task=li[3].match(/^\[([ xX])\]\s*(.*)/);html+=task?`<li class="task"><input type="checkbox" ${task[1]!==' '?'checked':''} ${interactive?`data-task="${idx}"`:'disabled'} aria-label="${esc(task[2])}"><span class="${task[1]!==' '?'done':''}">${inline(task[2])}</span></li>`:`<li>${inline(li[3])}</li>`;return}
  endList();para.push(line);
 });flushP();flushQ();endList();if(inCode)html+=`<pre><code>${esc(code.join('\n'))}</code></pre>`;return html;
}
function renderTree(){
 $('#note-count').textContent=vault.notes.length;$('#fav-count').textContent=vault.notes.filter(n=>n.favorite).length;
 $('#file-tree').innerHTML=vault.folders.map(folder=>{const ns=vault.notes.filter(n=>n.folder===folder),open=state.openFolders.has(folder);return `<div><button class="folder-toggle ${open?'open':''}" data-folder="${esc(folder)}" aria-expanded="${open}">${icon('chevron')}${icon('folder')}${esc(folder)}<span class="count">${ns.length}</span></button>${open?ns.map(n=>`<button class="file ${n.id===state.id&&state.view==='notes'&&!state.tag?'selected':''}" data-note="${esc(n.id)}">${icon('note')}<span>${esc(n.title)}</span></button>`).join(''):''}</div>`}).join('');
 const tags=[...new Set(vault.notes.flatMap(n=>n.tags))];$('#tag-list').innerHTML=tags.map(t=>`<button class="tag-chip ${state.tag===t?'active':''}" data-tag="${esc(t)}"><b>#</b>${esc(t)}</button>`).join('');
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view&&!state.tag));
}
function renderTabs(){
 $('#tabbar').innerHTML=state.tabs.map(id=>{const n=vault.notes.find(n=>n.id===id);return n?`<button class="tab ${id===state.id&&state.view==='notes'&&!state.tag?'active':''}" data-note="${esc(id)}">${icon('note')}<span>${esc(n.title)}</span><span class="tab-close" data-close-tab="${esc(id)}" title="Fechar aba" aria-label="Fechar aba">×</span></button>`:''}).join('')+`<button class="tab-add" data-action="new" aria-label="Nova nota" title="Nova nota">${icon('plus')}</button>`;
}
function graphSVG(large=false){
 const ns=vault.notes, W=large?850:205,H=large?530:165,cx=W/2,cy=H/2,rad=large?178:51;
 const center=note()||ns[0];const ordered=[center,...ns.filter(n=>n.id!==center.id)];
 const coords=new Map(ordered.map((n,i)=>{const a=(i-1)*Math.PI*2/Math.max(ordered.length-1,1)-Math.PI/2;return[n.id,i===0?{x:cx,y:cy}:{x:cx+Math.cos(a)*rad*(i%2?.9:1.1),y:cy+Math.sin(a)*rad*.86}]}));
 let edges='',nodes='';ns.forEach(n=>{links(n).forEach(title=>{const target=findTitle(title);if(!target)return;const a=coords.get(n.id),b=coords.get(target.id);edges+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`})});
 ordered.forEach(n=>{const p=coords.get(n.id);nodes+=`<g><circle cx="${p.x}" cy="${p.y}" r="${n.id===center.id?(large?9:5.5):(large?6:3.5)}" class="${n.id===center.id?'current':''}" data-note="${esc(n.id)}" tabindex="0" role="button" aria-label="Abrir ${esc(n.title)}"><title>${esc(n.title)}</title></circle><text text-anchor="middle" x="${p.x}" y="${p.y+(large?23:15)}">${esc(n.title.length>(large?32:18)?n.title.slice(0,large?30:16)+'…':n.title)}</text></g>`});
 return `<svg class="graph-svg" viewBox="0 0 ${W} ${H}" aria-label="Mapa de conexões entre suas notas">${edges}${nodes}</svg>`;
}
function renderContext(n){const heads=[...n.body.matchAll(/^#{1,3}\s+(.+)$/gm)],back=backlinks(n);return `<aside class="context-panel"><h3 class="context-title">${icon('graph')}Conexões da nota<button class="icon-button" data-view="graph" title="Expandir mapa" aria-label="Expandir mapa" style="margin-left:auto">${icon('plus')}</button></h3><div class="graph-preview">${graphSVG()}</div><div class="graph-caption"><span>•</span> Uma ideia leva a outra</div><section class="panel-section"><h3 class="context-title">${icon('note')}Nesta nota</h3>${heads.map((h,i)=>`<button class="outline-link" data-heading="${i}">${esc(h[1])}</button>`).join('')||'<p class="empty-small">Os títulos da sua nota aparecem aqui.</p>'}</section><section class="panel-section"><h3 class="context-title">${icon('link')}Links para esta nota<span class="count">${back.length}</span></h3>${back.map(b=>`<button class="backlink" data-note="${esc(b.id)}">${icon('note')}${esc(b.title)}</button>`).join('')||'<p class="empty-small">Ao mencionar esta nota com [[links]], a conexão aparece aqui.</p>'}</section><div class="thought">${icon('spark')}O conhecimento cresce<br>quando as ideias <em>se encontram.</em></div></aside>`}
function updateStats(){const n=note();if(!n)return;const words=n.body.trim().split(/\s+/).filter(Boolean).length;$('#word-count').textContent=`${words} palavras`;$('#reading-time').textContent=`${Math.max(1,Math.ceil(words/200))} min de leitura`;$('#connection-count').textContent=`${new Set([...links(n).map(t=>findTitle(t)?.id).filter(Boolean),...backlinks(n).map(n=>n.id)]).size} conexões`}
function renderMain(){
 const n=note();$('#crumb-folder').textContent=state.tag?'#'+state.tag:state.view==='graph'?'Mapa de conexões':state.view==='favorites'?'Favoritos':n?.folder||'Notas';
 if(state.view==='graph'){$('#main').innerHTML=`<section class="graph-page"><div class="graph-heading"><div><h1>Um universo de conexões</h1><span class="collection-description">Cada ponto, uma ideia. Cada conexão, uma nova possibilidade.</span></div><button class="plain-button" data-action="new">${icon('plus')}Nova nota</button></div><div class="graph-large">${graphSVG(true)}<span class="graph-legend">${vault.notes.length} notas · Clique em um ponto para explorar</span></div></section>`;return}
 if(state.view==='favorites'||state.tag){const ns=vault.notes.filter(n=>state.tag?n.tags.includes(state.tag):n.favorite);$('#main').innerHTML=`<section class="collection"><div class="eyebrow">${icon(state.tag?'tag':'star')}SEU CONHECIMENTO, MAIS PERTO</div><h1>${state.tag?'# '+esc(state.tag):'Ideias para ter por perto'}</h1><p class="collection-description">${state.tag?'Notas que compartilham esta tag.':'Suas notas favoritas, reunidas em um só lugar.'}</p><div class="note-grid">${ns.map(n=>`<button class="note-card" data-note="${esc(n.id)}">${icon('note')}<h3>${esc(n.title)}</h3><p>${esc(n.body.replace(/[#*\[\]`>]/g,''))}</p><span class="tag-chip">${esc(n.folder)}</span></button>`).join('')}</div>${!ns.length?'<div class="no-results">Clique na estrela de uma nota para guardá-la aqui.</div>':''}</section>`;return}
 if(!n)return;
 $('#main').innerHTML=`<section class="note-main"><div class="document-toolbar"><span class="note-category">${icon('folder')}${esc(n.folder)}</span><div class="note-tools"><div class="segmented" aria-label="Modo do editor"><button data-mode="edit" class="${state.mode==='edit'?'active':''}" title="Editar Markdown" aria-label="Editar Markdown">${icon('edit')}</button><button data-mode="split" class="${state.mode==='split'?'active':''}" title="Editor e leitura" aria-label="Editor e leitura">${icon('panel')}</button><button data-mode="read" class="${state.mode==='read'?'active':''}" title="Modo leitura" aria-label="Modo leitura">${icon('eye')}</button></div><button class="icon-button ${n.favorite?'starred':''}" data-action="favorite" title="${n.favorite?'Remover dos':'Adicionar aos'} favoritos" aria-label="${n.favorite?'Remover dos':'Adicionar aos'} favoritos">${icon('star')}</button><button class="icon-button" data-action="note-menu" title="Opções da nota" aria-label="Opções da nota">${icon('more')}</button></div></div><article class="document ${state.mode==='split'?'split':''}"><div class="eyebrow">${icon('spark')}${n.id==='welcome'?'BEM-VINDA AO SEU NOVO ESPAÇO':'UM PENSAMENTO DE CADA VEZ'}</div><input class="title-input" id="note-title" aria-label="Título da nota" value="${esc(n.title)}" spellcheck="false"><div class="note-meta"><span>Criada em ${formatDate(n.created)}</span><span>·</span><span>Editada ${formatDate(n.updated)}</span>${n.tags.map(t=>`<button class="tag-chip" data-tag="${esc(t)}"># ${esc(t)}</button>`).join('')}<button class="icon-button" data-action="note-menu" title="Editar propriedades" aria-label="Editar propriedades">${icon('tag')}</button></div><div class="${state.mode==='split'?'split-content':''}">${state.mode!=='read'?`<textarea id="editor" class="editor" aria-label="Conteúdo Markdown" spellcheck="false">${esc(n.body)}</textarea>`:''}${state.mode!=='edit'?`<div class="markdown" id="preview">${markdown(n.body)}</div>`:''}</div>${n.id==='welcome'&&state.mode==='read'?`<div class="callout">${icon('spark')}<div><strong>Seu próximo pensamento merece uma nota.</strong><p>Use <kbd>Ctrl N</kbd> para criar uma nota ou clique em “Nova nota”.<br>Não precisa ser perfeito. Só precisa começar.</p></div></div>`:''}<div class="document-hint"><span>Uma ideia de cada vez. Um universo em construção.</span><button data-action="${state.mode==='read'?'edit':'read'}">${icon(state.mode==='read'?'edit':'eye')}${state.mode==='read'?'Começar a escrever':'Voltar à leitura'}</button></div></article></section>${renderContext(n)}`;
 updateStats();
 $('#note-title').addEventListener('change',e=>{const title=e.target.value.trim();if(!title){e.target.value=n.title;return}if(vault.notes.some(x=>x.id!==n.id&&x.title.toLowerCase()===title.toLowerCase())){e.target.value=n.title;toast('Já existe uma nota com esse título.');return}const old=n.title;n.title=title;n.updated=stamp();vault.notes.forEach(x=>{x.body=x.body.replace(/\[\[([^\]]+)\]\]/g,(m,t)=>t.trim().toLowerCase()===old.toLowerCase()?`[[${title}]]`:m)});persist();render()});
 $('#editor')?.addEventListener('input',e=>{n.body=e.target.value;n.updated=stamp();$('#save-state').textContent='Salvando…';clearTimeout(saveTimer);saveTimer=setTimeout(persist,350);if($('#preview'))$('#preview').innerHTML=markdown(n.body);updateStats()});
 $('#editor')?.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const t=e.target,start=t.selectionStart;t.setRangeText('  ',start,t.selectionEnd,'end');t.dispatchEvent(new Event('input'))}});
}
function render(){document.body.classList.toggle('theme-light',vault.theme==='light');renderTree();renderTabs();renderMain()}
function openNote(id){if(!vault.notes.some(n=>n.id===id))return;state.id=id;state.view='notes';state.tag=null;if(!state.tabs.includes(id))state.tabs.push(id);state.openFolders.add(note().folder);render();if(innerWidth<=650)document.body.classList.add('sidebar-hidden')}
function closeModal(){$('#modal-root').innerHTML='';lastFocus?.focus?.()}
let lastFocus;
function modal(title,body){lastFocus=document.activeElement;$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h2>${esc(title)}</h2><button class="icon-button" data-action="close" aria-label="Fechar">${icon('close')}</button></div><div class="modal-body">${body}</div></section></div>`;setTimeout(()=>$('.modal input,.modal select,.modal button')?.focus(),30)}
function newNote(title='',folder=note()?.folder||vault.folders[0]){modal('Um novo pensamento',`<form id="new-form"><label for="new-title">Título da nota</label><input id="new-title" class="field" placeholder="O que está na sua cabeça?" value="${esc(title)}" required maxlength="160"><label for="new-folder">Pasta</label><select id="new-folder" class="field">${vault.folders.map(f=>`<option ${f===folder?'selected':''}>${esc(f)}</option>`).join('')}</select><div class="modal-actions"><button type="button" class="plain-button" data-action="close">Cancelar</button><button class="solid-button">Criar nota</button></div></form>`);$('#new-form').onsubmit=e=>{e.preventDefault();const title=$('#new-title').value.trim();if(!title)return;if(findTitle(title)){toast('Já existe uma nota com esse título.');return}const n={id:uid(),title,folder:$('#new-folder').value,tags:[],body:'',favorite:false,created:stamp(),updated:stamp()};vault.notes.push(n);persist();closeModal();state.mode='edit';openNote(n.id);$('#editor')?.focus()}}
function search(){lastFocus=document.activeElement;$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Buscar notas"><div class="search-box">${icon('search')}<input id="search-input" placeholder="Encontre uma ideia, palavra ou tag…" aria-label="Buscar nas notas"><button class="icon-button" data-action="close" aria-label="Fechar busca">${icon('close')}</button></div><div class="search-results" id="search-results"></div><div class="search-foot">Busque em títulos, conteúdo e tags <span style="float:right"><kbd>Esc</kbd> para fechar</span></div></section></div>`;const result=()=>{const q=$('#search-input').value.toLocaleLowerCase().trim(),ns=vault.notes.filter(n=>(n.title+' '+n.body+' '+n.tags.join(' ')).toLocaleLowerCase().includes(q));$('#search-results').innerHTML=ns.map(n=>`<button class="search-result" data-search-note="${esc(n.id)}">${icon('note')}<span><strong>${esc(n.title)}</strong><small>${esc(n.folder)} · ${esc(n.tags.map(t=>'#'+t).join(' '))}</small></span></button>`).join('')||'<div class="no-results">Nenhuma nota encontrada. Experimente outra palavra.</div>'};$('#search-input').oninput=result;$('#search-input').onkeydown=e=>{if(e.key==='Enter')$('.search-result')?.click();if(e.key==='ArrowDown'){e.preventDefault();$('.search-result')?.focus()}};result();$('#search-input').focus()}
function download(filename,content,type='text/plain;charset=utf-8'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function settings(){modal('Seu espaço, do seu jeito',`<p>Um lugar tranquilo para cuidar das suas ideias.</p><div class="setting-row"><span>Aparência<small>Escolha o seu ritmo visual.</small></span><select id="theme" class="field"><option value="dark" ${vault.theme==='dark'?'selected':''}>Noite tranquila</option><option value="light" ${vault.theme==='light'?'selected':''}>Luz da manhã</option></select></div><div class="setting-row"><span>Seu universo<small>${vault.notes.length} notas em ${vault.folders.length} pastas</small></span><span class="tag-chip">Local</span></div><p>As notas ficam neste navegador e não são sincronizadas entre dispositivos. Exporte uma cópia para guardar ou transferir seu espaço.</p><div class="backup-actions"><button class="plain-button" data-action="backup">${icon('download')}Exportar espaço (.json)</button><button class="plain-button" data-action="import">${icon('upload')}Importar notas</button></div><p style="font-size:10px">Importe arquivos Markdown (.md) ou um espaço Âmago (.json). As notas importadas são adicionadas às suas notas atuais.</p>`);$('#theme').onchange=e=>{vault.theme=e.target.value;persist();render()}}
function noteMenu(){const n=note();modal('Propriedades da nota',`<form id="properties"><label for="prop-folder">Pasta</label><select id="prop-folder" class="field">${vault.folders.map(f=>`<option ${f===n.folder?'selected':''}>${esc(f)}</option>`).join('')}</select><label for="prop-tags">Tags separadas por vírgula</label><input id="prop-tags" class="field" value="${esc(n.tags.join(', '))}" placeholder="ideias, pessoal"><div class="backup-actions"><button class="plain-button" type="button" data-action="export-note">${icon('download')}Exportar Markdown</button><button class="plain-button danger-button" type="button" data-action="delete-note">Excluir nota</button></div><div class="modal-actions"><button class="solid-button">Salvar propriedades</button></div></form>`);$('#properties').onsubmit=e=>{e.preventDefault();n.folder=$('#prop-folder').value;n.tags=[...new Set($('#prop-tags').value.split(',').map(t=>t.trim().replace(/^#/, '')).filter(Boolean))];n.updated=stamp();state.openFolders.add(n.folder);persist();closeModal();render()}}
const actions={new:()=>newNote(),search,settings,'note-menu':noteMenu,close:closeModal,sidebar:()=>document.body.classList.toggle('sidebar-hidden'),favorite:()=>{note().favorite=!note().favorite;persist();render()},edit:()=>{state.mode='edit';renderMain();$('#editor')?.focus()},read:()=>{state.mode='read';persist();renderMain()},daily:()=>{const date=new Date().toLocaleDateString('pt-BR'),title=`Diário · ${date}`,n=findTitle(title);if(n){openNote(n.id);return}if(!vault.folders.includes('Diário'))vault.folders.push('Diário');const created={id:uid(),title,folder:'Diário',tags:['diário'],body:'## Como estou hoje?\n\n\n## O que quero fazer\n\n- [ ] \n\n## Uma coisa para lembrar\n\n',favorite:false,created:stamp(),updated:stamp()};vault.notes.push(created);persist();state.mode='edit';openNote(created.id)},folder:()=>{modal('Uma nova pasta',`<form id="folder-form"><label for="folder-name">Nome da pasta</label><input id="folder-name" class="field" placeholder="Dê um lugar para suas ideias" required maxlength="80"><div class="modal-actions"><button class="solid-button">Criar pasta</button></div></form>`);$('#folder-form').onsubmit=e=>{e.preventDefault();const f=$('#folder-name').value.trim();if(!f)return;if(vault.folders.includes(f)){toast('Essa pasta já existe.');return}vault.folders.push(f);state.openFolders.add(f);persist();closeModal();renderTree()}},backup:()=>{download(`amago-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({format:'amago-v1',...vault},null,2),'application/json');toast('Uma cópia do seu espaço foi exportada.')},import:()=>$('#import-input').click(),'export-note':()=>{const n=note();download(n.title.replace(/[<>:"/\\|?*]/g,'-')+'.md',`# ${n.title}\n\n${n.body}`,'text/markdown;charset=utf-8');toast('Nota exportada em Markdown.')},'delete-note':()=>{const n=note();modal('Excluir esta nota?',`<p>“${esc(n.title)}” será removida deste navegador. Você pode exportá-la antes de continuar.</p><div class="modal-actions"><button class="plain-button" data-action="close">Cancelar</button><button class="solid-button" id="confirm-delete">Excluir nota</button></div>`);$('#confirm-delete').onclick=()=>{vault.notes=vault.notes.filter(x=>x.id!==n.id);state.tabs=state.tabs.filter(id=>id!==n.id);if(!vault.notes.length)vault.notes.push({id:uid(),title:'Um novo começo',folder:vault.folders[0],tags:[],body:'',favorite:false,created:stamp(),updated:stamp()});persist();closeModal();openNote(vault.notes[0].id);toast('Nota excluída.')}}};
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-action],[data-note],[data-folder],[data-mode],[data-view],[data-wiki],[data-heading],[data-close-tab],[data-tag],[data-search-note]');
 if(e.target.classList.contains('modal-backdrop')){closeModal();return}if(!el)return;
 if(el.dataset.closeTab){const id=el.dataset.closeTab;state.tabs=state.tabs.filter(t=>t!==id);if(id===state.id){const next=state.tabs.at(-1)||vault.notes.find(n=>n.id!==id)?.id||id;openNote(next)}else renderTabs();return}
 if(el.dataset.action){actions[el.dataset.action]?.();return}
 if(el.dataset.searchNote){closeModal();openNote(el.dataset.searchNote);return}
 if(el.dataset.note){persist();openNote(el.dataset.note);return}
 if(el.dataset.wiki){const n=findTitle(el.dataset.wiki);n?openNote(n.id):newNote(el.dataset.wiki);return}
 if(el.dataset.folder){state.openFolders.has(el.dataset.folder)?state.openFolders.delete(el.dataset.folder):state.openFolders.add(el.dataset.folder);renderTree();return}
 if(el.dataset.mode){state.mode=el.dataset.mode;persist();renderMain();return}
 if(el.dataset.view){state.view=el.dataset.view;state.tag=null;render();return}
 if(el.dataset.tag){state.tag=el.dataset.tag;state.view='notes';render();return}
 if(el.dataset.heading!==undefined)$('#heading-'+el.dataset.heading)?.scrollIntoView({behavior:'smooth',block:'start'});
});
document.addEventListener('change',e=>{if(e.target.dataset.task!==undefined){const n=note(),lines=n.body.split('\n'),idx=+e.target.dataset.task;lines[idx]=lines[idx].replace(/\[([ xX])\]/,e.target.checked?'[x]':'[ ]');n.body=lines.join('\n');n.updated=stamp();persist();renderMain()}});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeModal();
 if((e.ctrlKey||e.metaKey)&&['k','n','s','e'].includes(e.key.toLowerCase())){e.preventDefault();const k=e.key.toLowerCase();if(k==='k')search();if(k==='n')newNote();if(k==='s'){persist();toast(storageOK?'Tudo salvo neste navegador.':'Falha ao salvar. Exporte uma cópia.')}if(k==='e'){state.mode=state.mode==='read'?'edit':'read';state.view='notes';state.tag=null;render()}}
 if(e.key==='Enter'&&e.target.matches('circle[data-note]'))openNote(e.target.dataset.note);
 if(e.key==='Tab'&&$('.modal')){const els=[...$('.modal').querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled),first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
});
$('#import-input').onchange=async e=>{let count=0,failures=0;for(const file of e.target.files){try{const raw=await file.text();if(file.name.toLowerCase().endsWith('.json')){const data=JSON.parse(raw);if(data.format!=='amago-v1'||!Array.isArray(data.notes))throw Error('format');for(const input of data.notes){if(!input||typeof input.title!=='string'||typeof input.body!=='string')throw Error('note');let title=input.title.trim()||'Nota importada';while(findTitle(title))title+=' (importada)';const folder=typeof input.folder==='string'&&input.folder.trim()?input.folder:'Importadas';if(!vault.folders.includes(folder))vault.folders.push(folder);vault.notes.push({id:uid(),title,body:input.body,folder,tags:Array.isArray(input.tags)?input.tags.filter(t=>typeof t==='string'):[],favorite:!!input.favorite,created:stamp(),updated:stamp()});count++}}else{let title=file.name.replace(/\.(md|markdown|txt)$/i,''),body=raw;const h=raw.match(/^# ([^\r\n]+)\r?\n/);if(h){title=h[1];body=raw.slice(h[0].length).trimStart()}while(findTitle(title))title+=' (importada)';if(!vault.folders.includes('Importadas'))vault.folders.push('Importadas');vault.notes.push({id:uid(),title,body,folder:'Importadas',tags:[],favorite:false,created:stamp(),updated:stamp()});count++}}catch{failures++}}persist();vault.folders.forEach(f=>state.openFolders.add(f));render();toast(`${count} nota(s) importada(s).${failures?' '+failures+' arquivo(s) inválido(s).':''}`);e.target.value=''};
window.addEventListener('pagehide',persist);
$('.brand').onclick=e=>{e.preventDefault();openNote(vault.notes.find(n=>n.id==='welcome')?.id||vault.notes[0].id)};
if(innerWidth<=650)document.body.classList.add('sidebar-hidden');
render();persist();
