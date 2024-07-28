import React from 'react'
import ReactDOMClient from 'react-dom/client'
import {ConfigProvider} from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import {auto} from 'darkreader'

import './index.css'

import App from './App'
import Auth from './Auth'

auto({brightness: 100, contrast: 90, sepia: 10})

const root = ReactDOMClient.createRoot(document.getElementById('root'))
root.render(
  <ConfigProvider locale={zhCN}>
    <Auth />
    <App />
  </ConfigProvider>
)
