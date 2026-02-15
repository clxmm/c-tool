<template>
  <!-- 文本对比工具 -->
  <div class="diff-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">文本对比</h1>
      <p class="tool-subtitle">比较两段文本的差异</p>
    </div>

    <!-- 对比选项 -->
    <div class="diff-options">
      <div class="option-item">
        <span class="option-label">忽略空格</span>
        <label class="switch-toggle">
          <input type="checkbox" v-model="ignoreWhitespace" class="switch-input" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="option-item">
        <span class="option-label">忽略大小写</span>
        <label class="switch-toggle">
          <input type="checkbox" v-model="ignoreCase" class="switch-input" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="option-item">
        <span class="option-label">显示行号</span>
        <label class="switch-toggle">
          <input type="checkbox" v-model="showLineNumbers" class="switch-input" />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <!-- 对比编辑器 -->
    <div class="diff-panels">
      <!-- 原始文本 -->
      <div class="diff-panel">
        <div class="panel-header">
          <span class="panel-title">原始文本</span>
          <div class="header-actions">
            <button class="btn-text" @click="clearOriginal" title="清空">清空</button>
            <button class="btn-text" @click="pasteOriginal" title="粘贴">
              <el-icon><CopyDocument /></el-icon>
            </button>
          </div>
        </div>
        <div class="editor-wrapper">
          <div v-if="showLineNumbers" class="line-numbers" ref="originalLineNumbers">
            <div v-for="(_, i) in originalLinesCount" :key="i" class="line-number">{{ i + 1 }}</div>
          </div>
          <textarea
            ref="originalEditor"
            v-model="originalText"
            class="code-editor"
            placeholder="输入原始文本..."
            spellcheck="false"
            @input="updateOriginalLineCount"
          ></textarea>
        </div>
      </div>

      <!-- 修改后文本 -->
      <div class="diff-panel">
        <div class="panel-header">
          <span class="panel-title">修改后文本</span>
          <div class="header-actions">
            <button class="btn-text" @click="clearModified" title="清空">清空</button>
            <button class="btn-text" @click="pasteModified" title="粘贴">
              <el-icon><CopyDocument /></el-icon>
            </button>
          </div>
        </div>
        <div class="editor-wrapper">
          <div v-if="showLineNumbers" class="line-numbers" ref="modifiedLineNumbers">
            <div v-for="(_, i) in modifiedLinesCount" :key="i" class="line-number">{{ i + 1 }}</div>
          </div>
          <textarea
            ref="modifiedEditor"
            v-model="modifiedText"
            class="code-editor"
            placeholder="输入修改后的文本..."
            spellcheck="false"
            @input="updateModifiedLineCount"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn btn-primary" @click="compareText" :disabled="!canCompare">
        <el-icon><Document /></el-icon>
        <span>开始对比</span>
      </button>
      <button v-if="hasDiff" class="btn btn-secondary" @click="copyDiff">
        <el-icon><CopyDocument /></el-icon>
        <span>复制结果</span>
      </button>
      <button v-if="hasDiff" class="btn btn-ghost" @click="clearAll">
        <el-icon><Delete /></el-icon>
        <span>清空全部</span>
      </button>
    </div>

    <!-- 对比结果 -->
    <div v-if="hasDiff" class="diff-result">
      <div class="result-header">
        <span class="result-title">对比结果</span>
        <div class="result-stats">
          <span class="stat-item" v-if="diffStats.added > 0">
            <span class="stat-label">新增:</span>
            <span class="stat-value stat-added">{{ diffStats.added }}</span>
          </span>
          <span class="stat-item" v-if="diffStats.removed > 0">
            <span class="stat-label">删除:</span>
            <span class="stat-value stat-removed">{{ diffStats.removed }}</span>
          </span>
          <span class="stat-item" v-if="diffStats.modified > 0">
            <span class="stat-label">修改:</span>
            <span class="stat-value stat-modified">{{ diffStats.modified }}</span>
          </span>
        </div>
      </div>
      <div class="diff-content">
        <div v-for="(line, index) in diffLines" :key="index" class="diff-line" :class="line.type">
          <div v-if="showLineNumbers" class="diff-line-number">
            {{ line.lineNumber }}
          </div>
          <div class="diff-line-content">{{ line.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Diff.vue - 文本对比工具
 * 提供两段文本的差异对比功能
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Delete, Document } from '@element-plus/icons-vue'

// 文本内容
const originalText = ref<string>('')
const modifiedText = ref<string>('')

// 对比选项
const ignoreWhitespace = ref<boolean>(false)
const ignoreCase = ref<boolean>(false)
const showLineNumbers = ref<boolean>(false)

// 行数统计
const originalLinesCount = ref<number>(0)
const modifiedLinesCount = ref<number>(0)

// 对比结果
const diffLines = ref<DiffLine[]>([])
const hasDiff = ref<boolean>(false)

// 差异统计
const diffStats = ref({
  added: 0,
  removed: 0,
  modified: 0
})

/**
 * 差异行类型
 */
interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  content: string
  lineNumber?: number
}

/**
 * 能否进行对比
 */
const canCompare = computed(() => {
  return originalText.value.trim().length > 0 || modifiedText.value.trim().length > 0
})

/**
 * 更新原始文本行数
 */
const updateOriginalLineCount = (): void => {
  originalLinesCount.value = originalText.value.split('\n').length
}

/**
 * 更新修改后文本行数
 */
const updateModifiedLineCount = (): void => {
  modifiedLinesCount.value = modifiedText.value.split('\n').length
}

/**
 * 清空原始文本
 */
const clearOriginal = (): void => {
  originalText.value = ''
  updateOriginalLineCount()
}

/**
 * 清空修改后文本
 */
const clearModified = (): void => {
  modifiedText.value = ''
  updateModifiedLineCount()
}

/**
 * 粘贴到原始文本
 */
const pasteOriginal = async (): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText()
    originalText.value = text
    updateOriginalLineCount()
    ElMessage.success('粘贴成功')
  } catch (e) {
    ElMessage.error('粘贴失败')
  }
}

/**
 * 粘贴到修改后文本
 */
const pasteModified = async (): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText()
    modifiedText.value = text
    updateModifiedLineCount()
    ElMessage.success('粘贴成功')
  } catch (e) {
    ElMessage.error('粘贴失败')
  }
}

/**
 * 文本对比算法
 * 使用简化版的差异检测
 */
const compareText = (): void => {
  if (!canCompare.value) {
    return
  }

  const original = originalText.value
  const modified = modifiedText.value

  // 处理选项
  let origLines = original.split('\n')
  let modLines = modified.split('\n')

  if (ignoreWhitespace.value) {
    origLines = origLines.map(line => line.trim())
    modLines = modLines.map(line => line.trim())
  }

  if (ignoreCase.value) {
    origLines = origLines.map(line => line.toLowerCase())
    modLines = modLines.map(line => line.toLowerCase())
  }

  // 重置统计
  diffStats.value = { added: 0, removed: 0, modified: 0 }
  diffLines.value = []

  // 使用 LCS（最长公共子序列）算法的简化版本
  const lcs = computeLCS(origLines, modLines)
  const result: DiffLine[] = []
  let origIndex = 0
  let modIndex = 0

  for (const line of lcs) {
    // 处理原始文本中的删除行
    while (origIndex < origLines.length && origLines[origIndex] !== line) {
      result.push({
        type: 'removed',
        content: original.split('\n')[origIndex],
        lineNumber: origIndex + 1
      })
      diffStats.value.removed++
      origIndex++
    }

    // 处理修改后文本中的新增行
    while (modIndex < modLines.length && modLines[modIndex] !== line) {
      result.push({
        type: 'added',
        content: modified.split('\n')[modIndex],
        lineNumber: modIndex + 1
      })
      diffStats.value.added++
      modIndex++
    }

    // 处理相同行
    if (origIndex < origLines.length && modIndex < modLines.length &&
        origLines[origIndex] === line && modLines[modIndex] === line) {
      result.push({
        type: 'unchanged',
        content: original.split('\n')[origIndex]
      })
      origIndex++
      modIndex++
    }
  }

  // 处理剩余的删除行
  while (origIndex < origLines.length) {
    result.push({
      type: 'removed',
      content: original.split('\n')[origIndex],
      lineNumber: origIndex + 1
    })
    diffStats.value.removed++
    origIndex++
  }

  // 处理剩余的新增行
  while (modIndex < modLines.length) {
    result.push({
      type: 'added',
      content: modified.split('\n')[modIndex],
      lineNumber: modIndex + 1
    })
    diffStats.value.added++
    modIndex++
  }

  // 标记修改的行（相邻的删除和新增）
  for (let i = 0; i < result.length; i++) {
    if (result[i].type === 'removed' && i + 1 < result.length && result[i + 1].type === 'added') {
      result[i].type = 'modified'
      result[i + 1].type = 'modified'
      diffStats.value.added--
      diffStats.value.removed--
      diffStats.value.modified += 2
      i++ // 跳过下一行
    }
  }

  diffLines.value = result
  hasDiff.value = result.some(line => line.type !== 'unchanged')

  if (hasDiff.value) {
    ElMessage.success('对比完成')
  } else {
    ElMessage.info('两段文本完全一致')
  }
}

/**
 * 计算最长公共子序列（LCS）
 * @param arr1 第一个数组
 * @param arr2 第二个数组
 * @returns 最长公共子序列
 */
const computeLCS = (arr1: string[], arr2: string[]): string[] => {
  const m = arr1.length
  const n = arr2.length
  const dp: number[][] = []

  // 初始化 DP 表
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1).fill(0)
  }

  // 填充 DP 表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // 回溯获取 LCS
  const lcs: string[] = []
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcs
}

/**
 * 复制对比结果
 */
const copyDiff = async (): Promise<void> => {
  if (!hasDiff.value) {
    ElMessage.warning('没有对比结果')
    return
  }

  try {
    const result = diffLines.value
      .map(line => {
        const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
        return prefix + line.content
      })
      .join('\n')

    await navigator.clipboard.writeText(result)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 清空全部
 */
const clearAll = (): void => {
  clearOriginal()
  clearModified()
  diffLines.value = []
  hasDiff.value = false
  diffStats.value = { added: 0, removed: 0, modified: 0 }
}
</script>

<style scoped>
/* ===================================
   工具页面容器
   =================================== */
.diff-tool {
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
   对比选项
   =================================== */
.diff-options {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.option-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===================================
   开关切换
   =================================== */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--bg-deep);
  border-radius: 12px;
  transition: 0.3s ease;
  border: 1px solid var(--border-light);
}

.switch-slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-tertiary);
  border-radius: 50%;
  transition: 0.3s ease;
}

.switch-input:checked + .switch-slider {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.switch-input:checked + .switch-slider:before {
  transform: translateX(20px);
  background-color: #ffffff;
}

/* ===================================
   对比面板
   =================================== */
.diff-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.diff-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* ===================================
   编辑器容器
   =================================== */
.editor-wrapper {
  display: flex;
  flex: 1;
  min-height: 400px;
  position: relative;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: var(--space-md) var(--space-sm) 0;
  background-color: var(--bg-deep);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  border-right: 1px solid var(--border-light);
  user-select: none;
}

.line-number {
  min-height: 20.8px;
  text-align: right;
  color: var(--text-tertiary);
  padding-right: var(--space-md);
}

.code-editor {
  flex: 1;
  width: 100%;
  min-height: 400px;
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
   操作按钮栏
   =================================== */
.action-bar {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}

/* ===================================
   按钮样式
   =================================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: #ffffff;
}

.btn-primary:hover:not(.disabled) {
  background-color: #0d4fd1;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #10b981;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.btn-ghost {
  background-color: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-text {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  padding: var(--space-xs);
  transition: color 0.2s ease;
}

.btn-text:hover {
  color: var(--text-primary);
}

/* ===================================
   对比结果
   =================================== */
.diff-result {
  margin-bottom: var(--space-2xl);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.result-stats {
  display: flex;
  gap: var(--space-lg);
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.stat-label {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.stat-added {
  color: #10b981;
}

.stat-removed {
  color: #ef4444;
}

.stat-modified {
  color: #f59e0b;
}

/* ===================================
   差异内容
   =================================== */
.diff-content {
  max-height: 500px;
  overflow-y: auto;
}

.diff-line {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.diff-line-number {
  min-width: 40px;
  text-align: right;
  color: var(--text-tertiary);
  user-select: none;
  padding-right: var(--space-md);
}

.diff-line-content {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-line.unchanged {
  background-color: transparent;
}

.diff-line.added {
  background-color: rgba(16, 185, 129, 0.1);
}

.diff-line.added .diff-line-content {
  color: #10b981;
}

.diff-line.removed {
  background-color: rgba(239, 68, 68, 0.1);
}

.diff-line.removed .diff-line-content {
  color: #ef4444;
  text-decoration: line-through;
}

.diff-line.modified {
  background-color: rgba(245, 158, 11, 0.1);
}

.diff-line.modified .diff-line-content {
  color: #f59e0b;
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .diff-tool {
    padding: 0 var(--space-md);
  }

  .tool-header {
    padding: var(--space-xl) 0 var(--space-md);
  }

  .tool-title {
    font-size: 20px;
  }

  .diff-options {
    flex-direction: column;
    align-items: flex-start;
  }

  .diff-panels {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .diff-panel {
    min-height: 300px;
  }

  .code-editor {
    min-height: 200px;
  }

  .action-bar {
    flex-direction: column;
  }

  .result-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
}
</style>
