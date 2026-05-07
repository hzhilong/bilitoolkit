import { initApp } from '@/main/preloads/base-app-preload.js'
import type { WindowApp } from '@/shared/types/app-types.js'

initApp({
  type: 'dialogApp',
} satisfies WindowApp)
