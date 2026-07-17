<template>
  <PageContainer>
    <div class="header">
      <div class="title">下载列表</div>
      <div class="actions">
        <el-button @click="test()">测试</el-button>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/renderer/components/layout/PageContainer.vue'
import { toolkitApi } from '@/renderer/api/toolkit-api'
import { createBiliClient } from 'bilitoolkit-runtime/biliapi'
import type { AudioDownloadResource, VideoDownloadResource } from 'bilitoolkit-types'

const test = async () => {
  const user = await toolkitApi.user.switchUser(true)
  const client = await createBiliClient(user)

  const bvid = 'BV1toByBiEaM'
  const info = await client.videoInfo.getInfo({ bvid })
  const cid = info.cid

  const data = await client.videoPlayer.getPlayUrl({
    bvid,
    cid,
  })

  const audio: AudioDownloadResource = {
    audioQuality: data.dash!.audio![0].id,
    audio: data.dash!.audio![0],
  }
  const video: VideoDownloadResource = {
    videoQuality: data.dash!.video![0].id,
    video: data.dash!.video![0],
  }
  await toolkitApi.download.create({
    title: '测试',
    videos: [
      {
        snapshot: info,
        parts: [
          {
            snapshot: info.pages[0],
            subdirectory: 'test222/ttt',
            resources: [
              {
                type: 'audio',
                source: audio,
                fullFilename: '视频2.mp3',
              },
              {
                type: 'video',
                source: video,
                fullFilename: '视频2.mp4',
              },
            ],
          },
        ],
      },
    ],
    userCookie: user.userCookie,
    settings: {
      autoMerge: true,
    },
  })
}
</script>

<style scoped lang="scss"></style>
