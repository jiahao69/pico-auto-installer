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
      filename: join(logPath, `${dayjs().format('YYYY-MM-DD')}.log`)
      // filename: `logs/${dayjs().format('YYYY-MM-DD')}.log`
    }
  },
  categories: {
    default: { appenders: ['console', 'everything'], level: 'info' }
  }
})

export const logger = log4js.getLogger()
