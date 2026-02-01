import {BrowserWindow, app, dialog} from 'electron'
import is from 'electron-is'
import {enable} from '@electron/remote/main'
import {autoUpdater} from 'electron-updater'

// 自动管理 window 的状态
export default class AppWindow {
  public win: BrowserWindow
  public closeable = false

  constructor() {
    this.createWindow()
    this.initAutoUpdater()
  }

  private initAutoUpdater() {
    if (is.production()) {
      // 设置自动更新日志
      autoUpdater.logger = {
        info: message => console.log(message),
        warn: message => console.warn(message),
        error: message => console.error(message),
        debug: message => console.debug(message),
      }

      // 检查更新
      autoUpdater.checkForUpdates().catch(error => {
        console.error('更新检查失败:', error)
      })

      // 监听更新事件
      autoUpdater.on('update-available', info => {
        console.log('有可用更新:', info)
        dialog
          .showMessageBox(this.win, {
            type: 'info',
            title: '更新提示',
            message: '发现新版本',
            detail: `当前版本: ${app.getVersion()}\n最新版本: ${info.version}\n\n更新内容:\n${info.releaseNotes || ''}`,
            buttons: ['立即更新', '稍后再说'],
          })
          .then(({response}) => {
            if (response === 0) {
              autoUpdater.downloadUpdate()
            }
          })
      })

      autoUpdater.on('update-not-available', () => {
        console.log('当前已是最新版本')
      })

      autoUpdater.on('update-downloaded', info => {
        console.log('更新下载完成:', info)
        dialog
          .showMessageBox(this.win, {
            type: 'info',
            title: '更新提示',
            message: '更新已下载完成',
            detail: '应用将重启以安装更新',
            buttons: ['立即重启', '稍后重启'],
          })
          .then(({response}) => {
            if (response === 0) {
              autoUpdater.quitAndInstall()
            }
          })
      })

      autoUpdater.on('error', error => {
        console.error('更新错误:', error)
        dialog.showErrorBox('更新错误', `更新过程中发生错误: ${error.message}`)
      })
    }
  }

  // 手动检查更新方法
  public checkForUpdates() {
    if (is.production()) {
      return autoUpdater.checkForUpdates()
    }
    return Promise.resolve()
  }

  private createWindow() {
    this.win = new BrowserWindow({
      width: 1400,
      height: 900,
      show: false,
      webPreferences: {
        webviewTag: true,
        // preload: path.resolve(__dirname, 'preload.js'),
        webSecurity: false, // 不使用网页安全性，跨域
        nodeIntegration: true, // 开启后可在渲染线程 require()
        contextIsolation: false,
      },
    })

    enable(this.win.webContents)

    this.win.on('ready-to-show', () => this.win.show())
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
