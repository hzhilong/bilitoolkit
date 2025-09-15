// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。

import { initHostApp } from '@/main/preloads/base-app-preload.ts'

initHostApp({
  type: 'hostApp',
})
