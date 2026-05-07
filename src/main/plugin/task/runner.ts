/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs'
import { Worker } from 'node:worker_threads'
import { type TaskContextFactory, taskContextFactory } from '@/main/plugin/task/context.js'
import type { Task, TaskExecution } from '@/shared/types/task.js'
import { stripFunctions, serializeError, createAbortError } from '@ybgnb/utils'
import { pluginManager } from '@/main/plugin/manager.js'
import { createTaskPluginApiProxy } from '@/main/plugin/task/api.js'
import type { TaskResult } from 'bilitoolkit-types'
import { appPath } from '@/main/common/app-path.js'
import path from 'node:path'
import type { RpcLogRequestMsg, RpcApiResultMsg } from '@/main/types/task-worker.js'

export function resolveCallable(root: unknown, path: string[]) {
  let parent: any = undefined
  let current: any = root

  for (const segment of path) {
    parent = current
    if (parent == null) {
      throw new Error(`API path not found: ${path.join('.')}`)
    }
    current = parent[segment]
  }

  return { target: current, thisArg: parent }
}

export class TaskPluginRunner {
  constructor(private contextFactory: TaskContextFactory) {}

  async run(task: Task, taskExecution: TaskExecution, signal?: AbortSignal) {
    if (signal?.aborted) throw createAbortError()

    const installedPlugin = pluginManager.getInstalledPlugin(task.pluginId)
    const toolkitApi = createTaskPluginApiProxy(installedPlugin, [])

    const runtimeContext = this.contextFactory.create(toolkitApi, task, taskExecution)

    // worker 里只保留数据
    const taskContext = stripFunctions(runtimeContext)

    const code = fs.readFileSync(installedPlugin.files.indexPath, 'utf-8')

    return await new Promise<TaskResult>((resolve, reject) => {
      const worker = new Worker(path.join(appPath.workersDir, 'task-plugin.worker.js'), {
        workerData: {
          code,
          taskContext,
        },
      })

      let settled = false
      const finalize = (fn: () => void) => {
        if (settled) return
        settled = true
        if (signal) signal.removeEventListener('abort', onAbort)
        worker.removeAllListeners()
        void worker.terminate().catch(() => {})
        fn()
      }

      const onAbort = () => {
        finalize(() => reject(createAbortError()))
      }

      if (signal) signal.addEventListener('abort', onAbort)

      worker.on('message', (msg: Record<string, any>) => {
        if (msg?.type === 'rpc:api:call') {
          void (async () => {
            try {
              const { target, thisArg } = resolveCallable(toolkitApi, msg.path)
              if (typeof target !== 'function') {
                throw new Error(`API is not callable: ${msg.path.join('.') || '<root>'}`)
              }

              const result = await Reflect.apply(target, thisArg, msg.args ?? [])
              worker.postMessage({
                type: 'rpc:api:result',
                callId: msg.callId,
                ok: true,
                value: stripFunctions(result),
              } satisfies RpcApiResultMsg)
            } catch (error) {
              worker.postMessage({
                type: 'rpc:api:result',
                callId: msg.callId,
                ok: false,
                error: serializeError(error),
              } satisfies RpcApiResultMsg)
            }
          })()
          return
        }

        if (msg?.type === 'rpc:log:call') {
          const { logLevel, data } = msg as RpcLogRequestMsg
          runtimeContext.logger[logLevel](data)
        }

        if (msg?.type === 'done') {
          finalize(() => resolve(msg.result as TaskResult))
          return
        }

        if (msg?.type === 'error') {
          finalize(() => reject(Object.assign(new Error(msg.error?.message ?? 'Worker error'), msg.error)))
        }
      })

      worker.on('error', (err) => {
        finalize(() => reject(err))
      })

      worker.on('exit', (code) => {
        if (!settled && code !== 0) {
          finalize(() => reject(new Error(`Worker stopped with exit code ${code}`)))
        }
      })
    })
  }
}

export const taskPluginRunner = new TaskPluginRunner(taskContextFactory)
