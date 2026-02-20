<template>
  <div class="password-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">密码生成器</h1>
      <p class="tool-subtitle">根据自定义规则生成安全密码</p>
    </div>

    <!-- 工具面板 -->
    <div class="tool-panel">
      <!-- 配置区域 -->
      <div class="config-section">
        <!-- 基础配置 -->
        <div class="config-row">
          <div class="config-item">
            <label class="config-label">密码长度</label>
            <el-input-number
              v-model="config.length"
              :min="4"
              :max="64"
              controls-position="right"
              class="config-input"
            />
            <span class="config-unit">位</span>
          </div>
          <div class="config-item">
            <label class="config-label">生成数量</label>
            <el-input-number
              v-model="config.count"
              :min="1"
              :max="20"
              controls-position="right"
              class="config-input"
            />
            <span class="config-unit">组</span>
          </div>
        </div>

        <!-- 字符类型配置 -->
        <div class="config-divider"></div>

        <div class="config-row">
          <!-- 小写字母：最多包含 -->
          <div class="config-item checkbox-item">
            <el-checkbox v-model="config.includeLowercase" size="large">
              包含小写字母 (a-z)
            </el-checkbox>
            <div class="char-count-input">
              <span class="char-count-label">最多</span>
              <el-input-number
                v-model="config.maxLowercase"
                :min="0"
                :max="config.length"
                controls-position="right"
                size="small"
                :disabled="!config.includeLowercase"
              />
              <span class="char-count-unit">个</span>
            </div>
          </div>
          <!-- 大写字母：最多包含 -->
          <div class="config-item checkbox-item">
            <el-checkbox v-model="config.includeUppercase" size="large">
              包含大写字母 (A-Z)
            </el-checkbox>
            <div class="char-count-input">
              <span class="char-count-label">最多</span>
              <el-input-number
                v-model="config.maxUppercase"
                :min="0"
                :max="config.length"
                controls-position="right"
                size="small"
                :disabled="!config.includeUppercase"
              />
              <span class="char-count-unit">个</span>
            </div>
          </div>
        </div>

        <!-- 特殊字符配置 -->
        <div class="config-divider"></div>

        <div class="config-row special-row">
          <div class="config-item checkbox-item">
            <el-checkbox v-model="config.includeSpecial" size="large">
              包含特殊字符
            </el-checkbox>
            <div class="char-count-input">
              <span class="char-count-label">最多</span>
              <el-input-number
                v-model="config.maxSpecial"
                :min="0"
                :max="config.length"
                controls-position="right"
                size="small"
                :disabled="!config.includeSpecial"
              />
              <span class="char-count-unit">个</span>
            </div>
          </div>
          <div class="special-chars-input" v-if="config.includeSpecial">
            <label class="config-label">特殊字符集</label>
            <el-input
              v-model="config.specialChars"
              placeholder="输入自定义特殊字符"
              class="special-input"
            />
            <div class="special-presets">
              <el-tag
                v-for="preset in specialPresets"
                :key="preset.label"
                class="preset-tag"
                @click="addSpecialPreset(preset.chars)"
                effect="plain"
              >
                {{ preset.label }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="action-row">
          <button class="btn btn-primary generate-btn" @click="generatePasswords">
            <el-icon><Refresh /></el-icon>
            生成密码
          </button>
        </div>
      </div>

      <!-- 结果区域 -->
      <div class="result-section" v-if="passwords.length > 0">
        <div class="result-header">
          <span class="result-title">生成结果</span>
          <button class="btn btn-secondary btn-sm" @click="copyAll">
            <el-icon><CopyDocument /></el-icon>
            全部复制
          </button>
        </div>
        <div class="password-list">
          <div
            v-for="(password, index) in passwords"
            :key="index"
            class="password-item"
          >
            <span class="password-index">{{ index + 1 }}</span>
            <span class="password-text">{{ password }}</span>
            <button class="btn btn-icon copy-icon" @click="copyPassword(password)">
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
 * 密码生成器工具
 * 根据自定义规则生成安全密码
 */

// 密码配置
const config = reactive({
  // 密码长度，默认8位
  length: 8,
  // 生成数量，默认5组
  count: 5,
  // 是否包含小写字母，默认是
  includeLowercase: true,
  // 小写字母最多包含数量，默认8个
  maxLowercase: 1,
  // 是否包含大写字母，默认是
  includeUppercase: true,
  // 大写字母最多包含数量，默认8个
  maxUppercase: 1,
  // 是否包含特殊字符，默认否
  includeSpecial: false,
  // 特殊字符最多包含数量，默认4个
  maxSpecial: 1,
  // 自定义特殊字符集
  specialChars: '?!@#$%^&*'
})

// 特殊字符预设
const specialPresets = [
  { label: '常用符号', chars: '?!@#$%' },
  { label: '更多符号', chars: '?!@#$%^&*' },
  { label: '所有符号', chars: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`' }
]

// 生成的密码列表
const passwords = ref<string[]>([])

// 字符集定义
const charSets = {
  numbers: '0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
}

/**
 * 替换特殊字符预设
 */
const addSpecialPreset = (chars: string): void => {
  // 直接替换字符集（去重）
  config.specialChars = Array.from(new Set(chars)).join('')
}

/**
 * 从字符集中随机选择指定数量的字符
 */
const getRandomChars = (charSet: string, count: number): string => {
  let result = ''
  for (let i = 0; i < count; i++) {
    result += charSet[Math.floor(Math.random() * charSet.length)]
  }
  return result
}

/**
 * 生成单个密码
 */
const generateSinglePassword = (): string => {
  // 检查是否至少选择了一种字符类型（数字始终包含）
  if (!config.includeLowercase &&
      !config.includeUppercase && !config.includeSpecial) {
    throw new Error('请至少选择一种字符类型')
  }

  // 计算最大限制总和
  const maxTotal = (config.includeLowercase ? config.maxLowercase : 0) +
                   (config.includeUppercase ? config.maxUppercase : 0) +
                   (config.includeSpecial ? config.maxSpecial : 0)

  // 验证最大字符数总和不超过密码长度
  if (maxTotal > config.length) {
    throw new Error('最大字符数总和不能超过密码长度')
  }

  let password = ''
  let remainingLength = config.length

  // 按最大限制生成小写字母
  if (config.includeLowercase && config.maxLowercase > 0) {
    const count = Math.min(config.maxLowercase, remainingLength)
    password += getRandomChars(charSets.lowercase, count)
    remainingLength -= count
  }

  // 按最大限制生成大写字母
  if (config.includeUppercase && config.maxUppercase > 0 && remainingLength > 0) {
    const count = Math.min(config.maxUppercase, remainingLength)
    password += getRandomChars(charSets.uppercase, count)
    remainingLength -= count
  }

  // 按最大限制生成特殊字符
  if (config.includeSpecial && config.maxSpecial > 0 && remainingLength > 0) {
    const count = Math.min(config.maxSpecial, remainingLength)
    password += getRandomChars(config.specialChars, count)
    remainingLength -= count
  }

  // 剩余位置用数字填充（数字始终包含）
  if (remainingLength > 0) {
    password += getRandomChars(charSets.numbers, remainingLength)
  }

  // 打乱字符顺序
  return shuffleString(password)
}

/**
 * 打乱字符串顺序
 */
const shuffleString = (str: string): string => {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

/**
 * 生成密码
 */
const generatePasswords = (): void => {
  try {
    passwords.value = []
    for (let i = 0; i < config.count; i++) {
      passwords.value.push(generateSinglePassword())
    }
    ElMessage.success(`成功生成 ${config.count} 组密码`)
  } catch (error) {
    ElMessage.error((error as Error).message)
  }
}

/**
 * 复制单个密码
 */
const copyPassword = async (password: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(password)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}

/**
 * 全部复制
 */
const copyAll = async (): Promise<void> => {
  if (passwords.value.length === 0) return
  try {
    await navigator.clipboard.writeText(passwords.value.join('\n'))
    ElMessage.success('全部复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/**
 * 密码生成器工具样式
 * 采用科技感面板设计，深色主题
 */

.password-tool {
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

.config-divider {
  height: 1px;
  background-color: var(--border-light);
}

.config-row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: flex-start;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  min-width: 240px;
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

/* 字符数量输入 */
.char-count-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 24px;
}

.char-count-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.char-count-unit {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 特殊字符配置 */
.special-row {
  flex-direction: column;
  gap: 16px;
}

.special-chars-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 500px;
}

.special-input {
  width: 100%;
}

.special-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-tag:hover {
  transform: translateY(-1px);
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

/* 密码列表 */
.password-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.password-item:hover {
  border-color: var(--accent-primary);
}

.password-index {
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

.password-text {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 15px;
  letter-spacing: 1px;
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

:deep(.el-checkbox__label) {
  color: var(--text-primary);
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--border-heavy);
}

:deep(.el-input__inner) {
  color: var(--text-primary);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .password-tool {
    padding: 0 16px;
  }

  .tool-panel {
    padding: 16px;
  }

  .config-row {
    gap: 20px;
  }

  .checkbox-item {
    min-width: 100%;
  }
}
</style>
