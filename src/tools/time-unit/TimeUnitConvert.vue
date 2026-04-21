<template>
  <!-- 时间单位转换工具 -->
  <div class="time-unit-tool">
    <!-- 工具标题区 -->
    <div class="tool-header">
      <div class="header-left">
        <h1 class="tool-title">时间单位转换</h1>
        <p class="tool-subtitle">输入数值，实时查看所有时间单位的换算结果</p>
      </div>
      <!-- 精度选择 -->
      <div class="precision-control">
        <span class="precision-label">精度</span>
        <div class="precision-options">
          <button
            v-for="p in precisionOptions"
            :key="p"
            class="precision-btn"
            :class="{ active: precision === p }"
            @click="precision = p"
          >
            {{ p }}位
          </button>
        </div>
      </div>
    </div>

    <!-- 输入面板 -->
    <div class="input-panel">
      <div class="input-group">
        <!-- 数值输入框 -->
        <input
          v-model="inputValue"
          type="text"
          class="input-field"
          placeholder="输入数值（支持负数和小数）"
          @input="onInputChange"
        />
        <!-- 单位下拉选择 -->
        <div class="unit-select-wrapper">
          <select v-model="selectedUnit" class="unit-select" @change="onUnitChange">
            <option
              v-for="unit in timeUnits"
              :key="unit.key"
              :value="unit.key"
            >
              {{ unit.label }}（{{ unit.symbol }}）
            </option>
          </select>
          <span class="select-arrow">▾</span>
        </div>
      </div>
      <!-- 输入校验提示 -->
      <div v-if="inputError" class="input-error">
        {{ inputError }}
      </div>
    </div>

    <!-- 结果网格 -->
    <div class="results-grid">
      <div
        v-for="unit in timeUnits"
        :key="unit.key"
        class="result-card"
        :class="{ active: selectedUnit === unit.key }"
        @click="onResultCardClick(unit.key)"
        :title="`点击以 ${unit.label} 为基准重新计算`"
      >
        <!-- 卡片头部：单位名称和符号 -->
        <div class="card-header">
          <span class="card-unit-name">{{ unit.label }}</span>
          <span class="card-unit-symbol">{{ unit.symbol }}</span>
        </div>
        <!-- 转换结果值 -->
        <div class="card-value">
          {{ getConvertedValue(unit.key) }}
        </div>
        <!-- 复制按钮 -->
        <button
          class="btn-copy"
          @click.stop="copyValue(unit.key)"
          title="复制"
        >
          <el-icon><CopyDocument /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TimeUnitConvert.vue - 时间单位转换工具
 * 支持纳秒、微秒、毫秒、秒、分钟、小时、天、周、月、年之间的实时转换
 * 核心思路：以「秒」为基准单位，所有单位通过系数与秒进行换算
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

/* ===================================
   时间单位定义
   =================================== */

/** 时间单位配置项 */
interface TimeUnit {
  /** 唯一标识 */
  key: string
  /** 单位中文名称 */
  label: string
  /** 单位符号 */
  symbol: string
  /** 换算到秒的系数（1 个该单位 = 多少秒） */
  toSecond: number
}

/** 支持的 10 个时间单位，从小到大排列 */
const timeUnits: TimeUnit[] = [
  { key: 'ns',  label: '纳秒', symbol: 'ns',  toSecond: 1e-9 },
  { key: 'us',  label: '微秒', symbol: 'μs',  toSecond: 1e-6 },
  { key: 'ms',  label: '毫秒', symbol: 'ms',  toSecond: 1e-3 },
  { key: 's',   label: '秒',   symbol: 's',   toSecond: 1 },
  { key: 'min', label: '分钟', symbol: 'min', toSecond: 60 },
  { key: 'h',   label: '小时', symbol: 'h',   toSecond: 3600 },
  { key: 'd',   label: '天',   symbol: 'd',   toSecond: 86400 },
  { key: 'wk',  label: '周',   symbol: 'wk',  toSecond: 604800 },
  { key: 'mo',  label: '月',   symbol: 'mo',  toSecond: 2592000 },
  { key: 'yr',  label: '年',   symbol: 'yr',  toSecond: 31536000 }
]

/* ===================================
   响应式状态
   =================================== */

/** 用户输入的数值（字符串形式，用于绑定输入框） */
const inputValue = ref<string>('')

/** 当前选中的单位 */
const selectedUnit = ref<string>('s')

/** 精度选项（小数位数） */
const precisionOptions = [2, 4, 6, 8] as const

/** 当前选择的精度 */
const precision = ref<number>(4)

/** 输入校验错误信息 */
const inputError = ref<string>('')

/* ===================================
   核心计算逻辑
   =================================== */

/**
 * 获取指定单位的换算系数
 * @param key - 单位标识
 * @returns 该单位到秒的换算系数
 */
const getUnitToSecond = (key: string): number => {
  const unit = timeUnits.find(u => u.key === key)
  return unit ? unit.toSecond : 1
}

/**
 * 计算所有单位的换算结果
 * 核心公式：目标值 = 输入值 × (输入单位到秒的系数 / 目标单位到秒的系数)
 */
const convertedResults = computed((): Map<string, number> => {
  const results = new Map<string, number>()

  // 输入为空时，所有结果为 0
  const numValue = parseFloat(inputValue.value)
  if (!inputValue.value.trim() || isNaN(numValue)) {
    timeUnits.forEach(u => results.set(u.key, 0))
    return results
  }

  // 当前选中单位到秒的系数
  const fromToSecond = getUnitToSecond(selectedUnit.value)

  // 遍历所有单位进行换算
  timeUnits.forEach(unit => {
    // 将输入值先转为秒，再从秒转为目标单位
    const value = numValue * (fromToSecond / unit.toSecond)
    results.set(unit.key, value)
  })

  return results
})

/**
 * 格式化数值显示
 * - 大数值或极小值自动切换为科学计数法
 * - 根据精度设置控制小数位数
 * - 结果为 0 或极小值时显示 0
 *
 * @param value - 待格式化的数值
 * @returns 格式化后的字符串
 */
const formatValue = (value: number): string => {
  // 极小值或 0 直接显示 0
  if (Math.abs(value) < 1e-20) return '0'

  const precisionVal = precision.value

  // 大数值（绝对值 >= 1e8）或极小值（绝对值 < 0.0001 且不为 0）使用科学计数法
  if (Math.abs(value) >= 1e8 || (Math.abs(value) < 0.0001 && Math.abs(value) > 0)) {
    return value.toExponential(precisionVal)
  }

  // 普通数值：按精度截取小数位
  return value.toFixed(precisionVal).replace(/\.?0+$/, '') || '0'
}

/**
 * 获取指定单位的格式化转换结果
 * @param key - 单位标识
 * @returns 格式化后的数值字符串
 */
const getConvertedValue = (key: string): string => {
  const value = convertedResults.value.get(key)
  if (value === undefined) return '0'
  return formatValue(value)
}

/* ===================================
   事件处理
   =================================== */

/**
 * 输入值变化时的校验处理
 */
const onInputChange = (): void => {
  inputError.value = ''
  const trimmed = inputValue.value.trim()

  // 空值清空结果，不报错
  if (!trimmed) return

  const num = Number(trimmed)

  // 非数字输入校验提示
  if (isNaN(num)) {
    inputError.value = '请输入有效的数字'
  }
}

/**
 * 单位切换时的处理（当前无需额外操作，computed 自动响应）
 */
const onUnitChange = (): void => {
  // computed 会自动重新计算，无需手动处理
}

/**
 * 点击结果卡片，将该单位的值设为新的输入源
 * 实现双向输入功能
 *
 * @param key - 被点击的单位标识
 */
const onResultCardClick = (key: string): void => {
  // 如果点击的是当前已选中的单位，不执行操作
  if (key === selectedUnit.value) return

  const rawValue = convertedResults.value.get(key)
  if (rawValue === undefined || rawValue === 0) return

  // 将该单位设为新的选中单位
  selectedUnit.value = key

  // 获取该单位的精确值（从原始计算结果中获取，避免精度丢失）
  const numValue = parseFloat(inputValue.value)
  if (isNaN(numValue)) return

  const fromToSecond = getUnitToSecond(key)
  // 反算：用当前选中的新单位下的值（rawValue 本身就是）作为输入
  inputValue.value = String(rawValue)

  // 清空错误
  inputError.value = ''
}

/**
 * 复制指定单位的转换结果到剪贴板
 *
 * @param key - 要复制的单位标识
 */
const copyValue = async (key: string): Promise<void> => {
  const value = getConvertedValue(key)
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/* ===================================
   工具页面容器
   =================================== */
.time-unit-tool {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-xl);
}

/* ===================================
   工具标题区
   =================================== */
.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2xl) 0 var(--space-lg);
  gap: var(--space-lg);
}

.header-left {
  flex: 1;
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
   精度选择控制
   =================================== */
.precision-control {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.precision-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.precision-options {
  display: flex;
  gap: var(--space-xs);
}

.precision-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 36px;
}

.precision-btn:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

.precision-btn.active {
  background-color: var(--accent-primary);
  color: #ffffff;
  border-color: var(--accent-primary);
}

/* ===================================
   输入面板
   =================================== */
.input-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

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
   单位下拉选择
   =================================== */
.unit-select-wrapper {
  position: relative;
  flex-shrink: 0;
}

.unit-select {
  appearance: none;
  -webkit-appearance: none;
  padding: var(--space-sm) var(--space-2xl) var(--space-sm) var(--space-md);
  background-color: var(--bg-deep);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
  min-width: 140px;
}

.unit-select:focus {
  border-color: var(--accent-primary);
}

/* 下拉箭头图标 */
.select-arrow {
  position: absolute;
  right: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
  font-size: 12px;
}

/* 输入校验错误提示 */
.input-error {
  margin-top: var(--space-sm);
  font-size: 12px;
  color: #e74c3c;
}

/* ===================================
   结果网格
   =================================== */
.results-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
  padding-bottom: var(--space-2xl);
}

/* ===================================
   结果卡片
   =================================== */
.result-card {
  position: relative;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-height: 120px;
}

/* 卡片悬停效果 */
.result-card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 当前选中的单位卡片高亮 */
.result-card.active {
  border-color: var(--accent-primary);
  background-color: rgba(22, 93, 255, 0.04);
}

/* ===================================
   卡片头部：单位名称和符号
   =================================== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-unit-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-unit-symbol {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===================================
   卡片数值显示
   =================================== */
.card-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  word-break: break-all;
  line-height: 1.5;
  flex: 1;
}

/* ===================================
   复制按钮
   =================================== */
.btn-copy {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
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
  opacity: 0;
}

/* 悬停卡片时显示复制按钮 */
.result-card:hover .btn-copy {
  opacity: 1;
}

.btn-copy:hover {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
}

/* ===================================
   响应式适配
   =================================== */
@media (max-width: 1200px) {
  .results-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .time-unit-tool {
    padding: 0 var(--space-md);
  }

  .tool-header {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-xl) 0 var(--space-md);
    gap: var(--space-md);
  }

  .tool-title {
    font-size: 20px;
  }

  .input-group {
    flex-direction: column;
  }

  .unit-select {
    width: 100%;
    min-width: unset;
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }

  .result-card {
    padding: var(--space-md);
    min-height: 100px;
  }

  /* 移动端始终显示复制按钮 */
  .btn-copy {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
