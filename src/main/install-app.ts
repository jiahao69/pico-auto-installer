import { BrowserWindow } from 'electron'

import { executeCommand } from './utils/execute-command'
import { logger } from './logger'

export async function installApp(
  mainWindow: BrowserWindow,
  commands: Array<{ name: string; command: string }>,
  options: FormType
) {
  for (const item of commands) {
    // 跳过推送地图文件
    if (!options.isUploadMapZip && ['创建地图文件目录', '推送地图文件'].includes(item.name)) {
      continue
    }

    // 跳过推送OBB文件
    if (
      !options.isUploadOBB &&
      ['推送OBB文件', '推送OBB文件后关闭应用', '推送OBB文件后启动应用'].includes(item.name)
    ) {
      continue
    }

    try {
      mainWindow.webContents.send('electron:execute-start', {
        name: `正在${item.name}`
      })

      await executeCommand(item.command)
    } catch (error: any) {
      mainWindow.webContents.send('electron:execute-fail', {
        name: `${item.name}失败`
      })

      logger.error(`${item.name}失败\n${error}`)

      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  mainWindow.webContents.send('electron:install-complete')
}
