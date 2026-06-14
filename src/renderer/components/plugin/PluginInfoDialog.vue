<script setup lang="ts">
import type { ToolkitPlugin } from '@/shared/types/toolkit-plugin.js'
import { ref, watch, computed } from 'vue'
import { ExternalLink } from 'bilitoolkit-ui'
import { parseReadmeToHtml } from '@/renderer/utils/parse-md'
import { parseGithubRepoUrl } from '@ybgnb/utils'
import MarkdownIt from 'markdown-it'
import { getPackage } from 'public-registry-api'
import { parseNpmPackage } from '@/shared/utils/plugin-parse'

const plugin = defineProps<ToolkitPlugin>()
const visible = defineModel<boolean>({ required: true })
const defaultReadme = '加载 readme.md 中...'
const readmeData = ref(defaultReadme)
const title = computed(() => {
  return `${plugin.name}  ${plugin.id}`
})

const md = new MarkdownIt({
  html: true,
})

watch(visible, async (newValue) => {
  if (!newValue) {
    readmeData.value = defaultReadme
    return
  }

  if (!plugin?.id) {
    return
  }

  const pkg = parseNpmPackage(await getPackage(plugin.id))

  const readme = await fetch(`https://cdn.jsdelivr.net/npm/${pkg.id}@${pkg.version}/README.md`).then((r) => r.text())
  let html: string

  if (!pkg.links.repository) {
    html = md.render(readme)
  } else {
    const { owner, repo, branch } = parseGithubRepoUrl(pkg.links.repository)

    const baseUrl = pkg.links.repositoryDir
      ? `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${pkg.links.repositoryDir}/`
      : `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/`

    html = parseReadmeToHtml(md, readme, baseUrl)
  }

  readmeData.value = html
})
</script>

<template>
  <!-- 只留一个右上角的关闭按钮 -->
  <el-dialog v-model="visible" :title="title" width="min(800px, 80%)" :append-to-body="true">
    <div class="content">
      <div class="pkg-infos">
        <div class="info">作者：{{ author }}</div>
        <div class="info">版本：{{ version }}</div>
        <div class="info">发布日期：{{ date }}</div>
      </div>
      <div class="pkg-infos">
        <ExternalLink :url="links.npm">{{ links.npm }}</ExternalLink>
      </div>
      <div class="readme markdown-body" v-html="readmeData"></div>
    </div>
    <template #footer> </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.content {
  width: 100%;

  .pkg-infos {
    width: 100%;

    display: flex;
    align-content: center;
    gap: 20px;
  }

  .readme {
    padding: 20px;
  }
}
</style>

<style lang="scss">
.markdown-body {
  line-height: 1.75;
  font-size: 14px;
  word-break: break-word;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin: 1em 0 0.5em;
  font-weight: 600;
}

.markdown-body p {
  margin: 0.75em 0;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5em;
}

.markdown-body li {
  margin: 0.25em 0;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
}

.markdown-body pre {
  padding: 12px;
  overflow-x: auto;
  border-radius: 6px;
}

.markdown-body code {
  padding: 2px 4px;
  border-radius: 4px;
}

.markdown-body blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid var(--el-border-color);
  color: var(--el-text-color-secondary);
}

.markdown-body table {
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
}
</style>
