/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort, workerData } from 'node:worker_threads'
import vm from 'node:vm'
import type { RpcApiResultMsg, RpcApiRequestMsg, WorkerData, RpcLogRequestMsg } from '@/main/types/task-worker.js'
import util from 'node:util'
import type { TaskPluginToolkitApi } from 'bilitoolkit-types'
import { serializeError, stripFunctions, type LogLevel } from '@ybgnb/utils'

if (!parentPort) {
  throw new Error('task-plugin.worker must run in a worker thread')
}

function formatLogMessage(...data: any[]): string {
  return data
    .map((arg) => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: null, colors: false })))
    .join(' ')
}

const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()

parentPort.on('message', (msg: RpcApiResultMsg) => {
  if (msg?.type !== 'rpc:api:result') return

  const item = pending.get(msg.callId)
  if (!item) return

  pending.delete(msg.callId)

  if (msg.ok) {
    item.resolve(msg.value)
  } else {
    item.reject(Object.assign(new Error(msg.error.message), msg.error))
  }
})

/**
 *  RPC API 调用
 */
function rpcApiCall(path: string[], args: unknown[]) {
  return new Promise<unknown>((resolve, reject) => {
    const callId = crypto.randomUUID()

    pending.set(callId, { resolve, reject })
    parentPort!.postMessage({
      type: 'rpc:api:call',
      callId,
      path,
      args,
    } satisfies RpcApiRequestMsg)
  })
}

function createRemoteApi(path: string[] = []): TaskPluginToolkitApi {
  const callable = function noop() {}

  return new Proxy(callable, {
    get(_target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return undefined
      if (prop === Symbol.toStringTag) return 'RemoteApi'
      return createRemoteApi([...path, String(prop)])
    },
    apply(_target, _thisArg, args) {
      return rpcApiCall(path, args)
    },
    construct() {
      throw new Error('Remote API cannot be used with new')
    },
  }) as any
}

function createRemoteLogger() {
  const buildLog = (level: LogLevel) => {
    return (...data: unknown[]) => {
      parentPort!.postMessage({
        type: 'rpc:log:call',
        logLevel: level,
        data: formatLogMessage(...data),
      } satisfies RpcLogRequestMsg)
    }
  }

  const logger = ['debug', 'error', 'warn', 'info'].map((level) => {
    return [level, buildLog(level as LogLevel)]
  })
  return Object.fromEntries(logger) satisfies LogLevel
}

const data = workerData as WorkerData

const sandbox: Record<string, any> = {
  // ===== 基础 =====
  console,

  // ===== Web API（Node 18+）=====
  fetch: globalThis.fetch?.bind(globalThis),
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,

  Blob: globalThis.Blob,
  File: globalThis.File,
  FormData: globalThis.FormData,

  URL,
  URLSearchParams,

  TextEncoder,
  TextDecoder,

  atob: globalThis.atob,
  btoa: globalThis.btoa,

  crypto: globalThis.crypto,

  AbortController,
  AbortSignal,

  // ===== 定时器 =====
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  setInterval: globalThis.setInterval.bind(globalThis),
  clearInterval: globalThis.clearInterval.bind(globalThis),
  setImmediate: globalThis.setImmediate.bind(globalThis),
  clearImmediate: globalThis.clearImmediate.bind(globalThis),
  queueMicrotask: globalThis.queueMicrotask.bind(globalThis),

  // ===== 结构化克隆 =====
  structuredClone: globalThis.structuredClone?.bind(globalThis),

  // ===== Node 常用 =====
  Buffer,
  module: { exports: {} },
  exports: {},
  require: undefined,
  process: undefined,
  __dirname: undefined,
  __filename: undefined,
}

sandbox.exports = sandbox.module.exports
sandbox.global = sandbox
sandbox.globalThis = sandbox
sandbox.taskContext = {
  ...data.taskContext,
  logger: createRemoteLogger(),
  api: createRemoteApi(),
}

const context = vm.createContext(sandbox, {
  codeGeneration: {
    strings: false, // 想允许 eval / new Function 就改成 true
    wasm: false,
  },
})

async function main() {
  try {
    const script = new vm.Script(data.code, {
      filename: 'task-plugin.js',
    })

    script.runInContext(context)

    const exported = sandbox.module.exports
    const plugin = exported?.default ?? exported
    const run = plugin?.run
    if (typeof run !== 'function') {
      throw new Error('插件必须导出 run 异步函数')
    }

    const result = await Reflect.apply(run, sandbox.module.exports, [sandbox.taskContext])

    parentPort!.postMessage({
      type: 'done',
      result: stripFunctions(result),
    })
  } catch (error) {
    console.error(error)
    parentPort!.postMessage({
      type: 'error',
      error: serializeError(error),
    })
  }
}

void main()
