import { BrowserWindow } from 'electron'

import { executeCommand } from './utils/execute-command'
import { logger } from './logger'
import { addHistory } from './install-history'
import { getDevices } from './get-devices'

export async function installApp(
  mainWindow: BrowserWindow,
  commands: Array<{ name: string; command: string }>,
  options: FormType
) {
  // 获取所有设备
  const devices = await getDevices()

  for (const device of devices) {
    console.log('当前安装设备:', device.sn)

    for (const item of commands) {
      // 跳过推送地图文件
      if (!options.isUploadMapZip && ['创建地图目录', '推送地图文件'].includes(item.name)) {
        continue
      }

      // 跳过推送OBB文件
      if (
        !options.isUploadOBB &&
        ['推送OBB文件', '推送OBB文件后关闭应用', '推送OBB文件后启动应用'].includes(item.name)
      ) {
        continue
      }

      // 替换命令，使用 -s 指定设备
      const newCommand = item.command.replace(/\badb\b/g, `adb -s ${device.sn}`)

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
          serialno: device.sn,
          packageName: options.packageName,
          status: 'failed'
        })

        logger.error(`${item.name}失败\n${error}`)

        return
      }

      // 添加1s延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // 记录成功历史
    addHistory({
      serialno: device.sn,
      packageName: options.packageName,
      status: 'success'
    })
  }

  mainWindow.webContents.send('electron:install-complete')
}
