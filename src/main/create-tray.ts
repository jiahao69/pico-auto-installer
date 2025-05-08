import { BrowserWindow, app, Tray, Menu, nativeImage, shell } from 'electron'
import { join } from 'path'

import appIcon from '../../build/icon.png?asset'

const userDataPath = app.getPath('userData')
const logPath = join(userDataPath, 'logs')

// 创建系统托盘
export function createTray(mainWindow: BrowserWindow) {
  const tray = new Tray(nativeImage.createFromPath(appIcon))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开日志目录',
      type: 'normal',
      click: () => {
        shell.openPath(logPath)
      }
    },
    {
      label: '打开安装历史',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('electron:open-install-history')
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  return tray
}
