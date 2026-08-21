const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const { io } = require('socket.io-client')
const path = require('path')
const { parseUpdate } = require('./parseProtocol.js')

const { Dex } = require('pokemon-showdown')
const ModdedDex = Dex.mod('venova')

const { MOVES, ABILITIES, ITEMS } = require('./loadDictionaries.js');

const isDev = !app.isPackaged

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


app.whenReady().then(() => {
  Menu.setApplicationMenu(null)

  const win = createWindow()

  ipcMain.handle('start-random-battle', async (team) => {

    socket = io('http://localhost:3000')

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id)

      if (team) {
        socket.emit('start-random-battle', team);
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

    return { success: true, message: 'Done' }
  })

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

ipcMain.handle('get-dex-data', async () => {

  let species = ModdedDex.species.all()
  species = species.filter((pkm) => pkm.isNonstandard == null)
  let fakemonOnly = species.filter((pkm) => pkm.num < 0)

  let dexData = fakemonOnly.map((speciesObj) => {

    return {

      name: speciesObj.name,
      num: speciesObj.num * -1,
      abilities: speciesObj.abilities,
      learnset: ModdedDex.data.Learnsets[speciesObj.id].learnset,

    }


  })

  //console.log(ModdedDex.items.get('sitrusberry'))

  const movesById = Object.fromEntries(
    Object.values(MOVES).map((m) => [m.id, m])
  )

  const EXCLUDED_KEYWORDS = ['tera'];

  const filteredItems = Object.fromEntries(
    Object.entries(ITEMS).filter(([name, item]) =>
      item.holdable == true && !EXCLUDED_KEYWORDS.some(keyword => name.includes(keyword))
    )
  );

  return {

    venomon: dexData,
    moves: movesById,
    abilities: ABILITIES,
    items: filteredItems

  }
})
