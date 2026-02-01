import {useEffect, useState} from 'react'
import is from 'electron-is'

import * as http from '../../common/http'
import gt from 'semver/functions/gt'
import pkg from '../../../package.json'

export interface LatestRelease {
  tag_name: string // tag
  html_url: string // release 地址
  body: string // 发布信息
}

export function useLatestRelease() {
  const [latestVersion, setLatestVersion] = useState<LatestRelease>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkUpdate = async () => {
    setLoading(true)
    setError(null)
    try {
      const value = await http.share
        .get('https://api.github.com/repos/chenhb23/lanzouyun-disk/releases/latest')
        .json<LatestRelease>()
      if (value && gt(value.tag_name, pkg.version)) {
        setLatestVersion(value)
      } else {
        setLatestVersion(null)
      }
    } catch (err) {
      console.error('检查更新失败:', err)
      setError('检查更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (is.production()) {
      checkUpdate()
    }
  }, [])

  return {latestVersion, loading, error, checkUpdate}
}
