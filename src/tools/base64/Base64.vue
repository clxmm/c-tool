<template>
  <!-- Base64 转换工具 -->
  <div class="base64-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">Base64 转换</h1>
      <p class="tool-subtitle">文本编码与图片转 Base64</p>
    </div>

    <!-- 模式切换标签 -->
    <div class="mode-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <el-icon><component :is="tab.icon" /></el-icon>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 文本转 Base64 -->
    <div v-show="activeTab === 'text'" class="tool-content">
      <div class="tool-panel">
        <div class="editor-container">
          <!-- 输入区 -->
          <div class="editor-section">
            <div class="section-header">
              <span class="section-label">文本输入</span>
              <button class="btn-text" @click="clearText">清空</button>
            </div>
            <textarea
              v-model="textInput"
              class="code-editor"
              placeholder="请输入需要转换的文本..."
              spellcheck="false"
            ></textarea>
          </div>

          <!-- 输出区 -->
          <div class="editor-section">
            <div class="section-header">
              <span class="section-label">Base64 结果</span>
              <div class="header-actions">
                <button class="btn-text" @click="clearBase64Result">清空</button>
                <button class="btn-icon" @click="copyBase64" title="复制">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <textarea
              v-model="base64Output"
              class="code-editor"
              placeholder="转换后的 Base64 字符串..."
              readonly
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-primary" @click="textToBase64">
            <el-icon><MagicStick /></el-icon>
            <span>转换为 Base64</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Base64 转文本 -->
    <div v-show="activeTab === 'base64'" class="tool-content">
      <div class="tool-panel">
        <div class="editor-container">
          <!-- 输入区 -->
          <div class="editor-section">
            <div class="section-header">
              <span class="section-label">Base64 输入</span>
              <button class="btn-text" @click="clearBase64Input">清空</button>
            </div>
            <textarea
              v-model="base64Input"
              class="code-editor"
              placeholder="请输入需要解码的 Base64 字符串..."
              spellcheck="false"
            ></textarea>
          </div>

          <!-- 输出区 -->
          <div class="editor-section">
            <div class="section-header">
              <span class="section-label">文本结果</span>
              <div class="header-actions">
                <button class="btn-text" @click="clearTextOutput">清空</button>
                <button class="btn-icon" @click="copyTextResult" title="复制">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <textarea
              v-model="textOutput"
              class="code-editor"
              placeholder="解码后的文本..."
              readonly
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-primary" @click="base64ToText">
            <el-icon><MagicStick /></el-icon>
            <span>解码为文本</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 图片转 Base64 -->
    <div v-show="activeTab === 'image'" class="tool-content">
      <div class="upload-panel">
        <!-- 上传区域 -->
        <div class="upload-area" :class="{ 'has-image': imagePreview }">
          <input
            ref="fileInput"
            type="file"
            class="file-input"
            accept="image/*"
            @change="handleImageChange"
          />
          <div v-if="!imagePreview" class="upload-placeholder">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <span class="upload-text">点击或拖拽上传图片</span>
            <span class="upload-hint">支持 jpg、png、gif、webp，建议不超过 2MB</span>
          </div>
          <img v-else :src="imagePreview" class="image-preview" alt="图片预览" />
          <button v-if="imagePreview" class="btn-clear" @click="clearImage" title="清除">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <!-- 结果区域 -->
        <div v-if="imagePreview" class="result-area">
          <div class="result-info">
            <div class="info-item">
              <span class="info-label">文件大小</span>
              <span class="info-value">{{ imageSize }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Base64 长度</span>
              <span class="info-value">{{ base64Length }} 字符</span>
            </div>
          </div>
          <button class="btn btn-primary" @click="copyImageBase64">
            <el-icon><CopyDocument /></el-icon>
            <span>复制 Base64</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Base64.vue - Base64 转换工具
 * 提供文本与 Base64 的相互转换，以及图片转 Base64 功能
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Picture,
  Upload,
  MagicStick,
  CopyDocument,
  Close
} from '@element-plus/icons-vue'
// 移除未使用的导入
// import type { UploadFile } from 'element-plus'

// 标签页配置
interface TabConfig {
  label: string
  value: string
  icon: any
}

const tabs: TabConfig[] = [
  { label: '文本转 Base64', value: 'text', icon: Document },
  { label: 'Base64 转文本', value: 'base64', icon: Document },
  { label: '图片转 Base64', value: 'image', icon: Picture }
]

// 当前激活的标签页
const activeTab = ref<string>('text')

// 文本转 Base64 相关
const textInput = ref<string>('')
const base64Output = ref<string>('')

// Base64 转文本相关
const base64Input = ref<string>('')
const textOutput = ref<string>('')

// 图片转 Base64 相关
const imagePreview = ref<string>('')
const imageSize = ref<string>('')
const base64Length = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)

/**
 * 文本转 Base64
 * 使用 btoa 函数进行编码（支持中文）
 */
const textToBase64 = (): void => {
  if (!textInput.value.trim()) {
    ElMessage.warning('请输入需要转换的文本')
    return
  }

  try {
    // 处理中文字符，先使用 encodeURIComponent 编码，再转换为 Base64
    const encoded = encodeURIComponent(textInput.value)
    const base64 = btoa(encoded)
    base64Output.value = base64
    ElMessage.success('转换成功')
  } catch (e) {
    ElMessage.error('转换失败，请检查输入内容')
  }
}

/**
 * Base64 转文本
 * 使用 atob 函数进行解码（支持中文）
 */
const base64ToText = (): void => {
  if (!base64Input.value.trim()) {
    ElMessage.warning('请输入 Base64 字符串')
    return
  }

  try {
    // 先将 Base64 解码为 URI 编码的字符串，再解码为原始文本
    const decoded = atob(base64Input.value)
    const text = decodeURIComponent(decoded)
    textOutput.value = text
    ElMessage.success('转换成功')
  } catch (e) {
    ElMessage.error('转换失败，请检查 Base64 格式是否正确')
  }
}

/**
 * 清空文本输入
 */
const clearText = (): void => {
  textInput.value = ''
  base64Output.value = ''
}

/**
 * 清空 Base64 输出
 */
const clearBase64Result = (): void => {
  base64Output.value = ''
}

/**
 * 清空 Base64 输入
 */
const clearBase64Input = (): void => {
  base64Input.value = ''
  textOutput.value = ''
}

/**
 * 清空文本输出
 */
const clearTextOutput = (): void => {
  textOutput.value = ''
}

/**
 * 复制 Base64 结果
 */
const copyBase64 = async (): Promise<void> => {
  if (!base64Output.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(base64Output.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 复制文本结果
 */
const copyTextResult = async (): Promise<void> => {
  if (!textOutput.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(textOutput.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 处理图片上传
 * 将图片转换为 Base64 格式
 */
const handleImageChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  // 检查文件大小（限制 2MB）
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning('图片大小不能超过 2MB')
    return
  }

  // 读取图片文件并转换为 Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    imagePreview.value = result
    // 计算图片大小
    const size = file.size
    if (size < 1024) {
      imageSize.value = `${size} B`
    } else if (size < 1024 * 1024) {
      imageSize.value = `${(size / 1024).toFixed(2)} KB`
    } else {
      imageSize.value = `${(size / 1024 / 1024).toFixed(2)} MB`
    }
    // 计算 Base64 长度
    base64Length.value = result.length.toLocaleString()
    ElMessage.success('图片转换成功')
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败')
  }
  reader.readAsDataURL(file)
}

/**
 * 复制图片 Base64
 */
const copyImageBase64 = async (): Promise<void> => {
  if (!imagePreview.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(imagePreview.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 清空图片
 */
const clearImage = (): void => {
  imagePreview.value = ''
  imageSize.value = ''
  base64Length.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
/* ===================================
   工具页面容器
   =================================== */
.base64-tool {
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
   模式标签
   =================================== */
.mode-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-light);
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-item.active {
  background-color: var(--accent-primary);
  color: #ffffff;
}

/* ===================================
   工具内容区
   =================================== */
.tool-content {
  padding-bottom: var(--space-2xl);
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
   编辑器容器
   =================================== */
.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
}

.editor-section {
  display: flex;
  flex-direction: column;
}

.editor-section:first-child {
  border-right: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
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

.btn-text {
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-text:hover {
  color: var(--text-primary);
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background-color: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
}

/* ===================================
   面板底部
   =================================== */
.panel-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: flex-end;
}

/* ===================================
   图片上传面板
   =================================== */
.upload-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.upload-area {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 48px;
  color: var(--border-medium);
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.image-preview {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.btn-clear {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: none;
  background-color: var(--bg-deep);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1;
}

.btn-clear:hover {
  background-color: var(--accent-error);
  color: #ffffff;
}

/* ===================================
   结果区域
   =================================== */
.result-area {
  padding: var(--space-lg);
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.result-info {
  display: flex;
  gap: var(--space-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-label {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .base64-tool {
    padding: 0 var(--space-md);
  }

  .tool-header {
    padding: var(--space-xl) 0 var(--space-md);
  }

  .tool-title {
    font-size: 20px;
  }

  .mode-tabs {
    overflow-x: auto;
    padding-bottom: var(--space-md);
  }

  .editor-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    min-height: auto;
  }

  .editor-section:first-child {
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }

  .panel-footer {
    justify-content: stretch;
  }

  .panel-footer .btn {
    width: 100%;
    justify-content: center;
  }

  .result-area {
    flex-direction: column;
    align-items: stretch;
  }

  .result-info {
    justify-content: space-between;
  }
}
</style>
