import {configure} from 'mobx'
import {create} from 'mobx-persist'
import {nativeTheme, app} from '@electron/remote'

import {Upload} from './Upload'
import {Download} from './Download'
import {TaskStatus} from './AbstractTask'
import {config} from './Config'
import {UploadTask} from './task/UploadTask'
import {DownloadTask} from './task/DownloadTask'
import {finish} from './Finish'
import {SyncTask} from './task/SyncTask'

configure({
  enforceActions: 'never',
})

export const hydrate = create({
  storage: localStorage,
  debounce: 200,
})

export const upload = new Upload()
export const download = new Download()

function makePause<T extends {tasks: {status: TaskStatus}[]}>(task: T) {
  task.tasks.forEach(task => {
    if (task.status === TaskStatus.pending) {
      task.status = TaskStatus.pause
    }
    return task
  })
  return task
}

// 合理做法：合并完再初始化的，但目前没遇到什么问题
hydrate('download', download, (window as any).__STATE__?.download).then(value => {
  value.list = value.list.map(item => {
    const task = makePause(item)
    return new DownloadTask(task)
  })
})
hydrate('upload', upload, (window as any).__STATE__?.upload).then(value => {
  value.list = value.list.map(item => {
    const task = makePause(item)
    return new UploadTask(task)
  })
})

hydrate('config', config, (window as any).__STATE__?.config).then(async value => {
  if (!value.downloadDir) {
    value.downloadDir = app.getPath('downloads')
  }

  // 同步软件外观
  if (!value.themeSource) {
    value.themeSource = nativeTheme.themeSource
  } else if (value.themeSource !== nativeTheme.themeSource) {
    nativeTheme.themeSource = value.themeSource
  }
})

hydrate('finish', finish, (window as any).__STATE__?.finish).then(value => {
  value.downloadList = value.downloadList.map(item => new DownloadTask(item))
  value.uploadList = value.uploadList.map(item => new UploadTask(item))
  value.syncList = value.syncList.map(item => new SyncTask(item))
})
