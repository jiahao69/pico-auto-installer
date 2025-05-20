import { useState, useEffect } from 'react'
import { message } from 'antd'

import './App.less'
import { version } from '../../../package.json'
import { useGetDevicesPolling } from '@/hooks/useGetDevicesPolling'

import DeviceStatus from '@/components/DeviceStatus/DeviceStatus'
import FormContainer from '@/components/FormContainer/FormContainer'
import InstallHistory from '@/components/InstallHistory/InstallHistory'

function App() {
  const [executeResult, setExecuteResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)

  // 轮询获取所有已连接设备
  const { devices } = useGetDevicesPolling()

  useEffect(() => {
    // 执行开始
    window.electron?.ipcRenderer.on('electron:execute-start', (_, { name }) => {
      setExecuteResult(name)
    })

    // 执行失败
    window.electron?.ipcRenderer.on('electron:execute-fail', (_, { name }) => {
      setLoading(false)
      setExecuteResult(name)
    })

    // 安装完成
    window.electron?.ipcRenderer.on('electron:install-complete', () => {
      setLoading(false)
      setExecuteResult('安装完成')
    })

    // 打开安装历史
    window.electron?.ipcRenderer.on('electron:open-install-history', () => {
      setHistoryVisible(true)
    })
  }, [])

  // 点击一键安装
  const onInstallApp = (values: FormType) => {
    if (!devices.length) {
      message.error('请检查设备是否连接')
      return
    }

    setLoading(true)
    // 执行安装脚本
    window.electron?.ipcRenderer.send('install-app', values)
  }

  return (
    <div className="auto-installer-container">
      {/* 设备状态 */}
      <div className="devices-status">
        <DeviceStatus devices={devices} />
      </div>

      {/* 执行结果 */}
      <div className="execute-result">{executeResult}</div>

      {/* 表单 */}
      <FormContainer loading={loading} onFinish={onInstallApp} />

      <div className="version">应用版本：{version}</div>

      {/* 安装历史 */}
      <InstallHistory open={historyVisible} onClose={() => setHistoryVisible(false)} />
    </div>
  )
}

export default App
