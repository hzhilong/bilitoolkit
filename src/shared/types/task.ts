/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TaskSchedule, TaskResult, TaskConfigField, TaskConfigSchema } from 'bilitoolkit-types'
import type { InstalledToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import type { MaxLengthArray, LogLevel } from '@ybgnb/utils'

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
  /** 最后一次运行时间 */
  lastRunAt?: number
  /** 是否启用 */
  enabled: boolean
}

export interface TaskWithPlugin extends Task {
  plugin?: TaskPluginInfo
}

/**
 * 任务状态
 */
export type TaskExecutionStatus = 'running' | 'success' | 'error' | 'canceled'

/** 任务主键 */
export type TaskId = number

/** 任务执行记录主键 */
export type TaskExecutionId = number

/**
 * 任务触发来源名称映射
 */
export const TaskTriggerMap = {
  manual: '手动执行',
  schedule: '调度触发',
  bootstrap: '启动补跑',
} as const

/**
 * 任务触发来源
 * - manual：手动执行
 * - schedule：调度触发
 * - bootstrap：应用启动后的补跑
 */
export type TaskTrigger = keyof typeof TaskTriggerMap

/**
 * 任务执行记录
 */
export interface TaskExecution {
  /** 执行记录 id */
  id: number
  /** 任务 id */
  taskId: number
  /** 触发来源 */
  trigger: TaskTrigger
  /** 执行状态 */
  status: TaskExecutionStatus
  /** 启动时间 */
  startedAt: number
  /** 结束时间 */
  endedAt?: number
  /** 执行结果 */
  result?: TaskResult
}

/**
 * 任务执行记录过滤条件
 */
export type TaskExecutionFilters = Partial<Omit<TaskExecution, 'result' | 'startedAt' | 'endedAt'>> & {
  /** 启动时间 */
  startedAt?: MaxLengthArray<number, 2>
  /** 结束时间 */
  endedAt?: MaxLengthArray<number, 2>
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
  level: LogLevel
  /** 日志信息 */
  message: string
}

/**
 * 创建任务的输入
 */
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt'>

/**
 * 创建任务时的选项
 */
export interface CreateTaskOptions {
  /** 创建后是否立即执行一次 */
  runImmediately?: boolean
}

/**
 * 更新任务的输入
 */
export type UpdateTaskInput = Pick<Task, 'id'> & TaskUpdate

/**
 * 更新任务时的选项
 */
export interface UpdateTaskOptions {
  /** 更新后是否尝试立即补跑一次。一般仅在“从禁用改为启用”时才考虑开启 */
  runImmediately?: boolean
}

/**
 * 任务派发结果
 */
export interface TaskDispatchResult {
  /** 是否接受了这次请求 */
  accepted: boolean

  /** 如果同一 task 正在运行，本次是否被折叠为 pending */
  queued: boolean

  /** 执行记录（已真正开始时才有） */
  execution?: TaskExecution

  /** 原因说明 */
  reason?: string
}

// 导出辅助类型，方便在 Service 层使用
export type NewTask = Omit<Task, 'id'>
export type TaskUpdate = Pick<Task, 'id'> & Partial<Omit<Task, 'pluginId' | 'createdAt' | 'id'>>
export type NewTaskExecution = Omit<TaskExecution, 'id'>
export type TaskExecutionUpdate = Pick<TaskExecution, 'id'> &
  Partial<Omit<TaskExecution, 'taskId' | 'createdAt' | 'id'>>
export type NewTaskExecutionLog = Omit<TaskExecutionLog, 'id'>
