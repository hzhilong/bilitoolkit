import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 应用会话状态 Store
 */
export const useAppSessionStore = defineStore(
  'AppSessionStore',
  () => {
    const initializing = ref(false)
    const initialized = ref(false)
    const maxWindow = ref(false)
    const runTasking = ref(false)

    return { initializing, initialized, maxWindow, runTasking }
  },
  {
    persist: false,
  },
)
