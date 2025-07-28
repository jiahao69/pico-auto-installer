import { memo, useCallback } from 'react'
import type { FC, ReactNode } from 'react'
import { Form, Input, Button, message } from 'antd'

import MyInput from '@/components/MyInput/MyInput'

interface IProps {
  children?: ReactNode
  loading?: boolean
  onFinish?: (value: FormType) => void
}

const ConfigFormContainer: FC<IProps> = ({ loading, onFinish }) => {
  const [form] = Form.useForm()

  const getInitialValues = useCallback(() => {
    // 开发模式下设置默认值
    return import.meta.env.DEV
      ? {
          packageName: 'com.ch.yuanmingyuan.client',
          configDir: 'YMYBS',
          configFilePath: '/Users/congxin/Downloads/YMY/Config',
          blockFilePath: '/Users/congxin/Downloads/YMY/Json'
        }
      : {}
  }, [])

  return (
    <Form<FormType>
      form={form}
      initialValues={getInitialValues()}
      onFinish={onFinish}
      onFinishFailed={() => {
        message.error('请检查信息是否填写正确')
      }}
    >
      <Form.Item
        label="包名"
        name="packageName"
        rules={[{ required: true, message: '请填写包名' }]}
      >
        <Input placeholder="请填写" spellCheck={false} />
      </Form.Item>

      <Form.Item
        label="配置文件目录"
        name="configDir"
        rules={[{ required: true, message: '请填写配置文件目录' }]}
      >
        <Input placeholder="请填写" spellCheck={false} />
      </Form.Item>

      <Form.Item
        label="配置文件夹路径"
        name="configFilePath"
        rules={[{ required: true, message: '请选择文件夹' }]}
      >
        <MyInput openType="openDirectory" />
      </Form.Item>

      <Form.Item
        label="动块文件夹路径"
        name="blockFilePath"
        rules={[{ required: true, message: '请选择文件夹' }]}
      >
        <MyInput openType="openDirectory" />
      </Form.Item>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          一键推送
        </Button>
      </div>
    </Form>
  )
}

export default memo(ConfigFormContainer)
