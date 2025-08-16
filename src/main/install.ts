import { BrowserWindow } from 'electron'

import { getDevices } from './utils/get-devices'
import { getCommands } from './get-commands'
import { executeCommand } from './utils/execute-command'
import { addHistory } from './install-history'
import { logger } from './logger'

export async function install(
  mainWindow: BrowserWindow,
  options: FormType,
  isPushConfig?: boolean
) {
  const webContents = mainWindow.webContents

  // 获取已连接设备
  const devices = await getDevices()
  // 获取命令列表
  const commands = getCommands(options)

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
        webContents.send('electron:install-message', {
          type: 'doing',
          message: `正在${item.name}`
        })

        await executeCommand(newCommand)
      } catch (error) {
        webContents.send('electron:install-message', {
          type: 'fail',
          message: `${item.name}失败`
        })

        // 记录失败历史
        addHistory({
          id: device,
          packageName: options.packageName,
          status: 'fail'
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

  webContents.send('electron:install-message', {
    type: 'complete',
    message: '完成'
  })
}
