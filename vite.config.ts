import { ConfigEnv, defineConfig, loadEnv, mergeConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import electron from 'vite-plugin-electron/simple'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import packageJson from './package.json'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * 基础的 vite 配置
 */
const baseConfig = ({ mode }: ConfigEnv): UserConfig => {
  // 环境变量前缀
  const envPrefixes = ['VITE_', 'APP_']
  // 环境变量目录
  const envDir = path.resolve(__dirname, 'env')
  // 加载当前模式的所有环境变量
  const env = loadEnv(mode, envDir, '')
  // 需要特殊初始化的变量，使用packageJson配置的属性自动初始化
  const defineData = initEnvDefine(env, {
    APP_NPM_NAME: packageJson.name,
    APP_PRODUCT_NAME: packageJson.productName,
    APP_PRODUCT_CN_NAME: packageJson.productCNName,
    APP_DESCRIPTION: packageJson.description,
    APP_VERSION: packageJson.version,
    APP_AUTHOR: packageJson.author,
    APP_PRODUCT_URL: packageJson.repository.url,
    APP_TITLE: getAppTitle(mode),
  })
  console.log('========================================================')
  console.log('项目名称：', packageJson.productName)
  console.log('当前模式：', mode)
  console.log('当前环境变量：')
  Object.keys(env).forEach((key) => {
    for (const envPrefix of envPrefixes) {
      if (key.startsWith(envPrefix)) {
        console.log(`   ${key} = ${env[key]}`)
      }
    }
  })
  console.log('========================================================')
  // https://vite.dev/config/ or https://vitejs.cn/vite5-cn/guide/
  return {
    // 开发或生产环境服务的公共基础路径
    base: './',
    // 环境变量目录
    envDir: envDir,
    // 环境变量前缀
    envPrefix: envPrefixes,
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      // 按需引入组件 https://github.com/unplugin/unplugin-vue-components
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    // 定义全局常量替换（适用于一些常量，在js使用）
    define: defineData,
    resolve: {
      // 路径别名
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      // 生成 Source Map => 开发环境日志打印时输出源码路径和行号
      sourcemap: mode !== 'production',
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 全局引入,但webstorm好像不识别,算了,手动在home.scss引入
          // additionalData: '@import "@/renderer/assets/scss/global.scss";',
        },
      },
    },
  }
}

// https://vite.dev/config/

export default defineConfig((env: ConfigEnv) => {
  const base = baseConfig(env)
  // vite-plugin-electron 插件需要分别定义渲染进程和主进程的路径别名

  const electronVite = {
    // 环境变量目录
    envDir: base.envDir,
    // 环境变量前缀
    envPrefix: base.envPrefix,
    // 定义全局常量替换（适用于一些常量，在js使用）
    define: base.define,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      // 生成 Source Map => 开发环境日志打印时输出源码路径和行号
      sourcemap: env.mode !== 'production',
      outDir: 'dist-electron/',
      rollupOptions: {
        output: {
          entryFileNames: `[name].js`,
        },
      },
    },
  }
  // 深度合并配置
  return mergeConfig(base, {
    plugins: [
      electron({
        main: {
          entry: 'src/main/main.ts',
          vite: electronVite,
        },
        preload: {
          input: 'src/main/preloads/preload.ts',
          vite: electronVite,
        },
      }),
    ],
  })
})

/**
 * 获取应用标题
 * @param mode 模式
 * @returns 应用标题
 */
function getAppTitle(mode: string): string {
  if (mode === 'production') {
    return `${packageJson.productName} ${packageJson.version}`
  } else {
    return `${packageJson.productName} ${packageJson.version} ${mode}`
  }
}

/**
 * 初始化全局定义的常量替换
 * @param env 环境变量
 * @param newEnv 自定义的环境变量
 * @returns 全局定义的常量替换
 */
function initEnvDefine(env: Record<string, string>, newEnv: Record<string, string>) {
  const defineData: Record<string, string> = {}
  Object.keys(newEnv).forEach((key) => {
    env[key] = newEnv[key]
    defineData[`import.meta.env.${key}`] = JSON.stringify(newEnv[key])
  })
  return defineData
}
