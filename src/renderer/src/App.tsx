import { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd'

import './App.less'

import MyInput from '@/components/MyInput/MyInput'

function App() {
  const [executeResult, setExecuteResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [serialno, setSerialno] = useState('')

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

    // 获取设备序列号
    window.electron?.ipcRenderer.on('electron:get-serialno', (_, { serialno }) => {
      setSerialno(serialno)
    })
  }, [])

  // 安装应用
  const onInstallApp = (values: FormType) => {
    if (!serialno) {
      message.error('请检查设备是否连接')
      return
    }

    setLoading(true)
    // 执行安装脚本
    window.electron?.ipcRenderer.send('install-app', values)
  }

  return (
    <div className="auto-installer-container">
      <div className="devices-status">{serialno ? `设备已连接: ${serialno}` : '设备未连接'}</div>

      <div className="execute-result">{executeResult}</div>

      <Form<FormType>
        form={form}
        style={{ width: '80%' }}
        onFinish={onInstallApp}
        onFinishFailed={() => {
          message.error('请检查信息是否填写正确')
        }}
      >
        <Form.Item
          // initialValue="com.ch.yuanmingyuan.client"
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
            // initialValue="/Users/congxin/Downloads/YMY/DL.zip"
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
          // initialValue="/Users/congxin/Downloads/YMY/YMY.apk"
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
            // initialValue="/Users/congxin/Downloads/YMY/main.2.com.ch.yuanmingyuan.client.obb"
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
          // initialValue="YMYBS"
          label="配置文件目录"
          name="configDir"
          rules={[{ required: true, message: '请填写配置文件目录' }]}
        >
          <Input placeholder="请填写" spellCheck={false} />
        </Form.Item>

        <Form.Item
          // initialValue="/Users/congxin/Downloads/YMY/Config"
          label="配置文件夹路径"
          name="configFilePath"
          rules={[{ required: true, message: '请选择文件夹' }]}
        >
          <MyInput placeholder="请选择" openType="openDirectory" />
        </Form.Item>

        <Form.Item
          // initialValue="/Users/congxin/Downloads/YMY/Json"
          label="动块文件夹路径"
          name="blockFilePath"
          rules={[{ required: true, message: '请选择文件夹' }]}
        >
          <MyInput placeholder="请选择" openType="openDirectory" />
        </Form.Item>

        <Form.Item label={null}>
          <div className="install-button">
            <Button type="primary" htmlType="submit" loading={loading}>
              一键安装
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default App
