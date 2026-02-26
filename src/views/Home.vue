<template>
  <!-- 首页：工具网格展示 -->
  <div class="home">
    <!-- 简洁的页面标题区 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">开发者工具箱</h1>
        <p class="page-subtitle">高效开发 · 一站式工具集合</p>
      </div>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索工具..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </div>

    <!-- 工具网格布局 -->
    <div class="tools-grid">
      <!-- 工具卡片 - 动态渲染 -->
      <div
        v-for="(tool, index) in tools"
        :key="tool.path"
        class="tool-card"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="navigateTo(tool.path)"
      >
        <!-- 卡片图标区 -->
        <div class="card-icon" :class="`icon-${tool.colorTheme}`">
          <el-icon :size="28">
            <component :is="tool.icon" />
          </el-icon>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <h3 class="card-title">{{ tool.title }}</h3>
          <p class="card-desc">{{ tool.description }}</p>
        </div>

        <!-- 卡片操作指示器 -->
        <div class="card-action">
          <span class="action-text">打开工具</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Home.vue - 首页组件
 * 展示所有工具的网格卡片，采用现代科技感设计
 * 点击卡片可跳转到对应工具页面
 */

import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { Document, Clock, Picture, ArrowRight, Promotion, Lock, Coin, Key, Search } from '@element-plus/icons-vue'
import type { Component } from 'vue'

// 获取路由配置中定义的工具列表
const toolRoutes: { name: string; path: string; meta: any }[] = [
  { name: 'JsonFormat', path: 'json', meta: { title: 'JSON 格式化', icon: Document, colorTheme: 'blue' } },
  { name: 'Timestamp', path: 'timestamp', meta: { title: '时间戳转换', icon: Clock, colorTheme: 'green' } },
  { name: 'Base64', path: 'base64', meta: { title: 'Base64 转换', icon: Picture, colorTheme: 'purple' } },
  { name: 'Diff', path: 'diff', meta: { title: '文本对比', icon: Document, colorTheme: 'orange' } },
  { name: 'QRCode', path: 'qrcode', meta: { title: '二维码工具', icon: Promotion, colorTheme: 'blue' } },
  { name: 'password', path: 'password', meta: { title: '密码生成器', icon: Lock, colorTheme: 'green' } },
  { name: 'uuid', path: 'uuid', meta: { title: 'UUID 生成器', icon: Coin, colorTheme: 'purple' } },
  { name: 'jwt', path: 'jwt', meta: { title: 'JWT 工具', icon: Key, colorTheme: 'orange' } }
]

// 路由实例
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 工具卡片配置
interface ToolConfig {
  path: string
  title: string
  description: string
  icon: Component
  colorTheme: 'blue' | 'green' | 'purple' | 'orange'
}

/**
 * 获取工具描述
 */
const getToolDescription = (name: string): string => {
  const descriptions: Record<string, string> = {
    'JsonFormat': '格式化、验证和美化 JSON 字符串',
    'Timestamp': '时间戳与日期时间相互转换',
    'Base64': '文本编码与图片转 Base64',
    'Diff': '比较两段文本的差异',
    'QRCode': '生成二维码与扫描识别二维码',
    'password': '根据自定义规则生成安全密码',
    'uuid': '生成标准 UUID（通用唯一识别码）',
    'jwt': 'JSON Web Token 解密、加密、校验'
  }
  return descriptions[name] || ''
}

// 根据搜索关键词过滤的工具列表
const filteredTools = computed((): ToolConfig[] => {
  if (!searchKeyword.value.trim()) {
    return toolRoutes.map((route) => ({
      path: `/${route.path}`,
      title: route.meta.title,
      description: getToolDescription(route.name),
      icon: route.meta.icon,
      colorTheme: route.meta.colorTheme || 'blue'
    }))
  }
  const keyword = searchKeyword.value.toLowerCase()
  return toolRoutes
    .filter(route => route.meta.title.toLowerCase().includes(keyword))
    .map(route => ({
      path: `/${route.path}`,
      title: route.meta.title,
      description: getToolDescription(route.name),
      icon: route.meta.icon,
      colorTheme: route.meta.colorTheme || 'blue'
    }))
})

const tools = computed(() => filteredTools.value)

/**
 * @param path - 目标路由路径
 */
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* ===================================
   页面容器
   =================================== */
.home {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-xl);
}

/* ===================================
   页面标题区
   =================================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2xl) 0 var(--space-xl);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* ===================================
   工具网格布局
   =================================== */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

/* ===================================
   工具卡片样式
   =================================== */
.tool-card {
  position: relative;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  transition: all 0.2s ease;
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0;
}

/* 卡片悬停效果 */
.tool-card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* 卡片激活状态 */
.tool-card:active {
  transform: translateY(0);
}

/* ===================================
   卡片图标
   =================================== */
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.2s ease;
}

.tool-card:hover .card-icon {
  transform: scale(1.05);
}

/* 图标主题色 */
.icon-blue {
  background: linear-gradient(135deg, #165dff 0%, #4d6fff 100%);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

.icon-green {
  background: linear-gradient(135deg, #0d7377 0%, #10b981 100%);
  box-shadow: 0 4px 12px rgba(13, 115, 119, 0.3);
}

.icon-purple {
  background: linear-gradient(135deg, #4f5ff5 0%, #8b5cf6 100%);
  box-shadow: 0 4px 12px rgba(79, 95, 245, 0.3);
}

.icon-orange {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

/* ===================================
   卡片内容
   =================================== */
.card-content {
  flex: 1;
  width: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  line-height: 1.4;
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===================================
   卡片操作指示器
   =================================== */
.card-action {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 13px;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
  margin-top: var(--space-xs);
}

.tool-card:hover .card-action {
  color: var(--accent-primary);
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.tool-card:hover .arrow-icon {
  transform: translateX(4px);
}

/* ===================================
   搜索框
   =================================== */
.search-box {
  width: 280px;
}

.search-input {
  width: 100%;
}

:deep(.search-input .el-input__wrapper) {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
  box-shadow: none;
  transition: all 0.2s ease;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: var(--border-medium);
}

:deep(.search-input .el-input__wrapper.is-focus) {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

:deep(.search-input .el-input__inner) {
  color: var(--text-primary);
}

:deep(.search-input .el-input__inner::placeholder) {
  color: var(--text-tertiary);
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .home {
    padding: 0 var(--space-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-xl) 0 var(--space-lg);
  }

  .search-box {
    width: 100%;
  }

  .page-title {
    font-size: 24px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .tool-card {
    padding: var(--space-md);
  }
}
</style>
