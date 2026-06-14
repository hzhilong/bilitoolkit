import { type ConfigEnv, defineConfig, mergeConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import electron from 'vite-plugin-electron/simple'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'
import { loadEnvConfig } from '@ybgnb/vite-env'
import { builtinModules } from 'node:module'
import { merge, cloneDeep } from 'lodash-es'
import path from 'path'

/**
 * 基础的 vite 配置
 */
const baseConfig = (configEnv: ConfigEnv): UserConfig => {
  const { mode } = configEnv

  // https://vite.dev/config/ or https://vitejs.cn/vite5-cn/guide/
  return mergeConfig(loadEnvConfig(configEnv), {
    // 开发或生产环境服务的公共基础路径
    base: './',
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      // 按需引入组件 https://github.com/unplugin/unplugin-vue-components
      AutoImport({
        resolvers: [
          ElementPlusResolver({
            // 开发环境禁用样式自动引入（应用会因为vite构建动态组件而频繁重启）
            importStyle: configEnv.mode === 'development' ? false : 'css',
          }),
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            // 开发环境禁用样式自动引入（应用会因为vite构建动态组件而频繁重启）
            importStyle: configEnv.mode === 'development' ? false : 'css',
          }),
        ],
      }),
    ],
    // 定义全局常量替换（适用于一些常量，在js使用）
    resolve: {
      // 路径别名
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      preserveSymlinks: true, // 保持 symlink，不要解析真实路径
    },
    build: {
      // 生成 Source Map => 开发环境日志打印时输出源码路径和行号
      sourcemap: mode !== 'production',
    },
    optimizeDeps: {
      // 依赖预构建，防止启动后页面频繁重新加载
      include: ['element-plus', 'element-plus/es', 'consola', '@ybgnb/bili-api'],
      // 将本地 Monorepo 组件库排除在预构建之外
      exclude: ['bilitoolkit-ui'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 全局引入,但webstorm好像不识别,算了,手动在home.scss引入
          // additionalData: '@import "@/renderer/assets/scss/global.scss";',
        },
      },
    },
  })
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
      minify: process.env.NODE_ENV !== 'development',
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
          vite: merge(cloneDeep(electronVite), {
            build: {
              rollupOptions: {
                external: (id: string) => {
                  // 排除所有内置模块
                  if (builtinModules.includes(id) || id.startsWith('node:')) return true

                  // 在 ESM 模式下，绝对不能 external 一个绝对路径 (Windows 下会报 e: 协议错)
                  // 排除非路径、非项目路径别名开始的依赖
                  if (
                    !id.startsWith('.') &&
                    !id.startsWith('/') &&
                    !id.startsWith('src/') &&
                    !id.startsWith('@/') &&
                    !id.startsWith('bilitoolkit-') &&
                    !id.startsWith('@ybgnb') &&
                    !path.isAbsolute(id)
                  )
                    return true

                  return false
                },
              },
            },
          }),
        },
        preload: {
          input: 'src/main/preloads/preload.ts',
          vite: electronVite,
        },
      }),
    ],
  })
})
