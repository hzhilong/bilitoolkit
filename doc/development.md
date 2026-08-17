# 开发文档

## 哔哩工具姬

### 项目模块

- [bilitoolkit](https://github.com/hzhilong/bilitoolkit) 哔哩工具姬
- [bili-api](https://github.com/hzhilong/bili-api) biliapi 库
- [bilitoolkit-types](https://github.com/hzhilong/bilitoolkit-types) 类型库
- [bilitoolkit-runtime](https://github.com/hzhilong/bilitoolkit-runtime) 运行库
- [bilitoolkit-ui](https://github.com/hzhilong/bilitoolkit-ui) UI 库
- [bilitoolkit-plugins](https://github.com/hzhilong/bilitoolkit-plugins) 插件列表

### 项目描述

一个基于 Electron 构建的**插件化桌面平台**，通过插件机制扩展平台功能。平台提供统一的基础 API 与运行环境，插件以 npm 包的形式发布、安装和管理。

平台支持 **UI 插件**与 **Task 插件**两种插件类型：

* **UI 插件**：提供交互界面和可视化功能。平台使用 `WebContentsView` 创建独立的插件视图，并为不同插件配置独立的 Electron `session`，实现运行环境与 Cookie、Storage、缓存等数据的隔离。

  > 因为要在插件视图上面显示类似【账号选择弹窗】的平台页面，所以这里选择使用`WebContentsView`。

* **Task 插件**：用于执行自动化任务。平台通过 `worker_threads` 隔离任务线程，并通过 `vm + Sandbox` 限制 Task 插件可访问的运行环境。

  > 这里并未实现真正意义上的安全沙箱。

### 环境说明

项目采用 **pnpm monorepo** 方式进行本地开发，各子项目在 GitHub 中分别维护。

### 安装依赖

由于源码仓库中使用了 `workspace:^` 作为本地 workspace 依赖，直接安装依赖前需要先修改版本号（或者将其他项目放在一个 pnpm mono 项目里）。

#### 修改 workspace 依赖

检查各 `package.json`，将：

```json
"workspace:^"
```

修改为对应依赖包的**最新版本号**。

#### 安装依赖

执行：

```bash
npm i
# 如果报错 请使用 npm i --legacy-peer-deps
```

### 构建项目

首次安装依赖后，依次执行：

```bash
npm run build:all
npm run rebuild:native
```

用于完成预加载脚本及原生模块的构建。

### 开发

启动开发环境：

```bash
npm run dev
```

### 打包

依次执行脚本：

```bash
# 执行项目构建
npm run build
# 执行应用打包
npm run app:dist
```

## 插件开发

待完善...
