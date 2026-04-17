import type { ToolkitApiWithCore } from '@/shared/types/toolkit-core-api.ts'
import { setupToolkitApi } from 'bilitoolkit-api-runtime'

export const toolkitApi = setupToolkitApi() as ToolkitApiWithCore
