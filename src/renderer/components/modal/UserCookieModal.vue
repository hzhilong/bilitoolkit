<script setup lang="ts">
import { watch, ref } from 'vue'
import { USER_COOKIE_NAMES, type UserCookie } from '@ybgnb/bili-api'
import type { FormInstance } from 'element-plus'
import { showWarning } from 'bilitoolkit-ui'

const props = withDefaults(
  defineProps<{
    // 用户 cookie，为空则表示新建
    cookie?: string
  }>(),
  {},
)

const visible = defineModel({ required: true, type: Boolean })
const formRef = ref<FormInstance>()

type UserCookieKey = (typeof USER_COOKIE_NAMES)[number]
type UserCookieObj = { [key in UserCookieKey]: string }
const userCookie = ref<UserCookieObj>(Object.fromEntries(USER_COOKIE_NAMES.map((key) => [key, ''])) as UserCookieObj)

const resetUserCookie = () => {
  USER_COOKIE_NAMES.forEach((name) => {
    userCookie.value[name] = ''
  })
}

function parseCookieString(cookie: string) {
  return cookie
    .split(';')
    .map((item) => [item.slice(0, item.indexOf('=')).trim(), item.slice(item.indexOf('=') + 1).trim()])
}

const loadUserCookie = () => {
  if (props.cookie) {
    for (const [name, value] of parseCookieString(props.cookie)) {
      userCookie.value[name as UserCookieKey] = value
    }
  }
}

watch(visible, (newVal) => {
  if (newVal) {
    resetUserCookie()
    loadUserCookie()
  }
})

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submit', userCookie: UserCookie): void
}>()

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const cookie = Object.entries(userCookie.value)
        .map(([name, value]) => name + '=' + value)
        .join(';')
      emit('submit', {
        uid: Number(userCookie.value['DedeUserID']),
        bili_jct: userCookie.value['bili_jct'],
        cookie: cookie,
      })
      visible.value = false
    }
  })
}

const cookieString = ref<string>('')
const handleParseCookieStr = () => {
  if (!cookieString.value) {
    showWarning('cookie 字符串为空')
  } else {
    const map = Object.fromEntries(parseCookieString(cookieString.value))
    USER_COOKIE_NAMES.forEach((name) => {
      userCookie.value[name] = map[name]
    })
  }
}
</script>

<template>
  <el-dialog
    title="用户 cookie"
    v-model="visible"
    width="76%"
    style="max-width: 96%; min-width: 76%; max-height: 90vh; overflow: hidden"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    align-center
  >
    <div class="content">
      <div class="cookie-hint">
        <pre>
建议改成自己常用浏览器中的 Cookie 信息，以避免风控。
以 Chrome 为例：打开 B站 → 按 F12 → 顶部[应用] → 左侧[Cookie] →
选中左侧其中一个条目后，即可在右侧查看 cookie 名称和对应值。</pre
        >
      </div>

      <el-form ref="formRef" class="cookie-form" :model="userCookie" label-position="left" label-width="auto">
        <el-form-item label="解析cookie字符串" style="flex-wrap: nowrap">
          <div style="width: 100%; display: flex; align-items: center">
            <el-input v-model="cookieString" :placeholder="`使用请求头的 Cookie 字符串快速解析`" clearable />
            <el-button style="margin-left: 10px" @click="handleParseCookieStr">解析</el-button>
          </div>
        </el-form-item>
        <el-form-item
          v-for="name in USER_COOKIE_NAMES"
          :key="name"
          :prop="name"
          :label="name"
          :required="name !== 'sid'"
        >
          <el-input v-model="userCookie[name]" :placeholder="`请输入 ${name}`" clearable />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.content {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .cookie-hint {
    font-size: 14px;
    line-height: 1.6;
    font-weight: bold;
    color: var(--app-color-primary-transparent-85);
    border-radius: 10px;
    border: 2px dashed var(--app-color-primary-transparent-85);
    text-shadow: 0px 1px 2px var(--app-color-primary-transparent-5);
    text-align: center;
  }

  .cookie-form {
    margin-top: 4px;
  }
}
</style>
