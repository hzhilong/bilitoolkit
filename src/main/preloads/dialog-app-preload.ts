import { initApp } from '@/main/preloads/base-app-preload.ts'
import type { WindowApp } from '@/shared/types/app-types.ts'

initApp({
  type: 'dialogApp'
} satisfies WindowApp)
