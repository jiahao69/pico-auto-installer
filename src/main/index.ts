import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import find from 'local-devices'

import { executeCommand } from './utils/execute-command'
import { getDevices } from './utils/get-devices'
import { readHistory } from './install-history'
import { getCommands } from './get-commands'
import { installApp } from './install-app'
import { setEnvVariable } from './utils/set-env-variable'
import { createTray } from './create-tray'

// 设置系统UI文字为中文
app.commandLine.appendSwitch('lang', 'zh-CN')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 880,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 点击选择按钮触发
  ipcMain.handle('select-file', async (_, openType) => {
    // 显示文件选择对话框
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: [openType]
    })

    // 用户取消选择
    if (canceled) return

    // 返回文件路径
    return filePaths[0]
  })

  // 执行渲染进程发送的命令
  ipcMain.handle('execute-command', async (_, command: string) => {
    try {
      const result = await executeCommand(command)
      console.log(result)
    } catch (err) {
      console.log(err)
    }
  })

  // 获取已连接设备
  ipcMain.handle('get-devices', async () => {
    const devices = await getDevices()

    return devices
  })

  // 获取本地设备
  ipcMain.handle('get-local-devices', async () => {
    // skipNameResolution 跳过名称解析，提升性能
    const devices = await find({ skipNameResolution: true })

    return devices
  })

  // 获取安装历史
  ipcMain.handle('get-install-history', () => readHistory())

  // 安装应用
  ipcMain.on('install-app', (_, options: FormType, isPushConfig: boolean) => {
    const commands = getCommands(options)

    installApp(mainWindow, commands, options, isPushConfig)
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

  // 设置环境变量
  setEnvVariable()

  // 创建系统托盘
  createTray(mainWindow)

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
