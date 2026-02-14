/**
 * 主题状态管理 Store
 * 使用 Pinia 管理主题切换状态
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 是否为暗黑模式，默认从 localStorage 读取
  const isDark = ref<boolean>(localStorage.getItem('theme') === 'dark')

  /**
   * 切换主题
   * 在亮色和暗黑模式之间切换
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  /**
   * 设置主题
   * @param dark 是否为暗黑模式
   */
  const setTheme = (dark: boolean) => {
    isDark.value = dark
  }

  // 监听主题变化，更新 localStorage 和 document class
  watch(isDark, (newVal) => {
    localStorage.setItem('theme', newVal ? 'dark' : 'light')
    if (newVal) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  return {
    isDark,
    toggleTheme,
    setTheme
  }
})
