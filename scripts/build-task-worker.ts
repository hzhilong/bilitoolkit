import fs from 'fs-extra'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { build, type InlineConfig } from 'vite'
import { builtinModules } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 项目根目录
const projectRoot = resolve(__dirname, '..')

// 需要独立构建 preload.ts
const preloadEntryFiles = [[resolve(projectRoot, 'src/main/plugin/task/worker.ts'), 'task-plugin.worker.js']]

// 构建输出的基础目录 (Vite 的 outDir)
const baseOutDir = resolve(projectRoot, 'public')
// preload 文件最终存放的子目录
// 最终的 preload 输出目录
const preloadOutDir = resolve(baseOutDir, 'workers')

async function buildIndividualWorkers() {
  await fs.emptyDir(resolve(projectRoot, 'public/workers'))

  for (const [entryFile, outputFileName] of preloadEntryFiles) {
    console.log(`构建 workers 脚本中： ${outputFileName}...`)

    try {
      // 创建当前文件的构建配置，合并并覆盖基础配置
      const currentBuildConfig = {
        root: projectRoot,
        configFile: false,
        envDir: projectRoot,
        publicDir: false,
        build: {
          outDir: preloadOutDir,
          emptyOutDir: false,
          lib: {
            entry: entryFile,
            formats: ['es'],
            fileName: () => outputFileName.replace(/\.js$/, '.js'),
          },
          rollupOptions: {
            external: (id: string) => {
              // 排除所有内置模块
              if (builtinModules.includes(id) || id.startsWith('node:')) return true

              return false
            },
            output: {
              entryFileNames: outputFileName,
              manualChunks: () => null,
            },
          },
        },
        resolve: {
          alias: {
            '@': resolve(projectRoot, 'src'),
          },
          preserveSymlinks: true,
        },
      } satisfies InlineConfig

      await build(currentBuildConfig)
      console.log(`成功构建 workers 脚本：${outputFileName}\n\n`)
    } catch (error) {
      console.error(`构建 workers 脚本失败：${entryFile}:`, error)
      process.exit(1) // 构建失败则退出
    }
  }

  console.log('\n所有脚本构建成功！')
}

// 执行构建函数
buildIndividualWorkers().catch((err) => {
  console.error('构建脚本执行期间发生致命错误:', err)
  process.exit(1) // 以失败状态退出
})
