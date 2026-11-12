// Read before the first paint so a disabled splash never flashes while the vault loads.
window.amagoStartup=(()=>{
 const key='amago-splash-enabled';
 function setEnabled(enabled){document.documentElement.toggleAttribute('data-splash-disabled',!enabled);try{localStorage.setItem(key,String(enabled))}catch{}}
 try{document.documentElement.toggleAttribute('data-splash-disabled',localStorage.getItem(key)==='false')}catch{}
 return {setEnabled};
})();
