const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const { io } = require('socket.io-client')
const path = require('path')
const { parseUpdate } = require('./parseProtocol.js')
const getTeamFromSaveData = require('./parseGameData.js')

const { getDexData, teamIsValid } = require('./utility.js')

const isDev = !app.isPackaged

let selectedTeam = null;

let socket

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // required
      contextIsolation: true,                      // default true, be explicit
    }
  })

  win.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  )

  win.webContents.openDevTools()

  return win
}

function connectSocket() {
    if (socket) {
        socket.disconnect();
    }
    return io('http://localhost:3000');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)

  const win = createWindow()

  ipcMain.handle('start-private', async (event, pin) => {

    socket = connectSocket();

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id)

      if (selectedTeam != null) {
        const filtered = selectedTeam.filter((pkm) => pkm.species !== '');
        socket.emit('start-private', { pin: pin, team: filtered });
      } else {
        return { success: false, message: 'A team is required' }
      }

    })

    socket.on('battle-update', (data) => {
      // public messages for all players

      parseUpdate(data, win)

    })

    socket.on('sideupdate', (data) => {
      // private messages for player 1 only (choice requests, hidden HP, etc.)
      parseUpdate(data, win)
    })

    socket.on('battle-end', (data) => {
      console.log('Battle end:')
      //console.log('Battle end:', data)
    })

    socket.on('match-started', () => {
      win.webContents.send('matchStarted');
    })

    socket.on('matched', () => {
      win.webContents.send('matched');
    })

    return { success: true, message: 'Done', pin: pin }
  })

  ipcMain.handle('join-private', async (event, pin) => {

    socket = connectSocket();

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id)

      if (selectedTeam != null) {
        const filtered = selectedTeam.filter((pkm) => pkm.species !== '');
        socket.emit('join-private', { pin: pin, team: filtered });
      } else {
        return { success: false, message: 'A team is required' }
      }

    })

    socket.on('match-started', () => {
      win.webContents.send('matchStarted');
    })

    socket.on('matched', () => {
      win.webContents.send('matched');
    })

    socket.on('battle-update', (data) => {
      // public messages for all players

      parseUpdate(data, win)

    })

    socket.on('sideupdate', (data) => {
      // private messages for player 1 only (choice requests, hidden HP, etc.)
      console.log('sideupdate received');
      parseUpdate(data, win)
    })

    socket.on('battle-end', (data) => {
      console.log('Battle end:')
      //console.log('Battle end:', data)
    })

    socket.on('error', (obj) => {
      console.log('Socket disconnected:', obj.message);
      win.webContents.send('error',obj.message);

    });

    return { success: true, message: 'Done' }
  })

  ipcMain.handle('start-random-battle', async () => {

    socket = connectSocket();

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id)

      if (selectedTeam != null) {
        const filtered = selectedTeam.filter((pkm) => pkm.species !== '');
        socket.emit('start-random-battle', filtered);
      } else {
        socket.emit('start-random-battle');
      }

    })

    socket.on('battle-update', (data) => {
      // public messages for all players

      parseUpdate(data, win)

    })

    socket.on('sideupdate', (data) => {
      // private messages for player 1 only (choice requests, hidden HP, etc.)
      parseUpdate(data, win)
    })

    socket.on('battle-end', (data) => {
      console.log('Battle end:')
      //console.log('Battle end:', data)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (obj) => {
      console.log('Socket disconnected:', obj.message);
      win.webContents.send('error',obj.message);

    });

    return { success: true, message: 'Done' }
  })

  ipcMain.handle('leave-battle', async (event) => {
    console.log('Disconnecting socket');
    if (socket) {
        socket.disconnect();
        socket = null; 
    }
    return { success: true };
});

  ipcMain.handle('make-move', async (event, move) => {
    console.log('Making move:', move)
    socket.emit('make-move', move)
    return { success: true, message: 'Done' }
  })

  ipcMain.handle('select-pokemon', async (event, pokemonName) => {
    console.log('Selecting pokemon:', pokemonName)
    socket.emit('select-pokemon', pokemonName)
    return { success: true, message: 'Done' }
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('get-dex-data', getDexData)

ipcMain.handle('set-selected-team', (event, team) => {

  const filtered = team.filter((pkm) => pkm.species !== '');

  if (teamIsValid(filtered)) {

    selectedTeam = team;

    return { success: true, message: 'Team Validated' }

  } else {

    return { success: false, message: 'Invalid team' }

  }

});

ipcMain.handle('get-selected-team', () => {
  return selectedTeam;
});

ipcMain.handle('import-team', () => {
  return getTeamFromSaveData();
});

ipcMain.handle('battle-ui-ready', () => {
    socket?.emit('client-ready');
    return { success: true };
});