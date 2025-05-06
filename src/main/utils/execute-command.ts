import { promisify } from 'util'
import { exec } from 'child_process'

// 使用 promisify 替代手动封装的 Promise
const execPromise = promisify(exec)

export async function executeCommand(command: string): Promise<string> {
  const { stdout, stderr } = await execPromise(command)
  return stdout || stderr
}
