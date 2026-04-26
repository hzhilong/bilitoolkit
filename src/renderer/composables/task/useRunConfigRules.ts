import { toValue, computed } from 'vue'
import type { FormRules } from 'element-plus'
import type { Task } from '@/shared/types/task.ts'

export const useRunConfigRules = (runConfig: Pick<Task, 'schedule' | 'enabled'>) => {
  return computed(() => {
    const runConfigData = toValue(runConfig)

    if (runConfigData == null) return {}

    const rules: FormRules = {
      enabled: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
      'schedule.type': [{ required: true, message: '请选择调度类型', trigger: 'change' }],
      'schedule.value': [
        { required: true, message: '请输入调度表达式', trigger: 'blur' },
        {
          validator: (_rule, value, callback) => {
            const scheduleType = runConfigData.schedule?.type
            if (scheduleType === 'cron') {
              if (!/^([0-5]?\d|\*) ([0-1]?\d|2[0-3]|\*) ([1-3]?\d|\*) ([1-9]|1[0-2]|\*) ([0-6]|\*)$/.test(value)) {
                callback(new Error('Cron 表达式格式错误'))
              } else callback()
            } else if (scheduleType === 'interval') {
              if (!/^\d+$/i.test(value)) {
                callback(new Error('间隔格式错误，请输入纯数字'))
              } else callback()
            } else callback()
          },
          trigger: 'blur',
        },
      ],
    }

    return rules
  })
}
