const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const { io } = require('socket.io-client')
const path = require('path')
const { parseUpdate } = require('./utils.js')

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

  //win.webContents.openDevTools()

  return win
}


app.whenReady().then(() => {
  Menu.setApplicationMenu(null)

  const win = createWindow()

  ipcMain.handle('start-random-battle', async () => {

    socket = io('http://localhost:3000')

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id)
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
      console.log('Battle end:', data)
    })


    return { success: true, message: 'Done' }
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})