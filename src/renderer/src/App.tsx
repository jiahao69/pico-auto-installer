import { useState, useEffect, useCallback } from 'react'
import { message, Tabs } from 'antd'

import './App.less'
import { version } from '../../../package.json'
import { useGetDevicesPolling } from '@/hooks/useGetDevicesPolling'

import DevicesStatus from '@/components/DevicesStatus/DevicesStatus'
import FormContainer from '@/components/FormContainer/FormContainer'
import InstallHistory from '@/components/InstallHistory/InstallHistory'

function App() {
  const [executeResult, setExecuteResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)

  // 轮询获取所有已连接设备
  const { devices } = useGetDevicesPolling()

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer

    // 执行开始
    ipcRenderer.on('electron:execute-start', (_, { name }) => {
      setExecuteResult(name)
    })

    // 执行失败
    ipcRenderer.on('electron:execute-fail', (_, { name }) => {
      setLoading(false)
      setExecuteResult(name)
    })

    // 安装完成
    ipcRenderer.on('electron:install-complete', () => {
      setLoading(false)
      setExecuteResult('安装完成')
    })

    // 打开安装历史弹窗
    ipcRenderer.on('electron:open-install-history', () => {
      setHistoryVisible(true)
    })
  }, [])

  // 点击一键安装
  const onInstallApp = useCallback(
    (values: FormType) => {
      if (!devices.length) {
        message.error('请检查设备是否连接')
        return
      }
      setLoading(true)
      // 执行安装脚本
      window.electron?.ipcRenderer.send('install-app', values)
    },
    [devices.length]
  )

  return (
    <div className="auto-installer-container">
      {/* 设备状态 */}
      <div className="devices-status">
        <DevicesStatus devices={devices} />
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: '安装应用',
            children: (
              <>
                {/* 执行结果 */}
                <div className="execute-result">{executeResult}</div>

                {/* 表单 */}
                <FormContainer loading={loading} onFinish={onInstallApp} />
              </>
            )
          },
          {
            key: '2',
            label: '推送配置文件',
            children: <></>
          },
          {
            key: '3',
            label: '连接局域网设备',
            children: <></>
          }
        ]}
      />

      <div className="version">应用版本：{version}</div>

      {/* 安装历史 */}
      <InstallHistory open={historyVisible} onClose={() => setHistoryVisible(false)} />
    </div>
  )
}

export default App
