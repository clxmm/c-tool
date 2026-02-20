<template>
  <!-- 二维码工具 -->
  <div class="qrcode-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">二维码工具</h1>
      <p class="tool-subtitle">生成二维码与扫描识别二维码</p>
    </div>

    <!-- 模式切换标签 -->
    <div class="mode-tabs">
      <button
        class="tab-item"
        :class="{ active: activeTab === 'generate' }"
        @click="activeTab = 'generate'"
      >
        <el-icon><Promotion /></el-icon>
        <span>生成二维码</span>
      </button>
      <button
        class="tab-item"
        :class="{ active: activeTab === 'scan' }"
        @click="activeTab = 'scan'"
      >
        <el-icon><Scissor /></el-icon>
        <span>扫描二维码</span>
      </button>
    </div>

    <!-- 生成二维码 -->
    <div v-show="activeTab === 'generate'" class="tool-content">
      <div class="tool-panel">
        <!-- 输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <span class="section-label">输入内容</span>
            <button class="btn-text" @click="clearGenerate">清空</button>
          </div>
          <textarea
            v-model="generateInput"
            class="code-editor"
            placeholder="请输入需要生成二维码的内容（文本、网址等）..."
            spellcheck="false"
          ></textarea>
        </div>

        <!-- 二维码预览区域 -->
        <div class="preview-section">
          <div class="section-header">
            <span class="section-label">二维码预览</span>
            <div v-if="qrCodeDataUrl" class="header-actions">
              <button class="btn-icon" @click="copyQrCode" title="复制图片">
                <el-icon><CopyDocument /></el-icon>
              </button>
              <button class="btn-icon" @click="downloadQrCode" title="下载">
                <el-icon><Download /></el-icon>
              </button>
            </div>
          </div>
          <div class="qr-preview-area">
            <canvas ref="qrCanvas" class="qr-canvas"></canvas>
            <div v-if="!qrCodeDataUrl && !generateInput" class="qr-placeholder">
              <el-icon class="placeholder-icon"><Promotion /></el-icon>
              <span class="placeholder-text">输入内容后自动生成二维码</span>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="panel-footer">
          <div class="footer-left">
            <div class="size-control">
              <span class="control-label">尺寸：</span>
              <select v-model="qrSize" class="size-select">
                <option :value="256">256px</option>
                <option :value="384">384px</option>
                <option :value="512">512px</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" @click="generateQRCode">
            <el-icon><Promotion /></el-icon>
            <span>生成二维码</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 扫描二维码 -->
    <div v-show="activeTab === 'scan'" class="tool-content">
      <div class="scan-panel">
        <!-- 扫描模式切换 -->
        <div class="scan-mode-switch">
          <button
            class="mode-btn"
            :class="{ active: scanMode === 'camera' }"
            @click="scanMode = 'camera'; stopCamera()"
          >
            <el-icon><VideoCamera /></el-icon>
            <span>摄像头扫描</span>
          </button>
          <button
            class="mode-btn"
            :class="{ active: scanMode === 'file' }"
            @click="scanMode = 'file'; stopCamera()"
          >
            <el-icon><Upload /></el-icon>
            <span>上传图片</span>
          </button>
        </div>

        <!-- 摄像头扫描模式 -->
        <template v-if="scanMode === 'camera'">
          <!-- 摄像头选择 -->
          <div class="camera-selector">
            <span class="selector-label">选择摄像头：</span>
            <select v-model="selectedCameraId" class="camera-select" :disabled="!cameras.length">
              <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
                {{ camera.label || `摄像头 ${camera.id}` }}
              </option>
            </select>
            <button class="btn btn-secondary" @click="startCamera">
              <el-icon><VideoCamera /></el-icon>
              <span>打开摄像头</span>
            </button>
          </div>

          <!-- 扫描区域 -->
          <div class="scan-area">
            <!-- 视频流显示 -->
            <div class="video-container" :class="{ 'is-scanning': isScanning }">
              <video ref="videoElement" class="video-stream" muted playsinline></video>
              <!-- 扫描框 -->
              <div class="scan-frame">
                <div class="scan-corner scan-corner-tl"></div>
                <div class="scan-corner scan-corner-tr"></div>
                <div class="scan-corner scan-corner-bl"></div>
                <div class="scan-corner scan-corner-br"></div>
              </div>
              <!-- 未扫描时的提示 -->
              <div v-if="!isScanning" class="scan-placeholder">
                <el-icon class="scan-icon"><VideoCamera /></el-icon>
                <span class="scan-hint">点击上方按钮打开摄像头扫描二维码</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 文件上传扫描模式 -->
        <template v-else>
          <div class="file-scan-area">
            <!-- 文件上传区域 -->
            <div class="upload-area" :class="{ 'has-file': uploadedImagePreview }">
              <input
                ref="fileInput"
                type="file"
                class="file-input"
                accept="image/*"
                @change="handleFileUpload"
              />
              <div v-if="!uploadedImagePreview" class="upload-placeholder">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <span class="upload-text">点击或拖拽上传二维码图片</span>
                <span class="upload-hint">支持 jpg、png、webp 等格式</span>
              </div>
              <div v-else class="image-preview-container">
                <img :src="uploadedImagePreview" class="uploaded-image" alt="上传的二维码" />
                <button class="btn-clear-file" @click="clearUploadedFile" title="清除">
                  <el-icon><Close /></el-icon>
                </button>
              </div>
            </div>

            <!-- 扫描按钮 -->
            <div class="file-scan-actions">
              <button class="btn btn-primary" @click="scanFromFile" :disabled="!uploadedImagePreview">
                <el-icon><Scissor /></el-icon>
                <span>识别二维码</span>
              </button>
              <button class="btn btn-secondary" @click="triggerFileUpload">
                <el-icon><FolderOpened /></el-icon>
                <span>选择文件</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 扫描结果 -->
        <div v-if="scanResult" class="result-section">
          <div class="section-header">
            <span class="section-label">扫描结果</span>
            <div class="header-actions">
              <button class="btn-text" @click="clearScanResult">清空</button>
              <button class="btn-icon" @click="copyScanResult" title="复制">
                <el-icon><CopyDocument /></el-icon>
              </button>
            </div>
          </div>
          <div class="result-content">
            <textarea
              v-model="scanResult"
              class="result-editor"
              readonly
              spellcheck="false"
            ></textarea>
            <div v-if="scanResult.startsWith('http')" class="url-actions">
              <a :href="scanResult" target="_blank" rel="noopener" class="btn btn-primary">
                <el-icon><Link /></el-icon>
                <span>打开链接</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * QRCode.vue - 二维码工具
 * 提供二维码生成和扫描识别功能（支持摄像头和文件上传）
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Promotion,
  Scissor,
  CopyDocument,
  Download,
  VideoCamera,
  Link,
  Upload,
  Close,
  FolderOpened
} from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import QrScanner from 'qr-scanner'

// 当前激活的标签页
const activeTab = ref<string>('generate')

// 扫描模式：camera-摄像头，file-文件上传
const scanMode = ref<'camera' | 'file'>('camera')

// 生成二维码相关
const generateInput = ref<string>('')
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrCodeDataUrl = ref<string>('')
const qrSize = ref<number>(384)
let generateTimer: number | null = null

// 扫描二维码相关 - 摄像头
const videoElement = ref<HTMLVideoElement | null>(null)
const selectedCameraId = ref<string>('')
const cameras = ref<QrScanner.Camera[]>([])
const isScanning = ref<boolean>(false)

// 扫描二维码相关 - 文件上传
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedImagePreview = ref<string>('')
const uploadedImageElement = ref<HTMLImageElement | null>(null)

// 扫描结果
const scanResult = ref<string>('')
let qrScanner: QrScanner | null = null

/**
 * 生成二维码
 * 使用 qrcode 库将输入内容转换为二维码图片
 */
const generateQRCode = async (): Promise<void> => {
  if (!generateInput.value.trim()) {
    ElMessage.warning('请输入需要生成二维码的内容')
    return
  }

  if (!qrCanvas.value) {
    ElMessage.error('画布未初始化')
    return
  }

  try {
    // 使用 qrcode 库生成二维码
    qrCodeDataUrl.value = await QRCode.toCanvas(qrCanvas.value, generateInput.value, {
      width: qrSize.value,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    ElMessage.success('二维码生成成功')
  } catch (e) {
    console.error('二维码生成失败:', e)
    ElMessage.error('二维码生成失败')
  }
}

/**
 * 监听输入变化，防抖自动生成二维码
 */
watch(generateInput, () => {
  if (generateTimer) {
    clearTimeout(generateTimer)
  }
  if (generateInput.value.trim()) {
    generateTimer = window.setTimeout(() => {
      generateQRCode()
    }, 500)
  } else {
    qrCodeDataUrl.value = ''
  }
})

/**
 * 监听尺寸变化，重新生成二维码
 */
watch(qrSize, () => {
  if (generateInput.value.trim()) {
    generateQRCode()
  }
})

/**
 * 清空生成区域
 */
const clearGenerate = (): void => {
  generateInput.value = ''
  qrCodeDataUrl.value = ''
  if (qrCanvas.value) {
    const ctx = qrCanvas.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height)
    }
  }
}

/**
 * 复制二维码图片到剪贴板
 */
const copyQrCode = async (): Promise<void> => {
  if (!qrCanvas.value) {
    return
  }

  try {
    // 将 canvas 转换为 blob
    const blob = await new Promise<Blob>((resolve) => {
      qrCanvas.value!.toBlob((blob) => {
        resolve(blob!)
      })
    })

    // 复制到剪贴板
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
    ElMessage.success('二维码已复制到剪贴板')
  } catch (e) {
    // 如果 Clipboard API 不支持，尝试使用 dataURL
    try {
      const dataUrl = qrCanvas.value.toDataURL()
      await navigator.clipboard.writeText(dataUrl)
      ElMessage.success('二维码 Base64 已复制到剪贴板')
    } catch (e2) {
      ElMessage.error('复制失败')
    }
  }
}

/**
 * 下载二维码图片
 */
const downloadQrCode = (): void => {
  if (!qrCanvas.value) {
    ElMessage.warning('没有可下载的二维码')
    return
  }

  try {
    const link = document.createElement('a')
    link.href = qrCanvas.value.toDataURL('image/png')
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('下载成功')
  } catch (e) {
    ElMessage.error('下载失败')
  }
}

/**
 * 获取可用摄像头列表
 */
const getCameras = async (): Promise<void> => {
  try {
    const availableCameras = await QrScanner.getCameras()
    cameras.value = availableCameras
    if (availableCameras.length > 0) {
      selectedCameraId.value = availableCameras[0].id
    }
  } catch (e) {
    console.error('获取摄像头失败:', e)
    ElMessage.error('无法获取摄像头，请确保已授权')
  }
}

/**
 * 启动摄像头并开始扫描
 */
const startCamera = async (): Promise<void> => {
  if (!videoElement.value) {
    ElMessage.error('视频元素未初始化')
    return
  }

  // 如果已有扫描器，先停止
  if (qrScanner) {
    qrScanner.stop()
    qrScanner = null
  }

  try {
    // 创建新的扫描器
    qrScanner = new QrScanner(
      videoElement.value,
      (result) => {
        handleScanResult(result.data)
      },
      {
        preferredCamera: selectedCameraId.value || 'environment'
      }
    )

    // 启动扫描
    await qrScanner.start()
    isScanning.value = true
    ElMessage.success('摄像头已启动')
  } catch (e) {
    console.error('启动摄像头失败:', e)
    ElMessage.error('启动摄像头失败，请检查权限设置')
  }
}

/**
 * 停止摄像头
 */
const stopCamera = (): void => {
  if (qrScanner) {
    qrScanner.stop()
    qrScanner = null
    isScanning.value = false
  }
}

/**
 * 触发文件上传
 */
const triggerFileUpload = (): void => {
  fileInput.value?.click()
}

/**
 * 处理文件上传
 * 读取上传的图片并显示预览
 */
const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  // 验证文件大小（限制 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning('图片大小不能超过 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    uploadedImagePreview.value = result

    // 创建 Image 元素用于二维码识别
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      uploadedImageElement.value = img
    }
    img.onerror = () => {
      ElMessage.error('图片加载失败')
      uploadedImagePreview.value = ''
    }
    img.src = result
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败')
  }
  reader.readAsDataURL(file)
}

/**
 * 从上传的文件中扫描二维码
 */
const scanFromFile = async (): Promise<void> => {
  if (!uploadedImageElement.value) {
    ElMessage.warning('请先上传二维码图片')
    return
  }

  try {
    // 使用 qr-scanner 从 HTMLImageElement 中识别二维码
    const result = await QrScanner.scanImage(uploadedImageElement.value)

    if (result) {
      handleScanResult(result)
    } else {
      ElMessage.error('未能识别二维码，请确保图片清晰')
    }
  } catch (e) {
    console.error('识别失败:', e)
    ElMessage.error('识别失败，请检查图片是否包含有效的二维码')
  }
}

/**
 * 清空上传的文件
 */
const clearUploadedFile = (): void => {
  uploadedImagePreview.value = ''
  uploadedImageElement.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * 处理扫描结果
 */
const handleScanResult = (data: string): void => {
  scanResult.value = data
  ElMessage.success('扫描成功')

  // 扫描成功后自动停止摄像头
  setTimeout(() => {
    stopCamera()
  }, 500)
}

/**
 * 清空扫描结果
 */
const clearScanResult = (): void => {
  scanResult.value = ''
}

/**
 * 复制扫描结果
 */
const copyScanResult = async (): Promise<void> => {
  if (!scanResult.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(scanResult.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

// 组件挂载时获取摄像头列表
onMounted(() => {
  getCameras()
})

// 组件卸载时停止摄像头
onUnmounted(() => {
  stopCamera()
  if (generateTimer) {
    clearTimeout(generateTimer)
  }
})
</script>

<style scoped>
/* ===================================
   工具页面容器
   =================================== */
.qrcode-tool {
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
   输入区域
   =================================== */
.input-section {
  border-bottom: 1px solid var(--border-light);
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

.code-editor {
  width: 100%;
  min-height: 120px;
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

/* ===================================
   预览区域
   =================================== */
.preview-section {
  padding: var(--space-lg);
}

.qr-preview-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background-color: var(--bg-deep);
  border-radius: var(--radius-md);
  position: relative;
}

.qr-canvas {
  max-width: 100%;
  height: auto;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 48px;
  color: var(--border-medium);
}

.placeholder-text {
  font-size: 14px;
}

/* ===================================
   面板底部
   =================================== */
.panel-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.size-control {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.control-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.size-select {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-deep);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.size-select:hover {
  border-color: var(--border-medium);
}

.size-select:focus {
  border-color: var(--accent-primary);
}

/* ===================================
   扫描面板
   =================================== */
.scan-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* ===================================
   扫描模式切换
   =================================== */
.scan-mode-switch {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  background-color: var(--bg-deep);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background-color: var(--bg-elevated);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

.mode-btn.active {
  background-color: var(--accent-primary);
  color: #ffffff;
  border-color: var(--accent-primary);
}

/* ===================================
   摄像头选择器
   =================================== */
.camera-selector {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.selector-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.camera-select {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-deep);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  min-width: 200px;
}

.camera-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===================================
   扫描区域
   =================================== */
.scan-area {
  padding: var(--space-lg);
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  aspect-ratio: 4/3;
  background-color: var(--bg-deep);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.is-scanning .video-stream {
  object-fit: contain;
}

/* ===================================
   文件上传扫描区域
   =================================== */
.file-scan-area {
  padding: var(--space-lg);
}

.upload-area {
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-deep);
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--border-medium);
  background-color: rgba(22, 93, 255, 0.05);
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
  pointer-events: none;
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

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploaded-image {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.btn-clear-file {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
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

.btn-clear-file:hover {
  background-color: var(--accent-error);
  color: #ffffff;
}

/* ===================================
   文件扫描操作区
   =================================== */
.file-scan-actions {
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

/* ===================================
   扫描框
   =================================== */
.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  pointer-events: none;
}

.scan-corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: var(--accent-primary);
  border-style: solid;
  border-width: 3px;
}

.scan-corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.scan-corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.scan-corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.scan-corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

/* ===================================
   扫描占位符
   =================================== */
.scan-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  color: var(--text-secondary);
}

.scan-icon {
  font-size: 64px;
  color: var(--border-medium);
}

.scan-hint {
  font-size: 14px;
  max-width: 280px;
  text-align: center;
  line-height: 1.6;
}

/* ===================================
   结果区域
   =================================== */
.result-section {
  border-top: 1px solid var(--border-light);
}

.result-editor {
  width: 100%;
  min-height: 100px;
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

.result-content {
  padding: var(--space-md);
}

.url-actions {
  margin-top: var(--space-sm);
  display: flex;
  justify-content: center;
}

/* ===================================
   按钮样式
   =================================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #0d4fd1;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
   响应式适配
   =================================== */
@media (max-width: 768px) {
  .qrcode-tool {
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

  .panel-footer {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }

  .footer-left {
    justify-content: space-between;
  }

  .camera-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .camera-select {
    width: 100%;
  }

  .video-container {
    aspect-ratio: 3/4;
  }

  .scan-frame {
    width: 150px;
    height: 150px;
  }

  .qr-preview-area {
    min-height: 300px;
  }

  .scan-mode-switch {
    flex-direction: column;
  }

  .file-scan-actions {
    flex-direction: column;
  }

  .file-scan-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
