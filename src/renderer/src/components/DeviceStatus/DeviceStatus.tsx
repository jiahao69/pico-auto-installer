import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { Alert, Tag } from 'antd'

interface IProps {
  children?: ReactNode
  devices: any[]
}

const DeviceStatus: FC<IProps> = ({ devices }) => {
  return (
    <Alert
      type={devices.length ? 'success' : 'error'}
      message={
        devices.length
          ? devices.map((device) => <Tag key={device.sn}>{device.sn}</Tag>)
          : '设备未连接'
      }
      showIcon
    />
  )
}

export default memo(DeviceStatus)
