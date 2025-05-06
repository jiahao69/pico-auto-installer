import { app } from 'electron'
import { join } from 'path'
import log4js from 'log4js'
import dayjs from 'dayjs'

// 获取用户应用数据目录
const userDataPath = app.getPath('userData')
const logPath = join(userDataPath, 'logs')

log4js.configure({
  appenders: {
    console: { type: 'console' },
    everything: {
      type: 'file',
      filename: join(logPath, `${dayjs().format('YYYY-MM-DD')}.log`),
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c - %m'
      }
    }
  },
  categories: {
    default: { appenders: ['console', 'everything'], level: 'info' }
  }
})

export const logger = log4js.getLogger()
