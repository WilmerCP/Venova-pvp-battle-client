const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {

    startRandomBattle: () => ipcRenderer.invoke('start-random-battle'),
    onPlayer: (cb) => ipcRenderer.on('player', (event, data) => cb(data)),
    offPlayer: () => ipcRenderer.removeAllListeners('player'),
    onSwitch: (cb) => ipcRenderer.on('switch', (event, data) => cb(data)),
    offSwitch: () => ipcRenderer.removeAllListeners('switch'),
    onTeam: (cb) => ipcRenderer.on('team', (event, data) => cb(data)),
    offTeam: () => ipcRenderer.removeAllListeners('team'),

});