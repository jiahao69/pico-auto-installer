import { app } from 'electron'

import { executeCommand } from './utils/execute-command'

export function killAdb() {
  app.on('before-quit', async () => {
    if (process.platform === 'win32') {
      try {
        await executeCommand('adb kill-server')
      } catch (err) {
        // 正常关闭adb服务失败，强制终止adb.exe
        await executeCommand('taskkill /F /IM adb.exe')
      }
    }
  })
}
