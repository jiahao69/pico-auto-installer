import path from 'path'
import process from 'process'

import adbBin from '../../../resources/adb/adb.exe?asset&asarUnpack'
import { executeCommand } from './execute-command'

// 设置adb环境变量
export function setupAdbInPath() {
  const platform = process.platform
  // 获取adb文件所在目录
  const adbDir = path.dirname(adbBin)

  // 在windows平台设置环境变量，忽略其他平台
  if (platform === 'win32') {
    process.env.PATH = `${adbDir}${path.delimiter}${process.env.PATH}`
  }
}

// 获取adb版本号
export async function getAdbVersion() {
  const versionInfo = await executeCommand('adb version')

  // 在版本信息中截取版本号
  const pattern = /Android Debug Bridge version (\d+\.\d+\.\d+)/
  const version = versionInfo.match(pattern)?.[1] || ''

  return version
}
