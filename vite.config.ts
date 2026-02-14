import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Vite 配置文件
// 用于构建和开发环境配置
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置路径别名，方便导入
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000, // 开发服务器端口
    open: true  // 自动打开浏览器
  }
})
