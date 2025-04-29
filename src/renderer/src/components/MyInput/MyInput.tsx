import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { Input, Button, Tooltip, type InputProps } from 'antd'

import './MyInput.less'

interface IProps extends Omit<InputProps, 'disabled'> {
  children?: ReactNode
  buttonName?: string
  openType?: OpenType
}

const MyInput: FC<IProps> = ({ buttonName = '选择', openType = 'openFile', ...props }) => {
  return (
    <div className="my-input-container">
      <Tooltip title={props.value}>
        <Input disabled {...props} />
      </Tooltip>

      <Button
        type="primary"
        onClick={() => {
          // 打开文件选择框
          window.electron?.ipcRenderer.send('show-dialog', {
            id: props.id,
            openType
          })
        }}
      >
        {buttonName}
      </Button>
    </div>
  )
}

export default memo(MyInput)
