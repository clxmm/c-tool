<template>
  <div class="uuid-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">UUID 生成器</h1>
      <p class="tool-subtitle">生成标准 UUID（通用唯一识别码）</p>
    </div>

    <!-- 工具面板 -->
    <div class="tool-panel">
      <!-- 配置区域 -->
      <div class="config-section">
        <div class="config-row">
          <div class="config-item">
            <label class="config-label">生成数量</label>
            <el-input-number
              v-model="config.count"
              :min="1"
              :max="100"
              controls-position="right"
              class="config-input"
            />
            <span class="config-unit">组</span>
          </div>
          <div class="config-item">
            <label class="config-label">格式</label>
            <el-radio-group v-model="config.format" class="format-group">
              <el-radio-button value="default">默认</el-radio-button>
              <el-radio-button value="uppercase">大写</el-radio-button>
              <el-radio-button value="no-hyphens">无连字符</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="action-row">
          <button class="btn btn-primary generate-btn" @click="generateUuids">
            <el-icon><Refresh /></el-icon>
            生成 UUID
          </button>
        </div>
      </div>

      <!-- 结果区域 -->
      <div class="result-section" v-if="uuids.length > 0">
        <div class="result-header">
          <span class="result-title">生成结果</span>
          <button class="btn btn-secondary btn-sm" @click="copyAll">
            <el-icon><CopyDocument /></el-icon>
            全部复制
          </button>
        </div>
        <div class="uuid-list">
          <div
            v-for="(uuid, index) in uuids"
            :key="index"
            class="uuid-item"
          >
            <span class="uuid-index">{{ index + 1 }}</span>
            <span class="uuid-text">{{ uuid }}</span>
            <button class="btn btn-icon copy-icon" @click="copyUuid(uuid)">
              <el-icon><DocumentCopy /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, CopyDocument, DocumentCopy } from '@element-plus/icons-vue'

/**
 * UUID 生成器工具
 * 生成标准 UUID（通用唯一识别码）
 */

// UUID 配置
const config = reactive({
  // 生成数量，默认5组
  count: 5,
  // 格式：default=默认(小写带连字符), uppercase=大写, no-hyphens=无连字符
  format: 'default' as 'default' | 'uppercase' | 'no-hyphens'
})

// 生成的 UUID 列表
const uuids = ref<string[]>([])

/**
 * 生成单个 UUID
 */
const generateUuid = (): string => {
  // 生成随机 UUID v4
  const hex = '0123456789abcdef'
  let result = ''

  // 生成 32 个随机十六进制字符
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      result += '-'
    } else {
      result += hex[Math.floor(Math.random() * 16)]
    }
  }

  return result
}

/**
 * 格式化 UUID
 */
const formatUuid = (uuid: string): string => {
  switch (config.format) {
    case 'uppercase':
      return uuid.toUpperCase()
    case 'no-hyphens':
      return uuid.replace(/-/g, '')
    default:
      return uuid
  }
}

/**
 * 生成 UUID
 */
const generateUuids = (): void => {
  uuids.value = []
  for (let i = 0; i < config.count; i++) {
    const uuid = generateUuid()
    uuids.value.push(formatUuid(uuid))
  }
  ElMessage.success(`成功生成 ${config.count} 组 UUID`)
}

/**
 * 复制单个 UUID
 */
const copyUuid = async (uuid: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(uuid)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}

/**
 * 全部复制
 */
const copyAll = async (): Promise<void> => {
  if (uuids.value.length === 0) return
  try {
    await navigator.clipboard.writeText(uuids.value.join('\n'))
    ElMessage.success('全部复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/**
 * UUID 生成器工具样式
 * 采用科技感面板设计，深色主题
 */

.uuid-tool {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 工具标题区 */
.tool-header {
  margin-bottom: 24px;
}

.tool-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.tool-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* 工具面板 */
.tool-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 24px;
}

/* 配置区域 */
.config-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-label {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.config-unit {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 格式选择器 */
.format-group {
  display: flex;
}

/* 操作按钮区 */
.action-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 8px;
}

.generate-btn {
  padding: 12px 32px;
  font-size: 14px;
  gap: 8px;
}

/* 结果区域 */
.result-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* UUID 列表 */
.uuid-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uuid-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.uuid-item:hover {
  border-color: var(--accent-primary);
}

.uuid-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-deep);
  border-radius: 4px;
}

.uuid-text {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: var(--text-primary);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: #fff;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background-color: var(--bg-deep);
  border-color: var(--border-heavy);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-icon {
  padding: 6px;
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background-color: var(--bg-deep);
  color: var(--text-primary);
}

/* Element Plus 样式覆盖 */
:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input-number .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
  box-shadow: none;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  border-color: var(--border-heavy);
}

:deep(.el-input-number .el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-radio-group) {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
  box-shadow: none;
}

:deep(.el-radio-button) {
  --el-radio-button-checked-bg-color: var(--bg-primary);
  --el-radio-button-checked-text-color: var(--accent-primary);
  --el-radio-button-checked-border-color: var(--border-light);
}

:deep(.el-radio-button__inner) {
  background-color: var(--bg-primary);
  border-color: var(--border-light);
  color: var(--text-secondary);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--bg-elevated);
  color: var(--accent-primary);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover) {
  color: var(--accent-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .uuid-tool {
    padding: 0 16px;
  }

  .tool-panel {
    padding: 16px;
  }

  .config-row {
    gap: 20px;
  }

  .config-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
