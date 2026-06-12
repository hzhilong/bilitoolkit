import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useAppTabStore = defineStore(
  'biliToolkit-tab',
  () => {
    const visitedViews = reactive<Set<string>>(new Set<string>())

    const addTab = (path: string) => {
      if (!visitedViews.has(path)) {
        visitedViews.add(path)
      }
    }
    const removeTab = (path: string) => {
      visitedViews.delete(path)
    }

    return { visitedViews, addTab, removeTab }
  },
  {
    persist: false,
  },
)
