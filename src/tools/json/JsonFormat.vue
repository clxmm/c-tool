<template>
  <!-- JSON 格式化工具 -->
  <div class="json-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">JSON 格式化</h1>
      <p class="tool-subtitle">格式化、验证和美化 JSON 字符串</p>
    </div>

    <!-- 工具面板 -->
    <div class="tool-panel">
      <!-- 操作工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-label">JSON 数据</span>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-secondary" @click="generateDemo">
            <el-icon><Document /></el-icon>
            <span>示例</span>
          </button>
          <button class="btn btn-secondary" @click="compressJson">
            <el-icon><Fold /></el-icon>
            <span>压缩</span>
          </button>
          <button class="btn btn-secondary" @click="escapeJson">
            <el-icon><Lock /></el-icon>
            <span>转义</span>
          </button>
          <button class="btn btn-secondary" @click="unescapeJson">
            <el-icon><Unlock /></el-icon>
            <span>去除转义</span>
          </button>
          <button class="btn btn-secondary" @click="compressAndEscapeJson">
            <el-icon><FolderOpened /></el-icon>
            <span>压缩并转义</span>
          </button>
          <button class="btn btn-secondary" @click="toUnicode">
            <el-icon><Position /></el-icon>
            <span>Unicode转中文</span>
          </button>
          <button class="btn btn-secondary" @click="toChinese">
            <el-icon><Connection /></el-icon>
            <span>中文转Unicode</span>
          </button>
          <button class="btn btn-secondary" @click="clearAll">
            <el-icon><Delete /></el-icon>
            <span>清空</span>
          </button>
          <button class="btn btn-secondary" @click="downloadJson">
            <el-icon><Download /></el-icon>
            <span>下载</span>
          </button>
          <button class="btn btn-primary" @click="formatJson">
            <el-icon><MagicStick /></el-icon>
            <span>格式化</span>
          </button>
        </div>
      </div>

      <!-- 输入输出区域 -->
      <div class="editor-container">
        <!-- 输入区 -->
        <div class="editor-section input-section">
          <div class="section-label">
            <span>输入</span>
            <span class="status-dot" :class="{ 'status-success': isValid, 'status-error': errorMsg }"></span>
          </div>
          <textarea
            v-model="inputJson"
            class="code-editor"
            placeholder="请输入或粘贴 JSON 字符串..."
            spellcheck="false"
          ></textarea>
          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-message">
            <el-icon><Warning /></el-icon>
            <span>{{ errorMsg }}</span>
          </div>
        </div>

        <!-- 输出区 -->
        <div class="editor-section output-section">
          <div class="section-label">输出</div>
          <textarea
            v-model="outputJson"
            class="code-editor"
            placeholder="格式化后的 JSON 将显示在这里..."
            readonly
            spellcheck="false"
          ></textarea>
          <!-- 操作栏 -->
          <div class="output-actions">
            <button class="btn-icon" @click="copyResult" title="复制">
              <el-icon><CopyDocument /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** gs-20251027
 *  gs-20251027、
 * JsonFormat.vue - JSON 格式化工具
 * 177.16.34.2-177.16.34.25:22
 * 提供 JSON 字符串的格式化、验证和复制功能
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Delete,
  MagicStick,
  Warning,
  CopyDocument,
  Document,
  Fold,
  MoreFilled,
  Lock,
  Unlock,
  Position,
  Connection,
  FolderOpened,
  Download
} from '@element-plus/icons-vue'

// 输入的 JSON 字符串
const inputJson = ref<string>('')

// 格式化后的 JSON 字符串
const outputJson = ref<string>('')

// 错误提示信息
const errorMsg = ref<string>('')

/**
 * JSON 是否有效
 */
const isValid = computed(() => {
  if (!inputJson.value.trim()) return true
  try {
    JSON.parse(inputJson.value)
    return true
  } catch {
    return false
  }
})

/**
 * 压缩 JSON
 * 移除 JSON 字符串中的所有空格和换行
 */
const compressJson = (): void => {
  if (!inputJson.value.trim()) {
    ElMessage.warning('请输入 JSON 字符串')
    return
  }
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    errorMsg.value = ''
    ElMessage.success('压缩成功')
  } catch (e) {
    // 解析失败，显示错误信息
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * 格式化 JSON
 * 尝试解析并格式化输入的 JSON 字符串
 */
const formatJson = (): void => {
  errorMsg.value = ''

  if (!inputJson.value.trim()) {
    errorMsg.value = '请输入 JSON 字符串'
    return
  }

  try {
    // 解析 JSON 字符串
    const parsed = JSON.parse(inputJson.value)
    // 格式化为缩进 2 空格的字符串
    outputJson.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('格式化成功')
  } catch (e) {
    // 解析失败，显示错误信息
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * 处理下拉菜单命令
 */
const handleCommand = (command: string): void => {
  switch (command) {
    case 'demo':
      generateDemo()
      break
    case 'compress':
      compressJson()
      break
    case 'escape':
      escapeJson()
      break
    case 'unescape':
      unescapeJson()
      break
    case 'compressEscape':
      compressAndEscapeJson()
      break
    case 'toUnicode':
      toUnicode()
      break
    case 'toChinese':
      toChinese()
      break
  }
}

/**
 * 转义 JSON
 * 将 JSON 字符串中的特殊字符转义
 */
const escapeJson = (): void => {
  if (!inputJson.value.trim()) {
    ElMessage.warning('请输入 JSON 字符串')
    return
  }
  try {
    const parsed = JSON.parse(inputJson.value)
    const escaped = JSON.stringify(parsed, null, 0).replace(/"/g, '\\"')
    outputJson.value = escaped
    errorMsg.value = ''
    ElMessage.success('转义成功')
  } catch (e) {
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * 去除转义
 * 将转义的 JSON 字符串还原
 */
const unescapeJson = (): void => {
  if (!inputJson.value.trim()) {
    ElMessage.warning('请输入 JSON 字符串')
    return
  }
  try {
    const jsonStr = inputJson.value.replace(/\\"/g, '"')
    const parsed = JSON.parse(jsonStr)
    outputJson.value = JSON.stringify(parsed, null, 2)
    errorMsg.value = ''
    ElMessage.success('去除转义成功')
  } catch (e) {
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * 压缩并转义
 * 压缩 JSON 同时转义特殊字符
 */
const compressAndEscapeJson = (): void => {
  if (!inputJson.value.trim()) {
    ElMessage.warning('请输入 JSON 字符串')
    return
  }
  try {
    const parsed = JSON.parse(inputJson.value)
    const escaped = JSON.stringify(parsed).replace(/"/g, '\\"')
    outputJson.value = escaped
    errorMsg.value = ''
    ElMessage.success('压缩并转义成功')
  } catch (e) {
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * Unicode 转中文
 * 将中文字符转换为 Unicode 编码
 */
const toUnicode = (): void => {
  if (!inputJson.value.trim()) {
    ElMessage.warning('请输入 JSON 字符串')
    return
  }
  try {
    const parsed = JSON.parse(inputJson.value)
    const unicodeStr = JSON.stringify(parsed, null, 2)
      .replace(/([\u4e00-\u9fa5])/g, (match) => {
        // 中文字符转换为 Unicode 编码
        return `\\u${match.codePointAt(0)!.toString(16).padStart(4, '0')}`
      })
    outputJson.value = unicodeStr
    errorMsg.value = ''
    ElMessage.success('Unicode 转换成功')
  } catch (e) {
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * 中文转 Unicode
 * 将 Unicode 编码转换为中文字符
 */
const toChinese = (): void => {
  if (!inputJson.value.trim()) {
    ElMessage.warning('请输入 JSON 字符串')
    return
  }
  try {
    // 先将 Unicode 转换回中文
    const jsonStr = inputJson.value.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      const codePoint = parseInt(hex, 16)
      return String.fromCodePoint(codePoint)
    })
    const parsed = JSON.parse(jsonStr)
    outputJson.value = JSON.stringify(parsed, null, 2)
    errorMsg.value = ''
    ElMessage.success('中文转换成功')
  } catch (e) {
    errorMsg.value = `JSON 格式错误: ${(e as Error).message}`
    outputJson.value = ''
  }
}

/**
 * 生成示例 JSON
 */
const generateDemo = (): void => {
  const demoJson = {
    "name": "开发者工具箱",
    "version": "1.5.0",
    "description": "一个简洁、现代的前端开发工具集合",
    "features": [
      "JSON 格式化",
      "时间戳转换",
      "Base64 转换",
      "文本对比",
      "二维码工具",
      "密码生成器",
      "UUID 生成器",
      "JWT 工具"
    ],
    "author": {
      "name": "DevTools Team",
      "email": "dev@example.com"
    },
    "settings": {
      "theme": "dark",
      "language": "zh-CN"
    }
  }
  inputJson.value = JSON.stringify(demoJson, null, 2)
  errorMsg.value = ''
  formatJson()
}

/**
 * 清空所有内容
 */
const clearAll = (): void => {
  inputJson.value = ''
  outputJson.value = ''
  errorMsg.value = ''
}

/**
 * 复制结果到剪贴板
 */
const copyResult = async (): Promise<void> => {
  if (!outputJson.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(outputJson.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 下载 JSON 文件
 */
const downloadJson = (): void => {
  if (!outputJson.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }

  try {
    // 解析 JSON 以验证格式
    JSON.parse(outputJson.value)

    // 创建 Blob
    const blob = new Blob([outputJson.value], { type: 'application/json;charset=utf-8' })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (e) {
    ElMessage.error('下载失败：' + (e as Error).message)
  }
}
</script>

<style scoped>
/* ===================================
   工具页面容器
   =================================== */
.json-tool {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-xl);
}

/* ===================================
   工具标题区
   =================================== */
.tool-header {
  padding: var(--space-2xl) 0 var(--space-lg);
}

.tool-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  letter-spacing: -0.5px;
}

.tool-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

/* ===================================
   工具面板
   =================================== */
.tool-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* ===================================
   工具栏
   =================================== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.toolbar-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toolbar-right {
  display: flex;
  gap: var(--space-sm);
}

/* ===================================
   下拉菜单
   =================================== */
.dropdown-btn {
  gap: 6px;
}

:deep(.el-dropdown-menu) {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--bg-secondary);
  color: var(--accent-primary);
}

:deep(.el-dropdown-menu__item .el-icon) {
  color: var(--text-secondary);
}

:deep(.el-dropdown-menu__item:hover .el-icon) {
  color: var(--accent-primary);
}

/* ===================================
   按钮样式
   =================================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #0d4fd1;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background-color: var(--bg-elevated);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

.btn-icon {
  width: 32px;
  height: 32px;
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

.btn-icon:hover {
  background-color: var(--bg-elevated);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

/* ===================================
   编辑器容器
   =================================== */
.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
  height: 60vh;
}

/* ===================================
   编辑器区域
   =================================== */
.editor-section {
  display: flex;
  flex-direction: column;
  position: relative;
}

.input-section {
  border-right: 1px solid var(--border-light);
}

.section-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===================================
   状态指示点
   =================================== */
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--border-medium);
}

.status-success {
  background-color: var(--accent-success);
  box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.2);
}

.status-error {
  background-color: var(--accent-error);
  box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.2);
}

/* ===================================
   代码编辑器
   =================================== */
.code-editor {
  flex: 1;
  width: 100%;
  background-color: var(--bg-deep);
  border: none;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: var(--space-md);
  resize: none;
  outline: none;
}

.code-editor::placeholder {
  color: var(--text-disabled);
}

.code-editor:focus {
  background-color: var(--bg-deep);
}

/* ===================================
   错误提示
   =================================== */
.error-message {
  position: absolute;
  bottom: var(--space-md);
  left: var(--space-md);
  right: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background-color: rgba(245, 63, 63, 0.1);
  border: 1px solid rgba(245, 63, 63, 0.2);
  border-radius: var(--radius-md);
  color: var(--accent-error);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  backdrop-filter: blur(8px);
}

/* ===================================
   输出操作栏
   =================================== */
.output-actions {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .json-tool {
    padding: 0 var(--space-md);
  }

  .tool-header {
    padding: var(--space-xl) 0 var(--space-md);
  }

  .tool-title {
    font-size: 20px;
  }

  .editor-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    height: auto;
    min-height: 600px;
  }

  .input-section {
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
  }

  .toolbar-right {
    justify-content: flex-end;
  }
}
</style>
