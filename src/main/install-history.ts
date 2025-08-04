import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import dayjs from 'dayjs'

// 获取用户应用数据目录
const userDataPath = app.getPath('userData')
const historyPath = join(userDataPath, 'history.json')

export interface InstallHistory {
  timestamp: string
  id: string
  packageName: string
  status: 'success' | 'failed'
}

// 确保历史记录文件存在
function ensureHistoryFile() {
  if (!fs.existsSync(historyPath)) {
    fs.writeFileSync(historyPath, JSON.stringify([]))
  }
}

// 读取历史记录
export function readHistory(): InstallHistory[] {
  ensureHistoryFile()

  const data = fs.readFileSync(historyPath, 'utf-8')
  return JSON.parse(data)
}

// 添加历史记录
export function addHistory(record: Omit<InstallHistory, 'timestamp'>) {
  const history = readHistory()
  const newRecord = {
    ...record,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  // 新记录添加到头部
  history.unshift(newRecord)

  // 写入到本地文件中
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
}
