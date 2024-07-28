import {useEffect} from 'react'
import {observer} from 'mobx-react'
import {Cookie} from 'tough-cookie'

import {config} from './store/Config'
import {cookieJar} from '../common/cookie'
import {profile} from '../common/core/profile'

const Auth = observer(() => {
  const isLogin = config.isLogin

  useEffect(() => {
    if (isLogin) {
      const init = async () => {
        await Promise.all(
          config.cookies.map(({name, expirationDate, ...cookie}) => {
            return cookieJar.setCookie(
              Cookie.fromJSON({
                ...cookie,
                key: name,
                ...(expirationDate ? {expires: new Date(expirationDate * 1000)} : {}),
              }),
              (cookie.secure ? 'https://' : 'http://') + cookie.domain.replace(/^\./, '') + cookie.path,
              {ignoreError: true}
            )
          })
        )
        const info = await profile()
        config.update(info)
      }
      init()
    }
  }, [isLogin])

  return null
})

export default Auth
