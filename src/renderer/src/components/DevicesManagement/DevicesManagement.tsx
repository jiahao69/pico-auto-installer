import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { Modal } from 'antd'

interface IProps {
  children?: ReactNode
  isModalOpen?: boolean
  onClose?: () => void
  devices?: any[]
}

const DevicesManagement: FC<IProps> = ({ isModalOpen, onClose, devices }) => {
  return (
    <Modal
      style={{ maxHeight: '800px' }}
      title="设备管理"
      open={isModalOpen}
      footer={null}
      maskClosable={false}
      width="80%"
      onCancel={onClose}
      afterOpenChange={(open) => {
        if (open) {
          window.electron?.ipcRenderer.invoke('get-local-devices').then((devices: Devices[]) => {
            console.log(devices)
          })
        }
      }}
    >
      {devices?.map((item) => <div>{item.ip}</div>)}
    </Modal>
  )
}

export default memo(DevicesManagement)
