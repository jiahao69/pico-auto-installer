import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { Form, Select, Button, Checkbox, message } from 'antd'

import { appNameSelectOptions, configDirMap } from '@/contants'

import MyInput from '@/components/MyInput/MyInput'

interface IProps {
  children?: ReactNode
  loading?: boolean
  isPushConfig?: boolean
  onFinish?: (value: FormType) => void
}

// 表单默认值
const initialValues = import.meta.env.DEV
  ? {
      packageName: 'com.ch.yuanmingyuan.client',
      apkFilePath: '/Users/congxin/Downloads/YMY/YMY.apk',
      isUploadOBB: true,
      obbFilePath: '/Users/congxin/Downloads/YMY/main.2.com.ch.yuanmingyuan.client.obb',
      configFilePath: '/Users/congxin/Downloads/YMY/Config',
      blockFilePath: '/Users/congxin/Downloads/YMY/Json'
    }
  : { isUploadOBB: true }

const FormContainer: FC<IProps> = ({ loading, isPushConfig, onFinish }) => {
  const [form] = Form.useForm()
  const isUploadOBB = Form.useWatch('isUploadOBB', form)

  return (
    <Form<FormType>
      form={form}
      initialValues={initialValues}
      onFinish={(values) => onFinish?.({ ...values, configDir: configDirMap[values.packageName] })}
      onFinishFailed={() => {
        message.error('请检查信息是否填写正确')
      }}
    >
      <Form.Item
        label="应用名称"
        name="packageName"
        rules={[{ required: true, message: '请选择应用名称' }]}
      >
        <Select options={appNameSelectOptions} />
      </Form.Item>

      {!isPushConfig && (
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
      )}

      {!isPushConfig && (
        <>
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
        </>
      )}

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
