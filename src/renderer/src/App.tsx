import { useState, useEffect, useCallback } from 'react'
import { message, Tabs, Alert, Button } from 'antd'

import './App.less'
import { version } from '../../../package.json'
import logo from '@/assets/images/logo.png'

import FormContainer from '@/components/FormContainer/FormContainer'
import InstallHistory from '@/components/InstallHistory/InstallHistory'
import DevicesManagement from '@/components/DevicesManagement/DevicesManagement'

const ipcRenderer = window.electron?.ipcRenderer

function App() {
  const [executeResult, setExecuteResult] = useState('未开始')
  const [loading, setLoading] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
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
      setExecuteResult('完成')
    })

    // 打开安装历史弹窗
    ipcRenderer.on('electron:open-install-history', () => {
      setHistoryVisible(true)
    })
  }, [])

  // 点击一键安装
  const onInstallApp = useCallback(async (values: FormType, isPushConfig?: boolean) => {
    const devices: string[] = await ipcRenderer.invoke('get-devices')

    if (!devices.length) {
      message.error('请检查设备是否连接')
      return
    }

    setLoading(true)
    // 执行安装脚本
    ipcRenderer.send('install-app', values, isPushConfig)
  }, [])

  return (
    <div className="auto-installer-container">
      {/* 执行结果 */}
      <div className="execute-result">
        <Alert message={executeResult} type="info" showIcon />
      </div>

      <Tabs
        tabBarExtraContent={{
          right: (
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              设备管理
            </Button>
          )
        }}
        items={[
          {
            key: '1',
            label: '安装应用',
            children: (
              <FormContainer loading={loading} onFinish={(values) => onInstallApp(values)} />
            )
          },
          {
            key: '2',
            label: '推送配置文件',
            children: (
              <FormContainer
                loading={loading}
                isPushConfig={true}
                onFinish={(values) => onInstallApp(values)}
              />
            )
          }
        ]}
      />

      {/* 安装历史 */}
      <InstallHistory
        open={historyVisible}
        onClose={useCallback(() => setHistoryVisible(false), [])}
      />

      {/* 设备管理 */}
      <DevicesManagement
        isModalOpen={isModalOpen}
        onClose={useCallback(() => setIsModalOpen(false), [])}
      />

      <div className="logo">
        <img src={logo} alt="" />
      </div>

      <div className="version">V{version}</div>
    </div>
  )
}

export default App
