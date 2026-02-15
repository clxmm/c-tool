<template>
  <!-- 时间戳转换工具 -->
  <div class="timestamp-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">时间戳转换</h1>
      <p class="tool-subtitle">时间戳与日期时间相互转换</p>
    </div>

    <!-- 当前时间显示面板 -->
    <div class="current-time-panel">
      <div class="time-display">
        <div class="time-value">{{ currentTime }}</div>
        <div class="time-ms">{{ currentTimeMs }}</div>
      </div>
      <div class="timestamp-display">
        <span class="timestamp-label">Unix 时间戳</span>
        <span class="timestamp-value">{{ currentTimestamp }}</span>
        <button class="btn-copy" @click="copyTimestamp" title="复制">
          <el-icon><CopyDocument /></el-icon>
        </button>
      </div>
    </div>

    <!-- 模式切换 -->
    <div class="mode-switch">
      <span class="mode-label">时间戳格式</span>
      <div class="mode-options">
        <button
          class="mode-btn"
          :class="{ active: timestampMode === 'second' }"
          @click="timestampMode = 'second'"
        >
          <span>秒级</span>
        </button>
        <button
          class="mode-btn"
          :class="{ active: timestampMode === 'millisecond' }"
          @click="timestampMode = 'millisecond'"
        >
          <span>毫秒级</span>
        </button>
      </div>
    </div>

    <!-- 转换工具面板 -->
    <div class="convert-panels">
      <!-- 时间戳转日期 -->
      <div class="convert-panel">
        <div class="panel-header">
          <h2 class="panel-title">时间戳 → 日期</h2>
        </div>
        <div class="panel-body">
          <div class="input-group">
            <input
              v-model="timestampInput"
              type="text"
              class="input-field"
              placeholder="输入时间戳（秒或毫秒）"
            />
            <button class="btn btn-primary" @click="timestampToDate">转换</button>
          </div>
          <div v-if="dateResult" class="result-display">
            <span class="result-value">{{ dateResult }}</span>
          </div>
        </div>
      </div>

      <!-- 日期转时间戳 -->
      <div class="convert-panel">
        <div class="panel-header">
          <h2 class="panel-title">日期 → 时间戳</h2>
        </div>
        <div class="panel-body">
          <input
            v-model="dateInput"
            type="datetime-local"
            class="input-field input-date"
            @change="dateToTimestamp"
          />
          <div v-if="timestampResult" class="result-list">
            <div class="result-item">
              <span class="result-label">秒级</span>
              <span class="result-value">{{ timestampResult }}</span>
              <button class="btn-icon" @click="copyValue(timestampResult)" title="复制">
                <el-icon><CopyDocument /></el-icon>
              </button>
            </div>
            <div class="result-item">
              <span class="result-label">毫秒级</span>
              <span class="result-value">{{ timestampResultMs }}</span>
              <button class="btn-icon" @click="copyValue(timestampResultMs)" title="复制">
                <el-icon><CopyDocument /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Timestamp.vue - 时间戳转换工具
 * 提供时间戳与日期时间的相互转换功能
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

// 当前时间
const currentTime = ref<string>('')
const currentTimeMs = ref<string>('')
const currentTimestamp = ref<string>('')

// 时间戳模式：second-秒级，millisecond-毫秒级
const timestampMode = ref<'second' | 'millisecond'>('second')

// 时间戳转日期相关
const timestampInput = ref<string>('')
const dateResult = ref<string>('')

// 日期转时间戳相关
const dateInput = ref<string>('')
const timestampResult = ref<string>('')
const timestampResultMs = ref<string>('')

let timer: number | null = null

/**
 * 更新当前时间
 */
const updateCurrentTime = (): void => {
  const now = new Date()
  // 格式化为 YYYY-MM-DD HH:mm:ss
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')

  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  currentTimeMs.value = `.${ms}`

  // 根据选择的模式显示秒或毫秒
  if (timestampMode.value === 'second') {
    currentTimestamp.value = String(Math.floor(now.getTime() / 1000))
  } else {
    currentTimestamp.value = String(now.getTime())
  }
}

/**
 * 复制当前时间戳
 */
const copyTimestamp = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(currentTimestamp.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 复制指定值
 */
const copyValue = async (value: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/**
 * 时间戳转日期
 */
const timestampToDate = (): void => {
  dateResult.value = ''

  if (!timestampInput.value.trim()) {
    ElMessage.warning('请输入时间戳')
    return
  }

  try {
    const ts = Number(timestampInput.value.trim())

    if (isNaN(ts)) {
      ElMessage.error('请输入有效的数字')
      return
    }

    // 判断是秒还是毫秒（秒级时间戳通常是10位，毫秒是13位）
    let timestamp: number
    if (timestampInput.value.trim().length <= 10) {
      timestamp = ts * 1000
    } else {
      timestamp = ts
    }

    const date = new Date(timestamp)

    // 验证日期是否有效
    if (isNaN(date.getTime())) {
      ElMessage.error('无效的时间戳')
      return
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    dateResult.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    ElMessage.error('转换失败')
  }
}

/**
 * 日期转时间戳
 */
const dateToTimestamp = (): void => {
  timestampResult.value = ''
  timestampResultMs.value = ''

  if (!dateInput.value) {
    return
  }

  try {
    // datetime-local 返回的格式是 "YYYY-MM-DDTHH:mm:ss"
    // 需要正确解析这种格式
    const [dateStr, timeStr] = dateInput.value.split('T')

    if (!dateStr || !timeStr) {
      ElMessage.error('无效的日期')
      return
    }

    const [year, month, day] = dateStr.split('-').map(Number)
    const [hours, minutes, seconds] = timeStr.split(':').map(Number)

    // 创建日期对象（月份需要减1，因为月份从0开始）
    const date = new Date(year, month - 1, day, hours, minutes, seconds || 0)

    if (isNaN(date.getTime())) {
      ElMessage.error('无效的日期')
      return
    }

    // 秒级时间戳
    timestampResult.value = String(Math.floor(date.getTime() / 1000))
    // 毫秒级时间戳
    timestampResultMs.value = String(date.getTime())
  } catch (e) {
    ElMessage.error('转换失败')
  }
}

// 组件挂载时启动定时器
onMounted(() => {
  updateCurrentTime()
  timer = window.setInterval(updateCurrentTime, 100)
})

// 监听模式变化，切换时立即更新
watch(timestampMode, () => {
  updateCurrentTime()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
/* ===================================
   工具页面容器
   =================================== */
.timestamp-tool {
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
   当前时间面板
   =================================== */
.current-time-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

.time-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.time-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  line-height: 1;
}

.time-ms {
  font-size: 18px;
  color: var(--text-tertiary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.timestamp-display {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.timestamp-label {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timestamp-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* ===================================
   模式切换
   =================================== */
.mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-lg);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.mode-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.mode-options {
  display: flex;
  gap: var(--space-xs);
}

.mode-btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

.mode-btn.active {
  background-color: var(--accent-primary);
  color: #ffffff;
  border-color: var(--accent-primary);
}

/* ===================================
   复制按钮
   =================================== */
.btn-copy {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-copy:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
}

/* ===================================
   转换面板网格
   =================================== */
.convert-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

/* ===================================
   转换单个面板
   =================================== */
.convert-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.panel-body {
  padding: var(--space-lg);
}

/* ===================================
   输入组
   =================================== */
.input-group {
  display: flex;
  gap: var(--space-sm);
}

/* ===================================
   输入框样式
   =================================== */
.input-field {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-deep);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  transition: border-color 0.2s ease;
  outline: none;
}

.input-field::placeholder {
  color: var(--text-disabled);
}

.input-field:focus {
  border-color: var(--accent-primary);
}

/* ===================================
   按钮样式
   =================================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
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
   结果显示
   =================================== */
.result-display {
  margin-top: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background-color: var(--bg-deep);
  border-radius: var(--radius-md);
}

.result-value {
  font-size: 16px;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* ===================================
   结果列表
   =================================== */
.result-list {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-deep);
  border-radius: var(--radius-md);
}

.result-label {
  font-size: 12px;
  color: var(--text-tertiary);
  min-width: 60px;
}

.result-item .result-value {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .timestamp-tool {
    padding: 0 var(--space-md);
  }

  .tool-header {
    padding: var(--space-xl) 0 var(--space-md);
  }

  .tool-title {
    font-size: 20px;
  }

  .current-time-panel {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-lg);
  }

  .time-display {
    justify-content: center;
  }

  .time-value {
    font-size: 28px;
  }

  .timestamp-display {
    justify-content: center;
  }

  .convert-panels {
    grid-template-columns: 1fr;
  }

  .input-group {
    flex-direction: column;
  }
}
</style>
