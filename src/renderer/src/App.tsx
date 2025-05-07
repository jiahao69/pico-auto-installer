import { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, message, Alert, Tag } from 'antd'
import { LoadingOutlined, FieldTimeOutlined } from '@ant-design/icons'

import './App.less'
import { version } from '../../../package.json'

import MyInput from '@/components/MyInput/MyInput'
import InstallHistory from '@/components/InstallHistory/InstallHistory'
import DeviceStatus from '@/components/DeviceStatus/DeviceStatus'

function App() {
  const [executeResult, setExecuteResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<any[]>([])

  const [successDevices, setSuccessDevices] = useState([])
  const [installingSerialno, setInstallingSerialno] = useState('')
  const [adbVersion, setAdbVersion] = useState('')
  const [historyVisible, setHistoryVisible] = useState(false)

  const [form] = Form.useForm()
  const isUploadOBB = Form.useWatch('isUploadOBB', form)
  const isUploadMapZip = Form.useWatch('isUploadMapZip', form)

  useEffect(() => {
    // 监听electron主进程发送的消息
    window.electron?.ipcRenderer.on('electron:select-file', (_, { id, filePath }) => {
      // 更新表单值
      form.setFieldValue(id, filePath)
      // 触发校验
      form.validateFields([id])
    })

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

    // 获取adb版本号
    window.electron?.ipcRenderer.on('electron:adb-version', (_, { version }) => {
      setAdbVersion(version)
    })

    window.electron?.ipcRenderer.invoke('get-devices').then((devices) => {
      setDevices(devices)
    })
  }, [])

  // 安装应用
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
      <div className="devices-status">
        {/* <Alert
          type={devices.length ? 'success' : 'error'}
          message={
            devices.length
              ? devices.map((device) => (
                  <Tag
                    key={device.sn}
                    icon={
                      installingSerialno === device.sn ? <LoadingOutlined /> : <FieldTimeOutlined />
                    }
                    color={successDevices.includes(device.sn) ? 'success' : 'default'}
                  >
                    {device.sn}
                  </Tag>
                ))
              : '设备未连接'
          }
          showIcon
        /> */}

        <DeviceStatus devices={devices} />
      </div>

      <div className="execute-result">{executeResult}</div>

      <Form<FormType>
        form={form}
        style={{ width: '100%' }}
        onFinish={onInstallApp}
        onFinishFailed={() => {
          message.error('请检查信息是否填写正确')
        }}
      >
        <Form.Item
          initialValue="com.ch.yuanmingyuan.client"
          label="包名"
          name="packageName"
          rules={[{ required: true, message: '请填写包名' }]}
        >
          <Input placeholder="请填写" spellCheck={false} />
        </Form.Item>

        <Form.Item
          label="是否上传地图压缩包"
          name="isUploadMapZip"
          rules={[{ required: true }]}
          initialValue={true}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        {isUploadMapZip && (
          <Form.Item
            initialValue="/Users/congxin/Downloads/YMY/DL.zip"
            label="地图压缩包路径"
            name="mapZipPath"
            rules={[
              {
                required: true,
                message: '请选择zip格式文件',
                pattern: /\.zip$/i
              }
            ]}
          >
            <MyInput placeholder="请选择" />
          </Form.Item>
        )}

        <Form.Item
          initialValue="/Users/congxin/Downloads/YMY/YMY.apk"
          label="APK文件路径"
          name="apkFilePath"
          rules={[
            {
              required: true,
              message: '请选择apk格式文件',
              pattern: /\.apk$/i
            }
          ]}
        >
          <MyInput placeholder="请选择" />
        </Form.Item>

        <Form.Item
          label="是否上传OBB文件"
          name="isUploadOBB"
          rules={[{ required: true }]}
          initialValue={true}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        {isUploadOBB && (
          <Form.Item
            initialValue="/Users/congxin/Downloads/YMY/main.2.com.ch.yuanmingyuan.client.obb"
            label="OBB文件路径"
            name="obbFilePath"
            rules={[
              {
                required: true,
                message: '请选择obb格式文件',
                pattern: /\.obb$/i
              }
            ]}
          >
            <MyInput placeholder="请选择" />
          </Form.Item>
        )}

        <Form.Item
          initialValue="YMYBS"
          label="配置文件目录"
          name="configDir"
          rules={[{ required: true, message: '请填写配置文件目录' }]}
        >
          <Input placeholder="请填写" spellCheck={false} />
        </Form.Item>

        <Form.Item
          initialValue="/Users/congxin/Downloads/YMY/Config"
          label="配置文件夹路径"
          name="configFilePath"
          rules={[{ required: true, message: '请选择文件夹' }]}
        >
          <MyInput placeholder="请选择" openType="openDirectory" />
        </Form.Item>

        <Form.Item
          initialValue="/Users/congxin/Downloads/YMY/Json"
          label="动块文件夹路径"
          name="blockFilePath"
          rules={[{ required: true, message: '请选择文件夹' }]}
        >
          <MyInput placeholder="请选择" openType="openDirectory" />
        </Form.Item>

        <div className="buttons">
          <Button type="primary" htmlType="submit" loading={loading}>
            一键安装
          </Button>

          <Button onClick={() => setHistoryVisible(true)}>安装历史</Button>
        </div>
      </Form>

      <div className="version">
        <span>应用版本：{version}</span>
        <span>内置adb版本：{adbVersion}</span>
      </div>

      <InstallHistory open={historyVisible} onClose={() => setHistoryVisible(false)} />
    </div>
  )
}

export default App
