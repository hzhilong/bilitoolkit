import pkg from '../package.json'
import { ToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import { writeFileSync } from 'node:fs'
import path from 'path'
import { getPackage } from 'public-registry-api'
import { parseNpmPackage } from '@/shared/utils/plugin-parse.ts'

/**
 * 构建 recommended-plugins.json 配置文件
 */

// 插件的插件包
const pluginIds = ['bilitoolkit-plugin-example']
const appVersion = pkg.version
const plugins: ToolkitPlugin[] = []

console.log(`正在构建配置文件 recommended-plugins.json`)

for (const pluginId of pluginIds) {
  try {
    console.log(`获取插件 [${pluginId}] 的 npm 包信息`)
    const pkg = await getPackage(pluginId)
    plugins.push(parseNpmPackage(pkg))
  } catch (e) {
    console.error(e)
  }
}

writeFileSync(
  path.join(import.meta.dirname, '../public/recommended-plugins.json'),
  JSON.stringify(
    {
      appVersion,
      plugins: plugins,
    },
    null,
    2,
  ),
)
console.log(`构建配置文件 recommended-plugins.json 成功`)
