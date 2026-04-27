import { CronExpressionParser } from 'cron-parser'

/**
 * 获取 cron 在当前时间之前最近一次应执行的时间
 */
export function getPreviousCronTime(expression: string, now: number): number | undefined {
  try {
    const interval = CronExpressionParser.parse(expression, {
      currentDate: new Date(now),
    })

    return interval.prev().getTime()
  } catch (e) {
    console.error(e)
    return undefined
  }
}
