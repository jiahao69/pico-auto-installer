import path from 'path'
import process from 'process'

import adbBin from '../../../resources/adb/adb.exe?asset&asarUnpack'

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
