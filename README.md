# 开发者工具箱

一个简洁、现代的前端开发工具集合，提供常用的开发辅助功能，支持明亮/暗黑主题切换。

## 功能特性 

- **JSON 格式化** - 格式化、验证、美化 JSON 字符串
- **时间戳转换** - 实时显示当前时间，支持时间戳与日期时间双向转换
- **Base64 转换** - 文本与 Base64 互转，支持图片转 Base64
- **等等** 
- **主题切换** - 支持明亮/暗黑模式，设置自动保存
- **简洁现代** - 基于 Element Plus 组件库，界面美观大方

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4+ | 渐进式 JavaScript 框架 |
| TypeScript | 5.3+ | JavaScript 的超集 |
| Vite | 5.0+ | 下一代前端构建工具 |
| Element Plus | 2.5+ | 基于 Vue 3 的组件库 |
| Pinia | 2.1+ | Vue 状态管理库 |
| Vue Router | 4.2+ | Vue 官方路由 |

## 项目结构

```
c-tool/
├── src/
│   ├── components/       # 公共组件（预留）
│   ├── tools/            # 各个工具页面
│   │   ├── json/         # JSON 格式化
│   │   ├── timestamp/    # 时间戳转换
│   │   └── base64/       # Base64 转换
│   ├── layouts/          # 布局组件
│   │   └── MainLayout.vue # 主布局（侧边栏+内容区）
│   ├── stores/           # Pinia 状态管理
│   │   └── theme.ts      # 主题切换 store
│   ├── router/           # 路由配置
│   │   └── index.ts      # 路由定义
│   ├── utils/            # 工具函数（预留）
│   ├── assets/           # 静态资源（预留）
│   ├── App.vue           # 根组件
│   ├── main.ts           # 应用入口
│   └── style.css         # 全局样式
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖配置
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── README.md             # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 16.0
- npm >= 8.0

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器，默认端口为 3000，自动打开浏览器：

```bash
npm run dev
```

### 生产构建

构建生产版本：

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 功能列表

| 功能名称 | 简介 | 状态 |
|----------|------|------|
| JSON 格式化 | 格式化、验证和美化 JSON 字符串 | ✅ |
| 时间戳转换 | 时间戳与日期时间相互转换 | ✅ |
| Base64 转换 | 文本编码与图片转 Base64 | ✅ |
| 文本对比 | 比较两段文本的差异 | ✅ |
| 二维码工具 | 生成二维码与扫描识别二维码 | ✅ |
| 密码生成器 | 根据自定义规则生成安全密码 | ✅ |

## 开发说明

### 添加新工具

1. 在 `src/tools/` 下创建新的工具目录和组件文件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/layouts/MainLayout.vue` 的 `menuRoutes` 中添加菜单项

### 添加公共组件

在 `src/components/` 下创建组件，然后在需要的页面中引入使用。

### 状态管理

使用 Pinia 进行状态管理，创建新的 store 文件到 `src/stores/` 目录。

## 浏览器支持

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | 最新版 |
| Edge | 最新版 |
| Firefox | 最新版 |
| Safari | 最新版 |

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-02-05)

- 初始版本发布
- 支持 JSON 格式化
- 支持时间戳转换
- 支持 Base64 转换（文本、图片）
- 支持明亮/暗黑主题切换
