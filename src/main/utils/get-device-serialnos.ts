import { executeCommand } from './execute-command'

// 返回格式示例
// List of devices attached
// PA9410MGJ9090995G	device

// 获取所有已连接设备
export async function getDevices() {
  const devices = (await executeCommand('adb devices'))
    // 通过换行符分割
    .split('\n')
    // 去除第一行标题
    .slice(1)
    // 去除离线设备和行尾空行
    .filter((line) => line.includes('device') && line)
    // 提取设备序列号
    .map((line) => line.split('\t')[0])
    .map((sn) => ({ sn, status: 'waiting' }))

  return devices
}
