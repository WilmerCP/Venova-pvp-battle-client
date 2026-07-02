const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {

    startRandomBattle: () => ipcRenderer.invoke('start-random-battle'),
    onPlayer: (cb) => ipcRenderer.on('player', (event, data) => cb(data)),
    offPlayer: () => ipcRenderer.removeAllListeners('player'),
    onSwitch: (cb) => ipcRenderer.on('switch', (event, data) => cb(data)),
    offSwitch: () => ipcRenderer.removeAllListeners('switch'),
    onTeam: (cb) => ipcRenderer.on('team', (event, data) => cb(data)),
    offTeam: () => ipcRenderer.removeAllListeners('team'),
    makeMove: (move) => ipcRenderer.invoke('make-move', move),
    onForceSwitch: (cb) => ipcRenderer.on('forceSwitch',(event,data)=>cb(data)),
    offForceSwitch: () => ipcRenderer.removeAllListeners('forceSwitch'),
    onWait: (cb) => ipcRenderer.on('wait',(event,data)=>cb(data)),
    offWait: () => ipcRenderer.removeAllListeners('wait'),
    onFaint: (cb) => ipcRenderer.on('faint',(event,data)=>cb(data)),
    offFaint: () => ipcRenderer.removeAllListeners('faint'),
    onMove: (cb) => ipcRenderer.on('move',(event,data)=>cb(data)),
    offMove: () => ipcRenderer.removeAllListeners('move'),
    onDamage: (cb) => ipcRenderer.on('damage',(event,data)=>cb(data)),
    offDamage: () => ipcRenderer.removeAllListeners('damage'),
    onStatus: (cb) => ipcRenderer.on('status',(event,data)=>cb(data)),
    offStatus: () => ipcRenderer.removeAllListeners('status'),
    onHeal: (cb) => ipcRenderer.on('heal',(event,data)=>cb(data)),
    offHeal: () => ipcRenderer.removeAllListeners('heal'),


});