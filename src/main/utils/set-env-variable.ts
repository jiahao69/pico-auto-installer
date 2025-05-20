import { dirname, delimiter } from 'path'
import process from 'process'

import adbBin from '../../../resources/adb/adb.exe?asset&asarUnpack'

// 设置环境变量
export function setEnvVariable(binPath = adbBin) {
  const platform = process.platform

  // 获取可执行文件所在目录
  const binDir = dirname(binPath)

  if (platform === 'win32') {
    process.env.PATH = `${binDir}${delimiter}${process.env.PATH}`
  }
}
