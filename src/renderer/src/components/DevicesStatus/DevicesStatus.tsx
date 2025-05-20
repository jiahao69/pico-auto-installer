import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { Alert, Tag } from 'antd'

interface Devices {
  sn: string
}

interface IProps {
  children?: ReactNode
  devices: Devices[]
}

const DevicesStatus: FC<IProps> = ({ devices }) => {
  return (
    <Alert
      showIcon
      type={devices.length ? 'success' : 'error'}
      message={
        devices.length
          ? devices.map((device) => <Tag key={device.sn}>{device.sn}</Tag>)
          : '设备未连接'
      }
    />
  )
}

export default memo(DevicesStatus)
