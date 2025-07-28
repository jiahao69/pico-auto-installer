type FormType = {
  packageName: string
  isUploadMapZip: boolean
  mapZipPath: string
  apkFilePath: string
  isUploadOBB: boolean
  obbFilePath: string
  configDir: string
  configFilePath: string
  blockFilePath: string
}

type OpenType = 'openFile' | 'openDirectory'

type Devices = {
  id: string
}
