// Read before the first paint so a disabled splash never flashes while the vault loads.
window.amagoStartup=(()=>{
 const key='amago-splash-enabled';
 function setEnabled(enabled){document.documentElement.toggleAttribute('data-splash-disabled',!enabled);try{localStorage.setItem(key,String(enabled))}catch{}}
 try{document.documentElement.toggleAttribute('data-splash-disabled',localStorage.getItem(key)==='false')}catch{}
 return {setEnabled};
})();

// Keep a filesystem operation's confirmation visible until its result is available.
window.addEventListener('keydown',e=>{if(window.amagoOperationBusy&&(e.ctrlKey||e.metaKey||e.key==='Escape')){e.preventDefault();e.stopImmediatePropagation()}},true);
window.addEventListener('click',e=>{if(window.amagoOperationBusy&&(e.target.closest('[data-action="close"]')||e.target.classList.contains('modal-backdrop'))){e.preventDefault();e.stopImmediatePropagation()}},true);
