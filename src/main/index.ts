import is from 'electron-is'
import {app, Menu, nativeImage, session, Tray} from 'electron'
import {initialize} from '@electron/remote/main'
import path from 'path'

import {safeUserAgent} from './util'
import AppWindow from './AppWindow'

initialize()

const isDev = is.dev()

let main: AppWindow

if (!isDev && !app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('ready', () => {
  initUA()

  createWindow()
  initTray()
  initEvents()

  load()
})

function initUA() {
  const ua = session.defaultSession.getUserAgent()
  const userAgent = safeUserAgent(ua)
  session.defaultSession.setUserAgent(userAgent)
}

function initTray() {
  if (!is.macOS()) {
    const icon = isDev
      ? path.join(__dirname, '..', '..', '..', 'public', 'icon.png')
      : path.join(__dirname, '..', 'icon.png')
    const image = nativeImage.createFromPath(icon)
    const tray = new Tray(image)
    tray.setToolTip('蓝奏云盘')

    const contextMenu = Menu.buildFromTemplate([
      // {label: '显示蓝奏云盘', click: this.showWindow},
      {label: '显示蓝奏云盘', click: main.showWindow},
      {label: '退出', click: () => app.quit()},
    ])
    tray.on('click', main.showWindow)
    tray.setContextMenu(contextMenu)
  }
}

function initEvents() {
  if (is.production()) {
    // 与单一实例锁关联
    app.on('second-instance', main.showWindow)
  }
  app.on('activate', () => {
    if (!main) {
      createWindow()
    } else if (!main.win.isVisible()) {
      main.win.show()
    }
  })
  app.on('before-quit', () => {
    if (main) {
      main.closeable = true
    }
  })
}

function createWindow() {
  if (main && !main.win?.isDestroyed()) {
    main.destroy()
  }

  main = new AppWindow()
  return main
}

const loadURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '..', 'index.html')}`
async function load() {
  await main.win.loadURL(loadURL)
  if (isDev) {
    main.win.webContents.openDevTools({mode: 'bottom'})
  }
}
