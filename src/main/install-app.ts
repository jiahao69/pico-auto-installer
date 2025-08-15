import { BrowserWindow } from 'electron'

import { executeCommand } from './utils/execute-command'
import { logger } from './logger'
import { addHistory } from './install-history'
import { getDevices } from './utils/get-devices'

export async function installApp(
  mainWindow: BrowserWindow,
  commands: Array<{ name: string; command: string }>,
  options: FormType,
  isPushConfig?: boolean
) {
  // 获取已连接设备
  const devices = await getDevices()

  for (const device of devices) {
    for (const item of commands) {
      // 跳过推送OBB文件
      if (
        !options.isUploadOBB &&
        ['推送OBB文件', '推送OBB文件后关闭应用', '推送OBB文件后启动应用'].includes(item.name)
      ) {
        continue
      }

      // 跳过非推送配置文件命令
      if (
        isPushConfig &&
        !['创建配置文件目录', '推送配置文件夹', '推送动块文件夹'].includes(item.name)
      ) {
        continue
      }

      // 替换命令，使用 -s 指定设备
      const newCommand = item.command.replace(/\badb\b/g, `adb -s ${device}`)

      try {
        mainWindow.webContents.send('electron:execute-start', {
          name: `正在${item.name}`
        })

        await executeCommand(newCommand)
      } catch (error: any) {
        mainWindow.webContents.send('electron:execute-fail', {
          name: `${item.name}失败`
        })

        // 记录失败历史
        addHistory({
          id: device,
          packageName: options.packageName,
          status: 'failed'
        })

        logger.error(`${item.name}失败\n${error}`)

        return
      }
    }

    // 记录成功历史
    addHistory({
      id: device,
      packageName: options.packageName,
      status: 'success'
    })
  }

  mainWindow.webContents.send('electron:install-complete')
}
