import {makeAutoObservable, computed} from 'mobx'
import {persist} from 'mobx-persist'

type BaseProps<T> = Partial<Pick<T, {[P in keyof T]: T[P] extends (...args: any) => any ? never : P}[keyof T]>>

export class Config {
  @computed get isLogin() {
    return !!this.cookies.find(value => value.name === 'phpdisk_info')
  }

  // 是否完成配置文件的获取，包括用户信息，接口信息
  @computed get isComplete() {
    return this.isLogin && !!this.more?.url
  }

  // *** 网络配置 start ***
  @persist('list') cookies: Electron.Cookie[] = []
  @persist domain = '' // https://wwn.lanzouf.com

  // 解决文件上传问题
  @persist referer = ''
  @persist lastLogin = '' // "2022-04-23 21:03:29"
  // @persist('list') supportList: string[] = [] // ['tar']
  @persist verification = '' // 188****8888
  @persist maxSize = '100m' // Math.floor(100000000 / 1024 / 1024) // 100M
  @persist('object') more = {
    url: '',
    data: {vei: ''},
  }
  // 设置 prefixUrl
  @persist lanzouUrl = ''
  // *** 网络配置 end ***

  // *** 本地配置 start ***
  splitSize = '100m'

  // cookie 和 uag 匹配即可请求成功
  @persist userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.204 Safari/537.36'

  // 是否默认此地址为下载路径
  @persist setDefaultDownloadDir = false

  // 文件下载位置
  @persist downloadDir = ''

  // 主题
  @persist themeSource: Electron.NativeTheme['themeSource']

  // 同时上传/下载数量
  @persist uploadMax = 1
  @persist downloadMax = 2

  // 上传流量警戒线
  @persist uploadWarningSize = 7 // 单位 G
  @persist uploadWarningEnabled = true
  // *** 本地配置 end ***

  constructor() {
    makeAutoObservable(this)
  }

  // update 过滤空项
  update(data: BaseProps<Config>) {
    // delete data.maxSize
    data = Object.keys(data).reduce((prev, key) => (data[key] ? {...prev, [key]: data[key]} : prev), {})
    if (Object.keys(data).length) {
      Object.assign(this, data)
    }
  }

  clear() {
    this.cookies = []
    this.domain = ''
    this.referer = ''
    this.lastLogin = ''
    this.verification = ''
    this.more = {url: '', data: {vei: ''}}
  }

  // set(data: BaseProps<Config>) {
  //   Object.assign(this, data)
  // }
}

export const config = new Config()
