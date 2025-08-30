import fs from 'fs'

import { executeCommand } from './execute-command'

/**
 * 获取本地文件大小（字节）
 */
export function getLocalFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    console.error('获取本地文件大小失败:', error)
    return 0
  }
}

/**
 * 获取设备上文件大小（字节）
 */
export async function getDeviceFileSize(device: string, remoteFilePath: string): Promise<number> {
  try {
    const command = `adb -s ${device} shell stat -c %s "${remoteFilePath}"`
    const result = await executeCommand(command)
    const size = parseInt(result.trim())
    return isNaN(size) ? 0 : size
  } catch (error) {
    console.error('获取设备文件大小失败:', error)
    return 0
  }
}

/**
 * 计算文件传输进度百分比
 */
export function calculateFileProgress(localSize: number, deviceSize: number): number {
  if (localSize === 0) return 0
  return Math.min(Math.round((deviceSize / localSize) * 100), 100)
}
