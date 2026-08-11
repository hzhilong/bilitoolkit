# 哔哩工具姬

一款面向 B 站用户的开源工具箱，支持在线安装和卸载插件，可登录多个账号并按需选择账号执行插件。

## 技术栈

`Vue 3` + `Electron` + `TypeScript` + `Element Plus`

### [插件列表](https://github.com/hzhilong/bilitoolkit-plugins)

| 插件名称                                     | 描述                                     |
|------------------------------------------|----------------------------------------|
| [哔哩备份姬](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-backup) | 一键备份和还原 B 站账号数据，快速完成账号数据迁移。            |
| [速升姬](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-quick-upgrade) | 用于自动完成每日经验任务，包括每日登录、观看、投币和分享。          |
| [弹幕工具箱](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-danmaku) | 快速查询弹幕及发送者。                            |
| [图片下载](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-image-downloader) | 快速下载专栏、动态、评论中的图片与表情包，以及视频封面、直播封面和用户头像。 |
| [视频下载](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-video-downloader) | 下载视频、音频、弹幕、字幕、封面等资源                    |
| [透明头像](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-transparent-avatar) | 上传半透明的用户头像                             |
| [评论搜索](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-comment-search)  | 根据 UID 或关键词，快速搜索评论区评论                    |
| [移除机器人粉丝](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-remove-bot-followers) | 批量移除并拉黑粉丝中的机器人或片姐                    |
| [视频存档](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-video-archive)   | 自动保存指定用户的最新视频投稿，方便补档                    |
| [评论导出](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-comment-export)  | 导出评论，支持本地浏览和查询                         |
| [动态删除](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-dynamic-delete)  | 可批量删除动态，包括转发、抽奖以及图文动态                  |
| [批量取关](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-batch-unfollow)  | 批量取消关注用户，可选择关注分组进行操作                  |
| [黑名单分享](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-blacklist-share) | 支持黑名单列表导出与导入，方便用户共享黑名单数据并批量拉黑                  |
| [评论删除](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-comment-clear)   | 批量删除自己发布过的评论                  |
| [动态互动数据](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-dynamic-interactions) | 查看图文动态的点赞与转发用户                  |
| [动态存档](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-dynamic-archive) | 自动保存指定用户的最新图文动态                  |
| [弹幕投票](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-danmaku-poll)   | 直播弹幕投票（非官方投票功能）                  |
| [收藏夹存档](https://github.com/hzhilong/bilitoolkit-plugins/blob/main/bilitoolkit-plugin-fav-archive)   | 自动下载收藏夹中所有视频                  |

## [开发说明](./doc/development.md)

## 截图

![v-002.png](doc/screenshots/v-002.png)

## 注意事项

* 使用本项目产生的任何后果由使用者自行承担；
* 本项目仅供学习、研究和技术交流使用，请勿将其用于违反相关平台规则的用途；
* 本项目与哔哩哔哩官方无任何关联。

## 致谢

- [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- [remixicon](https://github.com/Remix-Design/RemixIcon)
