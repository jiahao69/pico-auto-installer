const find = require('local-devices')

// 获取本地网络中的设备
export async function getLocalDevices() {
  const devices = await find()

  return devices
}
