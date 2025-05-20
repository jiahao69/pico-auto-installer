import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import { getCommands } from './get-commands'
import { installApp } from './install-app'
import { setEnvVariable } from './utils/set-env-variable'
import { createTray } from './create-tray'
import { readHistory } from './install-history'
import { getDevices } from './get-devices'
import { killAdbBeforeQuit } from './kill-adb'

// 设置系统UI文字为中文
app.commandLine.appendSwitch('lang', 'zh-CN')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 880,
    height: 760,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 显示文件选择对话框，获取文件路径
  ipcMain.on('show-dialog', async (_, { id, openType }: { id: string; openType: OpenType }) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: [openType]
    })

    // 用户取消选择
    if (canceled) return

    mainWindow.webContents.send('electron:select-file', {
      id,
      filePath: filePaths[0]
    })
  })

  // 安装应用
  ipcMain.on('install-app', (_, options: FormType) => {
    const commands = getCommands(options)

    installApp(mainWindow, commands, options)
  })

  // 获取安装历史
  ipcMain.handle('get-install-history', () => {
    return readHistory()
  })

  ipcMain.handle('get-devices', async () => {
    const devices = await getDevices()

    return devices
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 创建窗口
  const mainWindow = createWindow()

  // 设置adb环境变量
  setEnvVariable()

  // 创建系统托盘
  createTray(mainWindow)

  // 关闭应用前杀死adb进程
  killAdbBeforeQuit()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
