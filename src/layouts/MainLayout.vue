<template>
  <!-- 主布局：侧边栏导航 + 内容区域 -->
  <div class="main-layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- 品牌标识区 -->
      <div class="sidebar-brand">
        <!-- 品牌图标（始终显示） -->
        <el-icon class="brand-icon" :size="20">
          <Tools />
        </el-icon>
        <span class="brand-text">DevTools</span>
        <!-- 折叠按钮 -->
        <button class="collapse-btn" @click="toggleCollapse" title="折叠/展开">
          <el-icon :size="16">
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link
          v-for="route in menuRoutes"
          :key="route.name"
          :to="{ name: route.name }"
          class="nav-item"
          :class="{ active: isActive(route.name) }"
          :title="isCollapsed ? route.meta.title : ''"
        >
          <el-icon class="nav-icon">
            <component :is="route.meta.icon" />
          </el-icon>
          <span class="nav-label">{{ route.meta.title }}</span>
        </router-link>
      </nav>

      <!-- 底部主题切换 -->
      <div class="sidebar-footer">
        <button
          class="theme-toggle"
          :class="{ 'theme-dark': isDark }"
          @click="toggleTheme"
          :title="isCollapsed ? (isDark ? '切换亮色' : '切换深色') : '切换主题'"
        >
          <el-icon v-if="isDark" :size="18">
            <Sunny />
          </el-icon>
          <el-icon v-else :size="18">
            <Moon />
          </el-icon>
        </button>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 页面内容容器 -->
      <div class="content-wrapper">
        <!-- <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view> -->
        <router-view/>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * MainLayout.vue - 主布局组件
 * 控制台风格布局，包含侧边栏导航、主题切换和折叠功能
 */

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import {
  Tools,
  HomeFilled,
  Document,
  Clock,
  Picture,
  Moon,
  Sunny,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import type { Component } from 'vue'

// 获取路由相关
const route = useRoute()

// 获取主题 store
const themeStore = useThemeStore()

/**
 * 是否为暗黑模式
 */
const isDark = computed(() => themeStore.isDark)

/**
 * 侧边栏是否折叠
 */
const isCollapsed = ref(false)

/**
 * 切换侧边栏折叠状态
 */
const toggleCollapse = (): void => {
  isCollapsed.value = !isCollapsed.value
}

/**
 * 导航路由配置
 */
interface MenuRoute {
  name: string
  meta: {
    title: string
    icon: Component
  }
}

const menuRoutes: MenuRoute[] = [
  { name: 'Home', meta: { title: '首页', icon: HomeFilled } },
  { name: 'JsonFormat', meta: { title: 'JSON 格式化', icon: Document } },
  { name: 'Timestamp', meta: { title: '时间戳转换', icon: Clock } },
  { name: 'Base64', meta: { title: 'Base64 转换', icon: Picture } },
  { name: 'Diff', meta: { title: '文本对比', icon: Document } }
]

/**
 * 判断路由是否激活
 * @param name - 路由名称
 * @returns 是否激活
 */
const isActive = (name: string): boolean => {
  return route.name === name
}

/**
 * 切换主题
 */
const toggleTheme = (): void => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
/* ===================================
   主布局容器
   =================================== */
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: var(--bg-deep);
  overflow: hidden;
}

/* ===================================
   侧边栏
   =================================== */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.25s ease,
              border-color 0.25s ease;
  z-index: 10;
}

/* 折叠状态 */
.sidebar.collapsed {
  width: 64px;
}

/* ===================================
   侧边栏品牌区
   =================================== */
.sidebar-brand {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  gap: var(--space-sm);
}

.brand-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}

/* 折叠状态下隐藏品牌图标 */
.sidebar.collapsed .brand-icon {
  display: none;
}

.brand-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.2s ease;
  flex: 1;
}

/* 折叠状态下隐藏品牌文字 */
.sidebar.collapsed .brand-text {
  opacity: 0;
  width: 0;
  flex: 0;
}

/* 折叠按钮 */
.collapse-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* 折叠状态下整个品牌区居中显示折叠按钮 */
.sidebar.collapsed .sidebar-brand {
  justify-content: center;
  padding: 0;
  gap: 0;
}

.sidebar.collapsed .collapse-btn {
  width: 28px;
  height: 28px;
}

/* ===================================
   侧边栏导航
   =================================== */
.sidebar-nav {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  height: 40px;
  padding: 0 var(--space-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  font-size: 14px;
}

.nav-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* 激活状态 */
.nav-item.active {
  background-color: rgba(22, 93, 255, 0.1);
  color: var(--accent-primary);
}

/* 激活状态左侧指示条 */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: var(--accent-primary);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 1;
  transition: opacity 0.2s ease;
}

/* 折叠状态下隐藏导航文字 */
.sidebar.collapsed .nav-label {
  opacity: 0;
  width: 0;
}

/* 折叠状态下导航项居中 */
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0;
  gap: 0;
}

/* 折叠状态下激活指示条居中 */
.sidebar.collapsed .nav-item.active::before {
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

/* ===================================
   侧边栏底部
   =================================== */
.sidebar-footer {
  padding: var(--space-md);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: center;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--bg-elevated);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

/* 折叠状态下主题切换按钮尺寸变小 */
.sidebar.collapsed .theme-toggle {
  width: 32px;
  height: 32px;
}

/* ===================================
   主内容区域
   =================================== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* ===================================
   页面切换动画
   =================================== */
.page-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-content {
    width: 100%;
  }
}
</style>
