const { app, BrowserWindow, Menu } = require('electron')

const isDev = !app.isPackaged

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

 win.loadURL(
  isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`
)
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})