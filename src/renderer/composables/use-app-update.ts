import { toolkitApi } from '@/renderer/api/toolkit-api'
import type { AppUpdateStatus } from '@/shared/types/toolkit-core-api.js'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes < 1) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export const useAppUpdate = () => {
  const updateStatus = ref<AppUpdateStatus>({ phase: 'idle' })
  let updateStatusTimer: number | undefined

  const isActivePhase = (status: AppUpdateStatus) => ['checking', 'downloading'].includes(status.phase)

  const stopUpdateStatusPolling = () => {
    if (updateStatusTimer === undefined) return
    window.clearInterval(updateStatusTimer)
    updateStatusTimer = undefined
  }

  const startUpdateStatusPolling = () => {
    if (updateStatusTimer !== undefined) return
    updateStatusTimer = window.setInterval(() => void refreshUpdateStatus(), 1000)
  }

  const refreshUpdateStatus = async () => {
    updateStatus.value = await toolkitApi.core.getAppUpdateStatus()
    if (isActivePhase(updateStatus.value)) startUpdateStatusPolling()
    else stopUpdateStatusPolling()
  }

  onMounted(() => {
    void refreshUpdateStatus()
  })

  onBeforeUnmount(() => {
    stopUpdateStatusPolling()
  })

  const updateStatusDesc = computed(() => {
    const status = updateStatus.value
    if (status.phase === 'idle') return '点击按钮检查是否有新版本'
    if (status.phase === 'checking') return '正在连接更新服务器并检查新版本…'
    if (status.phase === 'downloading') {
      const progress = `${Math.round(status.percent ?? 0)}%`
      const size = status.total ? `，${formatBytes(status.transferred)} / ${formatBytes(status.total)}` : ''
      const speed = status.bytesPerSecond ? `，${formatBytes(status.bytesPerSecond)}/s` : ''
      return `正在后台下载${status.version ? ` v${status.version}` : '新版本'}：${progress}${size}${speed}`
    }
    return status.message ?? '更新状态未知'
  })

  const isUpdateBusy = computed(() => ['checking', 'downloading', 'downloaded'].includes(updateStatus.value.phase))

  const updateButtonText = computed(() => {
    if (updateStatus.value.phase === 'downloaded') return '已下载'
    if (updateStatus.value.phase === 'up-to-date' || updateStatus.value.phase === 'error') return '重新检查'
    return '检查更新'
  })

  const handleCheckUpdate = async () => {
    updateStatus.value = { phase: 'checking', message: '正在检查更新' }
    startUpdateStatusPolling()
    try {
      await toolkitApi.core.checkUpdateApp()
    } catch {
      // 具体错误由主进程保存到更新状态，并显示在调用页面中。
    } finally {
      await refreshUpdateStatus()
    }
  }

  return { updateStatus, updateStatusDesc, isUpdateBusy, updateButtonText, handleCheckUpdate }
}
