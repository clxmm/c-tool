/**
 * 路由配置
 * 定义应用的所有路由和导航规则
 */

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 路由配置数组
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      // 首页：工具列表
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      // JSON 格式化工具
      {
        path: 'json',
        name: 'JsonFormat',
        component: () => import('@/tools/json/JsonFormat.vue'),
        meta: { title: 'JSON 格式化', icon: 'Document' }
      },
      // 时间戳工具
      {
        path: 'timestamp',
        name: 'Timestamp',
        component: () => import('@/tools/timestamp/Timestamp.vue'),
        meta: { title: '时间戳转换', icon: 'Clock' }
      },
      // Base64 转换工具
      {
        path: 'base64',
        name: 'Base64',
        component: () => import('@/tools/base64/Base64.vue'),
        meta: { title: 'Base64 转换', icon: 'Picture' }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - 开发者工具箱` : '开发者工具箱'
  next()
})

export default router
