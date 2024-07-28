import {BrowserWindow, getCurrentWindow, session} from '@electron/remote'
import {cookieJar} from '../../common/cookie'
import {config} from '../store/Config'
import project from '../../project.config'

export const login = async () => {
  let parent = getCurrentWindow()
  const bounds = parent.getBounds()
  let win = new BrowserWindow({...bounds, title: '登录'})
  parent.hide()

  let winBounds = null
  win.on('moved', event => (winBounds = event.sender.getBounds()))
  win.on('resized', event => (winBounds = event.sender.getBounds()))
  win.on('closed', () => {
    winBounds && parent.setBounds(winBounds)
    parent.show()
  })
  win.on('closed', () => {
    parent = null
    win = null
    winBounds = null
  })

  await win.loadURL(project.rootUrl + project.page.login)
  await win.webContents.insertCSS('*{visibility:hidden}.p1{visibility:visible}.p1 *{visibility:inherit}')
  const redirectUrl = win.webContents.getURL()
  const redirectOrigin = new URL(redirectUrl).origin

  // 检查 cookies 并更新 config
  const checkCookies = async (electronCookies: Electron.Cookies) => {
    const cookies = await electronCookies.get({})
    const cookie = cookies.find(value => value.name === 'phpdisk_info')
    if (!cookie) return false

    config.update({lanzouUrl: redirectOrigin, cookies: cookies.map(value => ({...value}))})
    win.close()
    return true
  }

  if (await checkCookies(win.webContents.session.cookies)) {
    return
  }

  win.webContents.session.webRequest.onResponseStarted({urls: [redirectOrigin + project.page.home]}, details =>
    checkCookies(details.webContents.session.cookies)
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
