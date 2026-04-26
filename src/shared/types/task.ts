/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TaskSchedule, TaskResult, TaskConfigField, TaskConfigSchema, TaskLogLevel } from 'bilitoolkit-types'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.ts'
import type { MaxLengthArray } from '@ybgnb/utils'
import type { PageParams } from '@/shared/types/page.ts'

/**
 * 任务插件信息
 */
export interface TaskPluginInfo extends InstalledToolkitPlugin {
  /**
   * 任务配置结构定义
   */
  taskConfigSchema?: TaskConfigSchema<TaskConfigField[]>

  /**
   * 调度配置
   * - 不提供则表示该任务仅支持手动执行
   */
  taskSchedule?: TaskSchedule
}

/**
 * 任务
 */
export interface Task {
  /** 任务 id */
  id: number
  /** 任务插件 id */
  pluginId: string
  /** 用户配置信息 */
  config?: Record<string, any>
  /** 任务调度配置 */
  schedule?: TaskSchedule
  /** 创建时间 */
  createdAt: number
  /** 是否启用 */
  enabled: boolean
}

export interface TaskWithPlugin extends Task {
  plugin?: TaskPluginInfo
}

/**
 * 任务状态
 */
export type TaskExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'aborted'

/**
 * 任务执行记录
 */
export interface TaskExecution {
  /** 执行记录 id */
  id: number
  /** 任务 id */
  taskId: number
  /** 执行状态 */
  status: TaskExecutionStatus
  /** 创建时间 */
  createdAt: number
  /** 启动时间 */
  runAt?: number
  /** 结束时间 */
  endAt?: number
  /** 执行结果 */
  result?: TaskResult
}

/**
 * 任务执行记录过滤条件
 */
export type TaskExecutionFilters = PageParams<
  Partial<Omit<TaskExecution, 'result' | 'createdAt' | 'runAt' | 'endAt'>>
> & {
  /** 创建时间 */
  createdAt?: MaxLengthArray<number, 2>
  /** 启动时间 */
  runAt?: MaxLengthArray<number, 2>
  /** 结束时间 */
  endAt?: MaxLengthArray<number, 2>
}

/**
 * 任务执行日志
 */
export interface TaskExecutionLog {
  /** 日志 id */
  id: number
  /** 执行记录 id */
  executionId: number
  /** 日志时间 */
  createdAt: number
  /** 日志级别 */
  level: TaskLogLevel
  /** 日志信息 */
  message: string
}
