import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import dayjs from 'dayjs'

// 获取用户应用数据目录
const userDataPath = app.getPath('userData')
const historyPath = join(userDataPath, 'history.json')

export interface InstallHistory {
  timestamp: string
  serialno: string
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
  ensureHistoryFile()
  const history = readHistory()
  const newRecord: InstallHistory = {
    ...record,
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  history.unshift(newRecord)
  // 只保留最近100条记录
  const trimmedHistory = history.slice(0, 100)
  fs.writeFileSync(historyPath, JSON.stringify(trimmedHistory, null, 2))
}
