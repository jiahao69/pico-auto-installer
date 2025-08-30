import { memo, useEffect, useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Table, Modal, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface DataType {
  timestamp: string
  id: string
  packageName: string
  status: 'success' | 'fail'
}

const columns: ColumnsType<DataType> = [
  {
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp'
  },
  {
    title: '设备标识',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '包名',
    dataIndex: 'packageName',
    key: 'packageName'
  },
  {
    title: '安装结果',
    width: 80,
    dataIndex: 'status',
    key: 'status',
    render: (_, { status }) => (
      <Tag color={status === 'success' ? 'success' : 'error'}>
        {status === 'success' ? '成功' : '失败'}
      </Tag>
    )
  }
]

interface IProps {
  children?: ReactNode
  open: boolean
  onClose: () => void
}

const InstallHistory: FC<IProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DataType[]>([])

  useEffect(() => {
    if (open) {
      setLoading(true)
      // 获取历史记录
      window.electron?.ipcRenderer.invoke('get-install-history').then((history: DataType[]) => {
        setData(history)
        setLoading(false)
      })
    }
  }, [open])

  return (
    <Modal
      title="安装历史"
      open={open}
      footer={null}
      maskClosable={false}
      width="90%"
      onCancel={onClose}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        size="middle"
        scroll={{ y: 300 }}
        pagination={false}
      ></Table>
    </Modal>
  )
}

export default memo(InstallHistory)
