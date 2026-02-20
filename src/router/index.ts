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
      },
      // 文本对比工具
      {
        path: 'diff',
        name: 'Diff',
        component: () => import('@/tools/diff/Diff.vue'),
        meta: { title: '文本对比', icon: 'Document' }
      },
      // 二维码工具
      {
        path: 'qrcode',
        name: 'QRCode',
        component: () => import('@/tools/qrcode/QRCode.vue'),
        meta: { title: '二维码工具', icon: 'Promotion' }
      },
      // 密码生成器工具
      {
        path: 'password',
        name: 'password',
        component: () => import('@/tools/password/PasswordGenerator.vue'),
        meta: { title: '密码生成器', icon: 'Lock' }
      },
      // UUID 生成器工具
      {
        path: 'uuid',
        name: 'uuid',
        component: () => import('@/tools/uuid/UuidGenerator.vue'),
        meta: { title: 'UUID 生成器', icon: 'Coin' }
      },
      // JWT 工具
      {
        path: 'jwt',
        name: 'jwt',
        component: () => import('@/tools/jwt/JwtTool.vue'),
        meta: { title: 'JWT 工具', icon: 'Key' }
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
