import { basename } from 'path'

export function getBasename(path: string) {
  return path ? basename(path) : ''
}
