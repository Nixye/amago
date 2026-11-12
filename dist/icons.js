'use strict';
// Orbit glyphs: a consistent 24px grid, open geometry, 1.65px strokes.
const orbitGlyphs={
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-7h6v7"/>',
core:'<path d="m12 3 8 9-8 9-8-9Z"/><path d="m12 3 3 9-3 9-3-9ZM4 12h16"/>',
note:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/>',
folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l3 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M3 10h18"/>',
'folder-open':'<path d="M3 10V5a1 1 0 0 1 1-1h5l3 3h7a1 1 0 0 1 1 1v2M3 20l3-9h16l-3 9ZM3 20V10"/>',
'folder-plus':'<path d="M3 8V5a1 1 0 0 1 1-1h5l3 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M12 11v6M9 14h6"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
layers:'<path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
graph:'<path d="m6 11 9-5M7 14l9 4m1-10 1 8"/><circle cx="4.5" cy="12.5" r="3"/><circle cx="17" cy="5" r="3"/><circle cx="19" cy="19" r="3"/>',
settings:'<path d="M4 6h16M4 12h16M4 18h16"/><path d="M8 3v6M16 9v6M10 15v6"/>',
check:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7"/>',
trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
history:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v5l3 2"/>',
refresh:'<path d="M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5M4 17a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>',
collapse:'<path d="M6 3H3v18h3M10 8l4 4 4-4M10 16h8"/>',
save:'<path d="M4 3h13l4 4v14H3V4a1 1 0 0 1 1-1Z"/><path d="M7 3v6h10V3M7 21v-7h10v7M14 5v2"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5M17 3v5M3 11h18M8 15h1M15 15h1M8 18h1"/>',
edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>',
star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="M19 3v3M17.5 4.5h3"/>',
link:'<path d="m10 14 4-4M8 16l-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0m2 6a3 3 0 0 0 4 0l4-4a3 3 0 0 0-4-4l-1 1"/>',
panel:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16M6 8v3"/>',
tag:'<path d="M3 3h9l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
};
for(const [name,paths] of Object.entries(orbitGlyphs)){let symbol=document.getElementById('i-'+name);if(!symbol){symbol=document.createElementNS('http://www.w3.org/2000/svg','symbol');symbol.id='i-'+name;symbol.setAttribute('viewBox','0 0 24 24');document.querySelector('.sprite defs').append(symbol)}symbol.innerHTML=paths}
document.querySelector('.brand-mark')?.replaceWith(Object.assign(document.createElement('img'),{src:'assets/amago-mark.svg',alt:'',className:'brand-logo'}));
const caption=document.querySelector('.window-caption>span:first-child');if(caption)caption.innerHTML='<img src="assets/amago-mark.svg" width="20" height="20" alt="">';
