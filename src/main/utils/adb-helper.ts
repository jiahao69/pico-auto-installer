import path from 'path'
import process from 'process'

import adbBin from '../../../resources/adb/adb.exe?asset&asarUnpack'
import { executeCommand } from './execute-command'

// 设置adb环境变量，集成adb
export function setupAdbInPath() {
  const platform = process.platform
  const adbDir = path.dirname(adbBin)

  if (platform === 'win32') {
    process.env.PATH = `${adbDir}${path.delimiter}${process.env.PATH}`
  }
}

// 获取adb版本号
export async function getAdbVersion() {
  const result = await executeCommand('adb version')

  const pattern = /Android Debug Bridge version (\d+\.\d+\.\d+)/
  const version = result.match(pattern)[1]

  return version
}
