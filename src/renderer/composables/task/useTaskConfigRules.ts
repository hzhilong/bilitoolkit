import type { TaskConfigField } from 'bilitoolkit-types'
import { toValue, computed } from 'vue'
import type { FormRules } from 'element-plus'

export const useTaskConfigRules = (fields?: TaskConfigField[]) => {
  return computed(() => {
    const fieldList = toValue(fields)

    if (fieldList == null) return {}

    const rules: FormRules = {}

    for (const field of fieldList) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldRules: any[] = []

      // 必填校验
      if (field.required) {
        fieldRules.push({
          required: true,
          message: `${field.label}不能为空`,
          trigger: field.type === 'input' || field.type === 'textarea' ? 'blur' : 'change',
          // 自定义验证器以支持不同类型（数组、布尔等）
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validator: (_rule: any, value: any, callback: any) => {
            if (value === undefined || value === null) {
              callback(new Error(`${field.label}不能为空`))
              return
            }
            if (field.type === 'users' && Array.isArray(value) && value.length === 0) {
              callback(new Error(`${field.label}不能为空`))
              return
            }
            if (field.type === 'switch' && typeof value !== 'boolean') {
              callback(new Error(`${field.label}必须为开关状态`))
              return
            }
            if (typeof value === 'string' && value.trim() === '') {
              callback(new Error(`${field.label}不能为空`))
              return
            }
            callback()
          },
        })
      }

      // 正则校验（仅对字符串类型的字段有效）
      if (field.regex && (field.type === 'input' || field.type === 'textarea')) {
        try {
          const regex = new RegExp(field.regex)
          fieldRules.push({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validator: (_rule: any, value: any, callback: any) => {
              if (value === undefined || value === null || value === '') {
                callback() // 空值交给 required 处理，这里不重复报错
                return
              }
              if (typeof value === 'string' && !regex.test(value)) {
                callback(new Error(`${field.label}格式不正确`))
              } else if (typeof value !== 'string' && !regex.test(String(value))) {
                callback(new Error(`${field.label}格式不正确`))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          })
        } catch (e) {
          console.warn(`正则表达式解析失败: ${field.regex}`, e)
        }
      }

      if (fieldRules.length > 0) {
        rules[field.name] = fieldRules
      }
    }

    return rules
  })
}
