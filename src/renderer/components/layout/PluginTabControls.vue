<script setup lang="ts">
import { toolkitApi } from '@/renderer/api/toolkit-api'
import { eventBus } from '@/renderer/utils/event-bus'
import { PluginUtils } from '@/renderer/utils/plugin-utils'
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin';
import { cloneDeep } from 'lodash'
import { nextTick, ref } from 'vue'

const plugins = ref<ToolkitPlugin[]>([])
const activePluginId = ref('')

const pluginTabRefs = ref<HTMLDivElement[]>([])
const pluginRefMap = new Map<string, number>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setPluginRef = (plugin: ToolkitPlugin, el: any, index: number) => {
  if (el) {
    pluginRefMap.set(plugin.id, index)
    pluginTabRefs.value[index] = el
  }
}

eventBus.on('openPluginView', async ({ plugin }) => {
  try {
    for (const openedPlugin of plugins.value) {
      if (openedPlugin.id === plugin.id) {
        activePluginId.value = openedPlugin.id
        await toolkitApi.core.openPlugin(cloneDeep(plugin))
        return
      }
    }
    await toolkitApi.core.openPlugin(cloneDeep(plugin))
    plugins.value.push(plugin)
    activePluginId.value = plugin.id
  } finally {
    await nextTick(async () => {
      await updateScrollState()
      autoScrollToCurr(plugin)
    })
  }
})
eventBus.on('closePluginView', async ({ plugin }) => {
  for (let i = 0; i < plugins.value.length; i++) {
    const openedPlugin = plugins.value[i]
    if (openedPlugin.id === plugin.id) {
      await toolkitApi.core.closePlugin(cloneDeep(plugin))
      plugins.value.splice(i, 1)

      if (plugin.id === activePluginId.value) {
        // 如果关闭的是当前展示的view，自动展示前一个或者后一个
        const next = plugins.value[i - 1] ?? plugins.value[i + 1]
        if (next) {
          activePluginId.value = next.id
          await toolkitApi.core.openPlugin(cloneDeep(next))
          await nextTick(async () => {
            await updateScrollState()
            autoScrollToCurr(next)
          })
        } else {
          activePluginId.value = ''
        }
      }
      return
    }
  }
})
eventBus.on('hideCurrPluginView', async () => {
  await toolkitApi.core.hideCurrPlugin()
  activePluginId.value = ''
})

const switchPlugin = async (plugin: ToolkitPlugin) => {
  await PluginUtils.openPluginView(plugin)
}
const closePlugin = async (plugin: ToolkitPlugin) => {
  await PluginUtils.closePluginView(plugin)
}

const pluginTabsRef = ref<HTMLDivElement>()
const btnLeftRef = ref<HTMLElement>()
const btnRightRef = ref<HTMLElement>()

const btnLeftVisible = ref(false)
const btnRightVisible = ref(false)
// 滑动步长
const scrollStep = 200
let lastScrollLeft = Infinity

const waitScrollComplete = async () => {
  return new Promise((resolve) => {
    if (!pluginTabsRef.value) {
      resolve(null)
      return
    }
    const { scrollLeft, clientWidth, scrollWidth } = pluginTabsRef.value
    if (lastScrollLeft == scrollLeft) {
      resolve(null)
      return
    }
    lastScrollLeft = scrollLeft
    setTimeout(async () => {
      await waitScrollComplete()
      resolve(null)
    }, 10)
  })
}

const updateScrollState = async () => {
  if (!pluginTabsRef.value) return
  await waitScrollComplete()
  const { scrollLeft, clientWidth, scrollWidth } = pluginTabsRef.value
  btnLeftVisible.value = scrollLeft > 0
  btnRightVisible.value = Math.round(scrollLeft + clientWidth) < scrollWidth
}

const scroll = async (offset: number) => {
  if (!pluginTabsRef.value) return

  pluginTabsRef.value?.scrollBy({
    left: offset,
    behavior: 'smooth',
  })

  // 延迟更新
  await nextTick(() => {
    setTimeout(() => {
      updateScrollState()
    }, 100)
  })
}
// 自动滚动到当前标签页
const autoScrollToCurr = (plugin: ToolkitPlugin) => {
  const refIndex = pluginRefMap.get(plugin.id)
  if (refIndex === undefined) return
  const tab = pluginTabRefs.value[refIndex]
  const tabRect = tab.getBoundingClientRect()
  const tabsRect = pluginTabsRef.value!.getBoundingClientRect()

  const scrollLeft = pluginTabsRef.value!.scrollLeft
  const offsetParentLeft = tabRect.left - tabsRect.left
  const offsetParentRight = tabRect.right - tabsRect.right
  if (offsetParentLeft < scrollLeft) {
    // 左侧被遮挡
    scroll(offsetParentLeft - scrollLeft)
  } else if (offsetParentRight > 0) {
    // 右侧被遮挡
    scroll(offsetParentRight + 1)
  }
}
</script>

<template>
  <div class="tab-controls">
    <div class="scroll-btn-container">
      <i class="scroll-btn ri-arrow-left-s-line" ref="btnLeftRef" v-if="btnLeftVisible" @click="scroll(-scrollStep)" />
    </div>
    <div class="plugin-tabs" ref="pluginTabsRef">
      <div
        class="plugin-tab"
        v-for="(plugin, index) in plugins"
        :key="plugin.id"
        :ref="(el) => setPluginRef(plugin, el, index)"
        :class="plugin.id === activePluginId ? 'active' : ''"
        @click="switchPlugin(plugin)"
      >
        <div class="plugin-name txt-ellipsis">{{ plugin.name }}</div>
        <div class="plugin-close-btn" @click.stop="closePlugin(plugin)"></div>
      </div>
    </div>
    <div class="scroll-btn-container">
      <i
        class="scroll-btn ri-arrow-right-s-line"
        ref="btnRightRef"
        v-if="btnRightVisible"
        @click="scroll(scrollStep)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/renderer/assets/scss/global' as *;

.tab-controls {
  flex: 1;
  height: calc(100% - 10px);
  margin-top: auto;
  display: flex;
  align-items: end;
  flex-wrap: nowrap;
  overflow: hidden;

  .scroll-btn-container {
    width: 20px;
    height: 100%;
    font-size: 18px;
    text-align: center;

    .scroll-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      height: 100%;

      &:hover {
        background: var(--app-color-primary-transparent-45);
      }
    }
  }

  .plugin-tabs {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: end;
    gap: 2px;
    box-sizing: border-box;
    flex-wrap: nowrap;
    overflow-x: hidden;

    .plugin-tab {
      max-width: 200px;
      position: relative;
      height: 100%;
      padding-left: 8px;
      box-sizing: border-box;
      justify-content: space-between;
      align-items: center;
      display: flex;
      flex-wrap: nowrap;
      white-space: nowrap;
      background: var(--app-color-primary-transparent-05);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      border-left: 1px solid $main-content-border-color;
      border-top: 1px solid $main-content-border-color;
      border-right: 1px solid $main-content-border-color;
      background: var(--app-bg-color-overlay);
      -webkit-app-region: no-drag;
      color: var(--el-text-secondary);

      &.active {
        border-color: $main-content-border-color-hover;
        background: var(--app-bg-color-overlay-hover);
      }

      .plugin-name {
        font-size: 16px;
        transition: all 0.3s ease-in-out;
      }

      .plugin-close-btn {
        width: 0;
        margin-left: 4px;
        margin-right: 4px;
        height: 20px;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        border-radius: 50%;
        @include pseudo-svg-icon(url('@/renderer/assets/images/icon-close.svg'), var(--el-text-color-secondary), 4px);
        transition: all 0.3s ease-in-out;
        flex-shrink: 0;
        flex-grow: 0;

        &:hover {
          background: var(--app-color-primary-transparent-55);
        }
      }

      &:hover {
        cursor: pointer;

        .plugin-name {
          font-size: 14px;
        }

        .plugin-close-btn {
          width: 20px;
        }
      }
    }
  }
}
</style>
