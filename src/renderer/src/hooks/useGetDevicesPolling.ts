import { useState, useEffect } from 'react'

// 轮询获取所有已连接设备
export function useGetDevicesPolling(delay = 1000) {
  const [devices, setDevices] = useState<Devices[]>([])

  useEffect(() => {
    window.electron?.ipcRenderer.invoke('get-devices').then((devices: Devices[]) => {
      setDevices(devices)
    })

    const timer = setInterval(() => {
      window.electron?.ipcRenderer.invoke('get-devices').then((devices: Devices[]) => {
        setDevices(devices)
      })
    }, delay)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return { devices }
}
