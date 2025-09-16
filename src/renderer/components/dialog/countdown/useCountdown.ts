import { ref, onUnmounted } from 'vue'

/**
 * 使用倒计时
 * @param initial
 */
export function useCountdown(initial: number) {
  const countdown = ref(initial)
  const timer = ref<ReturnType<typeof setInterval> | null>(null)

  const start = (callback: () => void) => {
    countdown.value = initial
    timer.value = setInterval(() => {
      if (countdown.value > 1) {
        countdown.value--
      } else {
        stop()
        callback()
      }
    }, 1000)
  }

  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  onUnmounted(stop)

  return { countdown, start, stop }
}
