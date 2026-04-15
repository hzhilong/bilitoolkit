import { toolkitApi as baseApi } from 'bilitoolkit-ui'
import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'

export const toolkitApi = baseApi as ToolkitApiWithCore
