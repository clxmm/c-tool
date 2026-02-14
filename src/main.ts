/**
 * 应用入口文件
 * 初始化 Vue 应用并挂载到 DOM
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入 Element Plus 样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 中文语言包

import App from './App.vue'
import router from './router'
import './style.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(createPinia())    // 状态管理
app.use(router)           // 路由
app.use(ElementPlus, {
  locale: zhCn,          // 设置中文语言
})

// 挂载应用
app.mount('#app')
