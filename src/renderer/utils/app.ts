import {BrowserWindow, getCurrentWindow, session} from '@electron/remote'
import {cookieJar} from '../../common/cookie'
import {config} from '../store/Config'
import project from '../../project.config'

export const login = async () => {
  let parent = getCurrentWindow()
  const bounds = parent.getBounds()
  const uag = parent.webContents.getUserAgent()

  let win = new BrowserWindow({...bounds, title: '登录'})
  parent.hide()

  let winBounds = null
  win.on('moved', event => event.sender && (winBounds = event.sender.getBounds()))
  win.on('resized', event => event.sender && (winBounds = event.sender.getBounds()))
  win.on('closed', () => {
    winBounds && parent.setBounds(winBounds)
    parent.show()
  })
  win.on('closed', () => {
    parent = null
    win = null
    winBounds = null
  })

  await win.loadURL(project.rootUrl + project.page.login, {userAgent: uag})
  await win.webContents.insertCSS('*{visibility:hidden}.p1{visibility:visible}.p1 *{visibility:inherit}')

  // 检查 cookies 并更新 config
  const checkCookies = async (webContents: Electron.WebContents) => {
    const cookies = await webContents.session.cookies.get({})
    const cookie = cookies.find(value => value.name === 'phpdisk_info')
    if (!cookie) return false

    // ** 蓝奏云的 cookie 参数 uag 是根据登录窗口的 user-agent 来生成的，防止模拟请求，
    // ** 所以各窗口和请求工具的 user-agent 要保持一致
    const userAgent = webContents.getUserAgent()
    const origin = new URL(webContents.getURL()).origin
    config.update({
      userAgent,
      lanzouUrl: origin,
      cookies: cookies.map(value => ({...value})),
    })
    win.close()
    return true
  }

  if (await checkCookies(win.webContents)) {
    return
  }

  win.webContents.session.webRequest.onResponseStarted({urls: [`*://*${project.page.home}`]}, details =>
    checkCookies(details.webContents)
  )
}

export const logout = async () => {
  const cookies = await session.defaultSession.cookies.get({})
  await session.defaultSession.clearStorageData({storages: ['localstorage']})
  const cookieNames = ['phpdisk_info']
  const cookie = cookies.filter(value => cookieNames.includes(value.name))
  if (cookie.length) {
    await Promise.all(
      cookie.map(value => {
        const url = (value.secure ? 'https://' : 'http://') + value.domain.replace(/^\./, '') + value.path
        return session.defaultSession.cookies.remove(url, value.name)
      })
    )
    await cookieJar.removeAllCookies()
    config.clear()
  }
}
