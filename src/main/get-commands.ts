import { getBasename } from './utils/get-basename'

export function getCommands(options: FormType) {
  const commands = [
    { name: '创建地图文件目录', command: 'adb shell mkdir -p /sdcard/maps' },
    {
      name: '推送地图文件',
      command: `adb push "${options.mapZipPath}" /sdcard/maps/`
    },
    {
      name: '卸载旧应用',
      command: `adb shell "pm uninstall ${options.packageName} || true"`
    },
    { name: '安装新应用', command: `adb install "${options.apkFilePath}"` },
    {
      name: '启动应用',
      command: `adb shell am start -n ${options.packageName}/com.epicgames.unreal.GameActivity`
    },
    {
      name: '推送OBB文件',
      command: `adb push ${
        options.obbFilePath
      } /sdcard/Download/ && adb shell mv /sdcard/Download/${getBasename(
        options.obbFilePath
      )} /sdcard/Android/obb/${options.packageName}/${getBasename(options.obbFilePath)}`
    },
    {
      name: '推送OBB文件后关闭应用',
      command: `adb shell am force-stop ${options.packageName}`
    },
    {
      name: '推送OBB文件后启动应用',
      command: `adb shell am start -n ${options.packageName}/com.epicgames.unreal.GameActivity`
    },
    {
      name: '创建配置文件目录',
      command: `adb shell mkdir -p /sdcard/Android/data/${options.packageName}/files/UnrealGame/${options.configDir}/${options.configDir}`
    },
    {
      name: '推送配置文件夹',
      command: `adb push ${
        options.configFilePath
      } /sdcard/Download/ && adb shell mv /sdcard/Download/${getBasename(
        options.configFilePath
      )} /sdcard/Android/data/${options.packageName}/files/UnrealGame/${
        options.configDir
      }/${options.configDir}/`
    },
    {
      name: '推送动块文件夹',
      command: `adb push ${
        options.blockFilePath
      } /sdcard/Download/ && adb shell mv /sdcard/Download/${getBasename(
        options.blockFilePath
      )} /sdcard/Android/data/${options.packageName}/files/UnrealGame/${
        options.configDir
      }/${options.configDir}/`
    }
  ]

  return commands
}
