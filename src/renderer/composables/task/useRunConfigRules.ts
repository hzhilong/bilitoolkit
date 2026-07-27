import { toValue, computed } from 'vue'
import type { FormRules } from 'element-plus'
import type { Task } from '@/shared/types/task.js'
import type { MaybeRefOrGetter } from '@vueuse/core'
import { isValidCron } from 'cron-validator'

export const useRunConfigRules = (runConfig: MaybeRefOrGetter<Pick<Task, 'schedule' | 'enabled'>>) => {
  return computed(() => {
    const runConfigData = toValue(runConfig)

    if (runConfigData == null) return {}

    const rules: FormRules = {
      enabled: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
      'schedule.type': [{ required: true, message: '请选择调度类型', trigger: 'change' }],
      'schedule.value': [
        { required: true, message: '请输入调度表达式', trigger: 'change' },
        {
          validator: async (_rule, value) => {
            const scheduleType = runConfigData.schedule?.type

            if (scheduleType === 'cron') {
              if (!isValidCron(value)) {
                throw new Error('Cron 表达式格式错误')
              }
            } else if (scheduleType === 'interval') {
              if (!/^\d+$/.test(value)) {
                throw new Error('间隔格式错误，请输入纯数字')
              }
            }
          },
          trigger: 'change',
        },
      ],
    }

    return rules
  })
}
