<script setup lang="ts">
// import { useAppThemeStore } from '@/renderer/stores/app-theme'
import { computed } from 'vue'

/**
 * remix 图标
 * 根据应用主题自动切换图标类型
 */
const props = defineProps<{
  icon: string
}>()

// const theme = useAppThemeStore()
// const iconClass = computed(() => {
//   console.log('theme.state.dark', theme.state.dark)
//   if (theme.state.dark) {
//     return `ri-${props.icon}-fill`
//   }else{
//     return `ri-${props.icon}-line`
//   }
// })
const iconClass = computed(() => `ri-${props.icon}-fill`)
</script>

<template>
  <i :class="iconClass"></i>
</template>

<style scoped lang="scss"></style>
