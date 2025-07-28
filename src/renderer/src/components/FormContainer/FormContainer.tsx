import { memo, useCallback } from 'react'
import type { FC, ReactNode } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd'

import MyInput from '@/components/MyInput/MyInput'

interface IProps {
  children?: ReactNode
  loading?: boolean
  onFinish?: (value: FormType) => void
}

const FormContainer: FC<IProps> = ({ loading, onFinish }) => {
  const [form] = Form.useForm()

  const isUploadOBB = Form.useWatch('isUploadOBB', form)
  const isUploadMapZip = Form.useWatch('isUploadMapZip', form)

  const getInitialValues = useCallback(() => {
    // 开发模式下设置默认值
    return import.meta.env.DEV
      ? {
          packageName: 'com.ch.yuanmingyuan.client',
          isUploadMapZip: true,
          mapZipPath: '/Users/congxin/Downloads/YMY/DL.zip',
          apkFilePath: '/Users/congxin/Downloads/YMY/YMY.apk',
          isUploadOBB: true,
          obbFilePath: '/Users/congxin/Downloads/YMY/main.2.com.ch.yuanmingyuan.client.obb',
          configDir: 'YMYBS',
          configFilePath: '/Users/congxin/Downloads/YMY/Config',
          blockFilePath: '/Users/congxin/Downloads/YMY/Json'
        }
      : { isUploadMapZip: true, isUploadOBB: true }
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
        label="是否上传地图压缩包"
        name="isUploadMapZip"
        rules={[{ required: true }]}
        valuePropName="checked"
      >
        <Checkbox />
      </Form.Item>

      {isUploadMapZip && (
        <Form.Item
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
          <MyInput />
        </Form.Item>
      )}

      <Form.Item
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
        <MyInput />
      </Form.Item>

      <Form.Item
        label="是否上传OBB文件"
        name="isUploadOBB"
        rules={[{ required: true }]}
        valuePropName="checked"
      >
        <Checkbox />
      </Form.Item>

      {isUploadOBB && (
        <Form.Item
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
          <MyInput />
        </Form.Item>
      )}

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
          一键安装
        </Button>
      </div>
    </Form>
  )
}

export default memo(FormContainer)
