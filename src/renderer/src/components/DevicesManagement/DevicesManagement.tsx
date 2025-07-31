import { memo, useState, useMemo, useEffect } from 'react'
import type { FC, ReactNode } from 'react'
import { Modal, Button, Checkbox, Tag, Divider, message } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

interface IProps {
  children?: ReactNode
  isModalOpen: boolean
  onClose: () => void
}

interface LocalDevices {
  name: string
  ip: string
  mac: string
}

const ipcRenderer = window.electron?.ipcRenderer

const DevicesManagement: FC<IProps> = ({ isModalOpen, onClose }) => {
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [localDevices, setLocalDevices] = useState<string[]>([])
  const [usbDevices, setUsbDevices] = useState<string[]>([])
  const [connectedLocalDevices, setConnectedLocalDevices] = useState<string[]>([])
  const [checkedDevices, setCheckedDevices] = useState<string[]>([])

  const indeterminate = useMemo(
    () => checkedDevices.length > 0 && checkedDevices.length < localDevices.length,
    [checkedDevices, localDevices]
  )

  const checkAll = useMemo(
    () => checkedDevices.length === localDevices.length,
    [checkedDevices, localDevices]
  )

  useEffect(() => {
    // 搜索本地设备
    searchLocalDevices()
  }, [])

  useEffect(() => {
    // 打开弹窗时回填已连接设备
    isModalOpen && backFillDevices()
  }, [isModalOpen])

  // 搜索本地设备
  const searchLocalDevices = async () => {
    setRefreshLoading(true)

    const localDevices: LocalDevices[] = await ipcRenderer.invoke('get-local-devices')

    setLocalDevices(localDevices.map((item) => item.ip))

    setRefreshLoading(false)
    message.success('刷新成功')
  }

  // 回填已连接设备
  const backFillDevices = async () => {
    const devices: string[] = await ipcRenderer.invoke('get-devices')

    // 已连接的USB设备
    const usbDevices = devices.filter((item) => !item.includes(':'))
    setUsbDevices(usbDevices)

    // 已连接的本地设备
    const connectedLocalDevices = devices
      .filter((device) => device.includes(':'))
      .map((device) => device.split(':')[0])

    setConnectedLocalDevices(connectedLocalDevices)
    setCheckedDevices(connectedLocalDevices)
  }

  const onOk = async () => {
    if (!localDevices.length) {
      message.error('不存在无线连接设备，请检查')
      return
    }

    setConfirmLoading(true)

    const promises = localDevices.map((device) => {
      // 连接(勾选且未连接的设备)
      if (checkedDevices.includes(device) && !connectedLocalDevices.includes(device)) {
        return ipcRenderer.invoke('execute-command', `adb connect ${device}`)
      }

      // 断开连接(未勾选且已连接的设备)
      if (!checkedDevices.includes(device) && connectedLocalDevices.includes(device)) {
        return ipcRenderer.invoke('execute-command', `adb disconnect ${device}`)
      }

      // 不需要处理的设备
      return Promise.resolve()
    })

    // 所有promise结果都已敲定时返回的promise将被兑现
    await Promise.allSettled(promises)

    setConfirmLoading(false)

    onClose()
    message.success('操作成功')
  }

  return (
    <Modal
      title="设备管理"
      open={isModalOpen}
      cancelText="取消"
      okText="确认"
      maskClosable={false}
      confirmLoading={confirmLoading}
      width="80%"
      onCancel={onClose}
      onOk={onOk}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h4 style={{ marginRight: '20px' }}>无线连接设备(绿色代表设备已连接)</h4>
        <Button type="primary" loading={refreshLoading} onClick={searchLocalDevices}>
          刷新设备
        </Button>
      </div>

      <Checkbox
        indeterminate={indeterminate}
        onChange={(e) => {
          setCheckedDevices(e.target.checked ? [...localDevices] : [])
        }}
        checked={checkAll}
      >
        全选
      </Checkbox>
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

      <h4>USB连接设备</h4>
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
