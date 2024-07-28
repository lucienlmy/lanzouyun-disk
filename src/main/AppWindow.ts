import {BrowserWindow} from 'electron'
import is from 'electron-is'
import {enable} from '@electron/remote/main'

// 自动管理 window 的状态
export default class AppWindow {
  public win: BrowserWindow
  public closeable = false

  constructor() {
    this.createWindow()
  }

  private createWindow() {
    this.win = new BrowserWindow({
      width: 1400,
      height: 900,
      autoHideMenuBar: true,
      webPreferences: {
        webviewTag: true,
        // preload: path.resolve(__dirname, 'preload.js'),
        webSecurity: false, // 不使用网页安全性，跨域
        nodeIntegration: true, // 开启后可在渲染线程 require()
        contextIsolation: false,
      },
    })

    enable(this.win.webContents)

    this.win.on('closed', () => (this.win = null))
    this.win.on('close', event => {
      if (!this.closeable) {
        event.preventDefault()
        this.hideWindow()
      }
    })
  }

  public destroy() {
    this.win.destroy()
  }

  public hideWindow = () => {
    // Mac 在全屏状态下隐藏，会出现黑屏情况，做特殊处理
    if (is.macOS()) {
      if (this.win.isFullScreen()) {
        this.win.once('leave-full-screen', () => this.win.hide())
        this.win.setFullScreen(false)
        return
      }
    }
    if (this.win.isVisible()) {
      this.win.hide()
    }
  }

  public showWindow = () => {
    if (!this.win.isVisible()) {
      this.win.show()
    }
    if (this.win.isMinimized()) {
      this.win.restore()
    }
    if (!this.win.isFocused()) {
      this.win.focus()
    }
  }
}
