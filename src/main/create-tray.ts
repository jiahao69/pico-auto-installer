import { app, Tray, nativeImage, Menu, shell } from 'electron'
import { join } from 'path'

import appIcon from '../../build/icon.png?asset'

// 创建系统托盘
export function createTray() {
  const tray = new Tray(nativeImage.createFromPath(appIcon))

  const userDataPath = app.getPath('userData')
  const logPath = join(userDataPath, 'logs')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开日志目录',
      type: 'normal',
      click: () => {
        shell.openPath(logPath)
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  return tray
}
