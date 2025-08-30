import { BrowserWindow } from 'electron'

import { getDevices } from './utils/get-devices'
import { getCommands } from './get-commands'
import { executeCommand } from './utils/execute-command'
import { addHistory } from './install-history'
import { logger } from './logger'

const pushObbSteps = ['推送OBB文件', '推送OBB文件后关闭应用', '推送OBB文件后启动应用']
const pushConfigSteps = ['创建配置文件目录', '推送配置文件夹', '推送动块文件夹']

export async function install(mainWindow: BrowserWindow, options: FormType, isPushConfig = false) {
  const webContents = mainWindow.webContents
  let successDeviceCount = 0
  let failedDeviceCount = 0

  const commands = getCommands(options)
  const devices = await getDevices()

  for (let i = 0; i < devices.length; i++) {
    let hasError = false
    const device = devices[i]

    for (const item of commands) {
      // 跳过推送OBB文件命令
      if (!options.isUploadOBB && pushObbSteps.includes(item.name)) {
        continue
      }

      // 跳过非推送配置文件命令
      if (isPushConfig && !pushConfigSteps.includes(item.name)) {
        continue
      }

      const newCommand = item.command.replace(/\n/g, '').replace(/\badb\b/g, `adb -s ${device}`)

      try {
        webContents.send('install-message-update', {
          status: 'start',
          message: `第${i + 1}台设备 ${item.name}`
        })

        const result = await executeCommand(newCommand)
        console.log(`第${i + 1}台设备 ${device} ${item.name}\n${result}`)
      } catch (error) {
        webContents.send('install-message-update', {
          status: 'failed',
          message: `第${i + 1}台设备 ${device} ${item.name}失败`
        })

        failedDeviceCount++
        hasError = true

        // 记录失败历史
        addHistory({
          id: device,
          packageName: options.packageName,
          status: 'failed'
        })

        logger.error(`${item.name}失败\n${error}`)

        break
      }
    }

    if (hasError) continue

    successDeviceCount++

    // 记录成功历史
    addHistory({
      id: device,
      packageName: options.packageName,
      status: 'success'
    })
  }

  webContents.send('install-message-update', {
    type: 'complete',
    message: `安装完成 共${devices.length}台设备 成功${successDeviceCount}台 失败${failedDeviceCount}台`
  })
}
