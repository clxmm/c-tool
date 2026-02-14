<template>
  <!-- 根组件：应用主布局 -->
  <div id="app" :class="{ 'dark': isDark }">
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * App.vue - 根组件
 * 负责应用级别的布局和主题切换
 */

import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

// 获取主题 store
const themeStore = useThemeStore()

// 是否为暗黑模式
const isDark = computed(() => themeStore.isDark)
</script>

<style>
/* 全局样式在 style.css 中定义 */
</style>
