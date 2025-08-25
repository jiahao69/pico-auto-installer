import { useState, useMemo, useEffect, useCallback } from 'react'
import { message, Alert, Tabs, Button } from 'antd'

import './App.less'
import logo from '@/assets/images/logo.png'
import { version } from '../../../package.json'

import FormContainer from '@/components/FormContainer/FormContainer'
import InstallHistory from '@/components/InstallHistory/InstallHistory'
import DevicesManagement from '@/components/DevicesManagement/DevicesManagement'

const ipcRenderer = window.electron?.ipcRenderer

function App() {
  const [executeResult, setExecuteResult] = useState('未开始')
  const [loading, setLoading] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const TabItems = useMemo(() => {
    return [
      {
        key: '1',
        label: '安装应用',
        children: <FormContainer loading={loading} onFinish={(values) => onInstall(values)} />
      },
      {
        key: '2',
        label: '推送配置文件',
        children: (
          <FormContainer
            loading={loading}
            isPushConfig={true}
            onFinish={(values) => onInstall(values, true)}
          />
        )
      }
    ]
  }, [loading])

  useEffect(() => {
    ipcRenderer.on('electron:install-message', (_, { type, message }) => {
      type !== 'doing' && setLoading(false)
      setExecuteResult(message)
    })

    // 打开安装历史弹窗
    ipcRenderer.on('electron:open-install-history', () => {
      setIsHistoryOpen(true)
    })
  }, [])

  // 点击一键安装
  const onInstall = useCallback(async (values: FormType, isPushConfig?: boolean) => {
    const devices: string[] = await ipcRenderer.invoke('get-devices')

    if (!devices.length) {
      message.error('请检查设备是否连接')
      return
    }

    setLoading(true)
    // 执行安装脚本
    ipcRenderer.send('install', values, isPushConfig)
  }, [])

  return (
    <div className="auto-installer-container">
      {/* 执行结果 */}
      <div className="execute-result">
        <Alert message={executeResult} type="info" showIcon />
      </div>

      <Tabs
        items={TabItems}
        tabBarExtraContent={{
          right: (
            <Button type="primary" onClick={useCallback(() => setIsModalOpen(true), [])}>
              设备管理
            </Button>
          )
        }}
      />

      {/* 安装历史 */}
      <InstallHistory
        open={isHistoryOpen}
        onClose={useCallback(() => setIsHistoryOpen(false), [])}
      />

      {/* 设备管理 */}
      <DevicesManagement
        open={isModalOpen}
        onClose={useCallback(() => setIsModalOpen(false), [])}
      />

      <div className="version">v{version}</div>

      <div className="logo">
        <img src={logo} alt="" />
      </div>
    </div>
  )
}

export default App
