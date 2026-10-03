import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import ts from 'typescript'

function moduleUrl(file, imports = {}) {
  let code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  for (const [from, to] of Object.entries(imports)) code = code.replaceAll(from, to)
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
}
function stub(code) {
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
}
const keywords = moduleUrl('../src/shared/common/plugin-keywords.ts')
const parseUrl = moduleUrl('../src/shared/utils/plugin-parse.ts', {
  '@/shared/common/plugin-keywords.js': keywords,
  '@ybgnb/utils': import.meta.resolve('@ybgnb/utils'),
})
const { parseNpmPackage } = await import(parseUrl)

test('startup repairs stale saved metadata from installed files even when saved version is already latest', async () => {
  const source = ts.createSourceFile(
    'loader.ts',
    readFileSync(new URL('../src/main/plugin/loader.ts', import.meta.url), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  )
  const fn = source.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === 'restoreInstalledPluginMetadata',
  )
  assert.ok(fn)
  const code = ts.transpileModule(fn.getFullText(source), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const { restoreInstalledPluginMetadata } = await import(
    stub(
      `import fs from 'node:fs'; import path from 'node:path'; import {parsePluginManifest} from '${parseUrl}'; const AppError=Error; ${code}`,
    )
  )
  const root = mkdtempSync(path.join(tmpdir(), 'bilitoolkit-plugin-regression-'))
  try {
    const old = {
      id: 'bilitoolkit-plugin-query',
      name: '用户弹幕查询',
      version: '0.2.0',
      author: 'struggle0929',
      installDate: '2026-09-30',
      files: { rootPath: root, size: 123 },
    }
    writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({
        name: old.id,
        version: '0.2.0',
        keywords: ['bilitoolkit-plugin:name:直播弹幕查询'],
        description: '房间号或UID',
      }),
    )
    const repaired = restoreInstalledPluginMetadata(old)
    assert.equal(repaired.name, '直播弹幕查询')
    assert.equal(repaired.description, '房间号或UID')
    assert.equal(repaired.installDate, old.installDate)
    assert.equal(repaired.files.size, 123)
    assert.equal(repaired.files.indexPath, path.join(root, 'dist', 'index.html'))
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: old.id, version: '0.0.2' }))
    assert.equal(restoreInstalledPluginMetadata(old).version, '0.0.2')
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'wrong-plugin' }))
    assert.throws(() => restoreInstalledPluginMetadata(old), /包名/)
    assert.equal(restoreInstalledPluginMetadata({ ...old, isTest: true }).name, old.name)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('latest manifest replaces stale top-level name, description, author and repository', () => {
  const result = parseNpmPackage({
    name: 'bilitoolkit-plugin-user-danmaku-search',
    keywords: ['bilitoolkit-plugin:name:用户弹幕查询'],
    description: '旧功能',
    author: { name: '旧作者' },
    'dist-tags': { latest: '0.2.0' },
    time: { created: '2026-09-30', '0.2.0': '2026-10-04' },
    versions: {
      '0.2.0': {
        keywords: ['bilitoolkit-plugin:name:直播弹幕查询', 'bilitoolkit-plugin:type:ui'],
        description: '房间号或UID',
        author: { name: 'struggle0929' },
        repository: { url: 'https://github.com/struggle0929/bilitoolkit-plugin-struggle0929', directory: 'query' },
      },
    },
  })
  assert.equal(result.name, '直播弹幕查询')
  assert.equal(result.version, '0.2.0')
  assert.equal(result.description, '房间号或UID')
  assert.equal(result.author, 'struggle0929')
  assert.match(result.links.repository, /plugin-struggle0929$/)
})

test('update awaits old UI closure, then replaces installed object and always releases update lock', async () => {
  let finishClosing
  const events = []
  const oldPlugin = { id: 'query', name: '用户弹幕查询', type: 'ui', version: '0.0.2' }
  const newPlugin = { ...oldPlugin, name: '直播弹幕查询', version: '0.2.0' }
  const store = {
    current: oldPlugin,
    find: () => store.current,
    addPlugin: (plugin) => {
      store.current = plugin
    },
  }
  const updates = { updating: {} }
  globalThis.pluginRegression = {
    store,
    updates,
    events,
    api: {
      core: {
        closePlugin: () =>
          new Promise((resolve) => {
            finishClosing = () => {
              events.push('closed')
              resolve()
            }
          }),
        updatePlugin: async () => {
          events.push('download')
          return newPlugin
        },
      },
    },
  }
  const mocked = stub(`const state=globalThis.pluginRegression;
    export const toolkitApi=state.api; export const useAppInstalledPlugins=()=>state.store;
    export const usePluginUpdates=()=>state.updates; export const eventBus={emit:()=>{}};
    export const useRecentPluginsStore=()=>({addRecent(){},removeRecent(){}});
    export const useStarredPluginsStore=()=>({removeStar(){}}); export const useRecommendedPlugins=()=>({plugins:[]});
    export const appEnv={APP_AUTHOR:'hzhilong'}; export const toIPC=x=>x;
    export const AppError=Error; export const getFormattedDate=()=>'';
    export const searchPackages=()=>{}; export const SearchText={};`)
  const imports = Object.fromEntries(
    [
      '@/renderer/utils/event-bus.js',
      '@/renderer/stores/installed-plugins',
      '@ybgnb/vite-env/common',
      '@/renderer/api/toolkit-api.js',
      'bilitoolkit-runtime',
      '@ybgnb/utils',
      'public-registry-api',
      '@/renderer/stores/recommended-plugins',
      '@/renderer/stores/recent-plugins',
      '@/renderer/stores/starred-plugins',
      'bilitoolkit-types',
      '@/renderer/stores/plugin-updates',
    ].map((name) => [name, mocked]),
  )
  imports['@/shared/utils/plugin-parse.js'] = parseUrl

  const { PluginUtils } = await import(moduleUrl('../src/renderer/utils/plugin-utils.ts', imports))
  const updating = PluginUtils.update(oldPlugin)
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(events, [])
  assert.equal(updates.updating.query, true)
  finishClosing()
  await updating
  assert.deepEqual(events, ['closed', 'download'])
  assert.equal(store.current.name, '直播弹幕查询')
  assert.equal(store.current.version, '0.2.0')
  assert.equal(updates.updating.query, undefined)
  globalThis.pluginRegression.api.core.closePlugin = async () => {}
  globalThis.pluginRegression.api.core.updatePlugin = async () => {
    throw new Error('网络失败')
  }
  await assert.rejects(PluginUtils.update(newPlugin), /网络失败/)
  assert.equal(updates.updating.query, undefined)
  assert.equal(store.current.version, '0.2.0')
  delete globalThis.pluginRegression
})
