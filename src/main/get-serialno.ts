import { BrowserWindow } from 'electron'

import { executeCommand } from './utils/execute-command'

export async function getSerialno(mainWindow: BrowserWindow) {
  let serialno = ''

  try {
    serialno = (await executeCommand('adb get-serialno')) as string
  } catch (err) {
    serialno = ''
  }

  mainWindow.webContents.send('electron:get-serialno', {
    serialno
  })
}
