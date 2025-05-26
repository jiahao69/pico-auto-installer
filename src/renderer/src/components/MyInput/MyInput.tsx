import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { Form, Input, Button, Tooltip, type InputProps } from 'antd'

import './MyInput.less'

interface IProps extends Omit<InputProps, 'disabled' | 'placeholder'> {
  children?: ReactNode
  buttonName?: string
  openType?: OpenType
}

const MyInput: FC<IProps> = ({ buttonName = '选择', openType = 'openFile', ...props }) => {
  // 获取当前上下文正在使用的 Form 实例，常见于封装子组件消费无需透传 Form 实例
  const form = Form.useFormInstance()

  return (
    <div className="my-input-container">
      <Tooltip title={props.value}>
        <Input placeholder="请选择" disabled {...props} />
      </Tooltip>

      <Button
        type="primary"
        onClick={() => {
          // 选择文件
          window.electron?.ipcRenderer.invoke('select-file', openType).then((filePath: string) => {
            // 用户取消选择
            if (!filePath) return

            // 更新表单值
            form.setFieldValue(props.id, filePath)
            // 触发校验
            form.validateFields([props.id])
          })
        }}
      >
        {buttonName}
      </Button>
    </div>
  )
}

export default memo(MyInput)
