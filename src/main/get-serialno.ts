import { BrowserWindow } from 'electron'

import { executeCommand } from './utils/execute-command'

export async function getSerialno(mainWindow: BrowserWindow) {
  try {
    const serialno = await executeCommand('adb get-serialno')

    mainWindow.webContents.send('electron:get-serialno', {
      serialno
    })
  } catch (error) {
    mainWindow.webContents.send('electron:get-serialno', {
      serialno: ''
    })
  }
}
