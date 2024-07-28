import React, {PropsWithChildren} from 'react'
import {observer} from 'mobx-react'
import {Button} from 'antd'

import {config} from '../store/Config'
import {MyIcon} from '../component/Icon'
import {login} from '../utils/app'

const AuthWrapper = observer<React.FC<PropsWithChildren<any>>>(props => {
  const isLogin = config.isLogin
  const isComplete = config.isComplete

  if (isComplete) return props.children
  if (isLogin) return <Loading />

  return (
    <div className={'flex flex-row h-full justify-center items-center'}>
      <MyIcon iconName={'wangpan'} className={'text-6xl'} />
      <Button size={'large'} type={'primary'} onClick={login} className={'m-5 mr-10'}>
        账号登录
        <MyIcon iconName={'submit-arrow'} className={'text-2xl -mr-1'} />
      </Button>
    </div>
  )
})

export default AuthWrapper

function Loading() {
  return (
    <div className={'flex flex-col flex-1 justify-center items-center h-full'}>
      <MyIcon iconName={'empty'} style={{width: 100, height: 100}} />
      <span>配置加载中...</span>
    </div>
  )
}
