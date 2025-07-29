import { memo, useEffect, useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Modal, Button, Checkbox, Tag, Divider } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

interface IProps {
  children?: ReactNode
  isModalOpen: boolean
  onClose: () => void
}

const DevicesManagement: FC<IProps> = ({ isModalOpen, onClose }) => {
  const [searchDevicesLoading, setSearchDevicesLoading] = useState(false)
  const [localDevices, setLocalDevices] = useState<string[]>([])
  const [usbDevices, setUsbDevices] = useState<string[]>([])
  const [connectedLocalDevices, setConnectedLocalDevices] = useState<string[]>([])
  const [checkedDevices, setCheckedDevices] = useState<string[]>([])

  useEffect(() => {
    // 搜索本地设备
    searchLocalDevices()
  }, [])

  useEffect(() => {
    // 打开弹窗时回填已连接设备
    if (isModalOpen) {
      window.electron?.ipcRenderer.invoke('get-devices').then((devices: string[]) => {
        // 已连接的USB设备
        const connectedUsbDevices = devices.filter((item) => !item.includes(':'))
        setUsbDevices(connectedUsbDevices)

        // 已连接的本地设备
        const connectedLocalDevices = devices
          .filter((device) => device.includes(':'))
          .map((device) => device.split(':')[0])

        setConnectedLocalDevices(connectedLocalDevices)
        setCheckedDevices(connectedLocalDevices)
      })
    }
  }, [isModalOpen])

  // 搜索本地设备
  const searchLocalDevices = () => {
    setSearchDevicesLoading(true)
    window.electron?.ipcRenderer
      .invoke('get-local-devices')
      .then((localDevices: Array<{ ip: string }>) => {
        setLocalDevices(localDevices.map((item) => item.ip))
        setSearchDevicesLoading(false)
      })
  }

  return (
    <Modal
      styles={{ body: { minHeight: '130px' } }}
      title="设备管理"
      open={isModalOpen}
      cancelText="取消"
      okText="确认"
      maskClosable={false}
      loading={!!!localDevices.length}
      width="80%"
      onCancel={onClose}
      onOk={() => {
        // 1.断开所有设备
        for (const device of localDevices) {
          window.electron?.ipcRenderer.send('disconncet-devices', device)
        }

        // 2.连接选中的设备
        for (const device of checkedDevices) {
          window.electron?.ipcRenderer.send('conncet-devices', device)
        }

        onClose()
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h4 style={{ marginRight: '20px' }}>无线连接(绿色代表设备已连接)</h4>
        <Button type="primary" loading={searchDevicesLoading} onClick={searchLocalDevices}>
          刷新设备
        </Button>
      </div>
      <Checkbox.Group<string>
        value={checkedDevices}
        onChange={(values) => {
          setCheckedDevices(values)
        }}
      >
        {localDevices.map((device) => (
          <Checkbox
            value={device}
            key={device}
            style={{ color: connectedLocalDevices.includes(device) ? '#53c41a' : '' }}
          >
            {device}
          </Checkbox>
        ))}
      </Checkbox.Group>

      <Divider />

      <h4>有线连接</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '6px' }}>
        {usbDevices.map((device) => (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {device}
          </Tag>
        ))}
      </div>
    </Modal>
  )
}

export default memo(DevicesManagement)
