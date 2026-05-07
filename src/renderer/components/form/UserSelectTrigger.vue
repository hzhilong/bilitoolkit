<template>
  <div class="multi-user-select">
    <div class="user-tags-wrapper">
      <el-tag
        v-for="user in modelValue"
        :key="user.mid"
        closable
        @close="handleRemoveUser(user)"
        class="user-tag"
        :disable-transitions="true"
      >
        <div class="user-tag__info">
          <img class="user-tag__info__face" :src="user.face" alt="" />
          <span class="user-tag__info__name">{{ user.name }}</span>
          <span class="user-tag__info__uid">{{ user.mid }}</span>
        </div>
      </el-tag>
      <span v-if="!modelValue.length" class="placeholder">请选择用户</span>
    </div>
    <el-button type="primary" @click="handleSelectClick" size="small">选择</el-button>
  </div>
</template>

<script setup lang="ts">
import type { UserInfoWithCookie } from '@ybgnb/bili-api'
import { AppUserSelectDialog } from '@/renderer/components/dialog/userSelectService.js'

const props = defineProps<{
  modelValue: UserInfoWithCookie[]
  multiple: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserInfoWithCookie[]): void
}>()

const handleRemoveUser = (user: UserInfoWithCookie) => {
  const newList = props.modelValue.filter((u) => u.mid !== user.mid)
  emit('update:modelValue', newList)
}

const handleSelectClick = async () => {
  const disableUserList = props.multiple ? props.modelValue : []
  const emptyMessage = props.multiple && disableUserList.length > 0 ? '当前可选择的用户为空' : undefined

  const user = await AppUserSelectDialog.show({ title: '请选择用户', disableUserList, emptyMessage })
  if (!props.multiple) {
    emit('update:modelValue', [user])
  } else {
    const newList = props.modelValue.filter((u) => u.mid !== user.mid)
    newList.push(user)
    emit('update:modelValue', newList)
  }
}
</script>

<style scoped lang="scss">
.multi-user-select {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 4px 12px;
  flex-wrap: wrap;
}

.user-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

::v-deep(.user-tag) {
  .user-tag__info {
    display: flex;
    align-items: center;
    gap: 6px;
    &__face {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    &__name {
    }
    &__uid {
    }
  }
}

.placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}
</style>
