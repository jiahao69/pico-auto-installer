import { basename } from 'path'

export function getBasename(path: string) {
  if (!path) return ''

  return basename(path)
}
