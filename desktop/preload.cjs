const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('amagoDesktop',{load:()=>ipcRenderer.invoke('vault:load'),save:data=>ipcRenderer.invoke('vault:save',data),openDataFolder:()=>ipcRenderer.invoke('vault:folder'),appearance:value=>ipcRenderer.invoke('appearance:set',value),windowControl:command=>ipcRenderer.invoke('window:control',command)});
