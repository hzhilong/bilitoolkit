# 开发文档

## 项目模块

- [bilitoolkit](https://github.com/hzhilong/bilitoolkit) 主项目
- [bili-api](https://github.com/hzhilong/bili-api) bili-api 库
- [bilitoolkit-types](https://github.com/hzhilong/bilitoolkit-types) 类型库
- [bilitoolkit-runtime](https://github.com/hzhilong/bilitoolkit-runtime) 运行库
- [bilitoolkit-ui](https://github.com/hzhilong/bilitoolkit-ui) UI 库
- [bilitoolkit-plugin-example](https://github.com/hzhilong/bilitoolkit-plugin-example) 插件示例

## 环境说明

项目采用 **pnpm monorepo** 方式进行本地开发，各子项目在 GitHub 中分别维护。

## 获取源码

下载 `bilitoolkit` 源码后，进入项目目录。

由于源码仓库中使用了 `workspace:^` 作为本地 workspace 依赖，直接安装依赖前需要先修改版本号。

## 安装依赖

### 修改 workspace 依赖

检查各 `package.json`，将：

```json
"workspace:^"
```

修改为对应依赖包的**最新版本号**。

### 安装依赖

执行：

```bash
npm i --legacy-peer-deps
```

## 构建项目

首次安装依赖后，依次执行：

```bash
npm run build:all
npm run rebuild:native
```

用于完成预加载脚本及原生模块的构建。

## 开发

启动开发环境：

```bash
npm run dev
```

## 打包

项目提供两种相关脚本：

```bash
npm run build
```

执行项目构建。

```bash
npm run app:dist
```

执行应用打包，生成最终分发文件。
