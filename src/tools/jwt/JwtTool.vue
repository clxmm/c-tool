<template>
  <div class="jwt-tool">
    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">JWT 工具</h1>
      <p class="tool-subtitle">JSON Web Token 解密、加密、校验</p>
    </div>

    <!-- 工具面板 -->
    <div class="tool-panel">
      <!-- 功能选项卡 -->
      <div class="function-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          {{ tab.label }}
        </button>
      </div>

      <!-- 解密功能 -->
      <div v-show="activeTab === 'decode'" class="function-content">
        <div class="input-section">
          <div class="input-group">
            <label class="input-label">密钥（可选）</label>
            <el-input
              v-model="decodeData.secret"
              placeholder="输入密钥用于校验签名"
              class="jwt-input"
            />
          </div>
          <div class="input-group">
            <label class="input-label">JWT 字符串</label>
            <el-input
              v-model="decodeData.token"
              type="textarea"
              :rows="4"
              placeholder="输入 JWT 字符串"
              class="jwt-textarea"
              @blur="handleTokenBlur"
            />
          </div>
          <button class="btn btn-primary" @click="decodeJwt">
            <el-icon><Unlock /></el-icon>
            解密
          </button>
        </div>

        <!-- 解密结果 -->
        <div v-if="decodeResult" class="result-section">
          <div class="result-block">
            <h4 class="result-title">Header（头部）</h4>
            <pre class="code-block">{{ formatJson(decodeResult.header) }}</pre>
          </div>
          <div class="result-block">
            <h4 class="result-title">Payload（载荷）</h4>
            <pre class="code-block">{{ formatJson(decodeResult.payload) }}</pre>
          </div>
          <div class="result-block">
            <h4 class="result-title">Signature（签名）</h4>
            <pre class="code-block signature-block">{{ decodeResult.signature }}</pre>
            <div v-if="decodeResult.valid !== null" class="valid-indicator" :class="decodeResult.valid ? 'valid' : 'invalid'">
              <el-icon><component :is="decodeResult.valid ? 'CircleCheck' : 'CircleClose'" /></el-icon>
              {{ decodeResult.valid ? '签名有效' : '签名无效' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 加密功能 -->
      <div v-show="activeTab === 'encode'" class="function-content">
        <div class="input-section">
          <div class="input-group">
            <label class="input-label">签名算法</label>
            <el-select v-model="encodeData.algorithm" class="jwt-select">
              <el-option label="HS256" value="HS256" />
              <el-option label="HS384" value="HS384" />
              <el-option label="HS512" value="HS512" />
            </el-select>
          </div>
          <div class="input-group">
            <label class="input-label">密钥</label>
            <el-input
              v-model="encodeData.secret"
              placeholder="输入密钥"
              class="jwt-input"
            />
          </div>
          <div class="input-group">
            <label class="input-label">Header（头部）JSON</label>
            <el-input
              v-model="encodeData.header"
              type="textarea"
              :rows="4"
              placeholder='例如：{"alg":"HS256","typ":"JWT"}'
              class="jwt-textarea"
              @blur="handleHeaderBlur"
            />
          </div>
          <div class="input-group">
            <label class="input-label">Payload（载荷）JSON</label>
            <el-input
              v-model="encodeData.payload"
              type="textarea"
              :rows="5"
              placeholder='例如：{"sub":"123","name":"John"}'
              class="jwt-textarea"
              @blur="handlePayloadBlur"
            />
          </div>
          <button class="btn btn-primary" @click="encodeJwt">
            <el-icon><Lock /></el-icon>
            加密
          </button>
        </div>

        <!-- 加密结果 -->
        <div v-if="encodeResult" class="result-section">
          <div class="result-block">
            <h4 class="result-title">JWT 字符串</h4>
            <div class="jwt-output">
              <pre class="code-block">{{ encodeResult }}</pre>
              <button class="btn btn-icon copy-btn" @click="copyText(encodeResult)">
                <el-icon><DocumentCopy /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 校验功能 -->
      <div v-show="activeTab === 'verify'" class="function-content">
        <div class="input-section">
          <div class="input-group">
            <label class="input-label">密钥</label>
            <el-input
              v-model="verifyData.secret"
              placeholder="输入密钥用于校验签名"
              class="jwt-input"
            />
          </div>
          <div class="input-group">
            <label class="input-label">JWT 字符串</label>
            <el-input
              v-model="verifyData.token"
              type="textarea"
              :rows="4"
              placeholder="输入 JWT 字符串"
              class="jwt-textarea"
              @blur="handleTokenBlur"
            />
          </div>
          <button class="btn btn-primary" @click="verifyJwt">
            <el-icon><CircleCheck /></el-icon>
            校验
          </button>
        </div>

        <!-- 校验结果 -->
        <div v-if="verifyResult" class="result-section">
          <div class="result-block">
            <div class="valid-indicator large" :class="verifyResult.valid ? 'valid' : 'invalid'">
              <el-icon><component :is="verifyResult.valid ? 'CircleCheck' : 'CircleClose'" /></el-icon>
              {{ verifyResult.valid ? 'JWT 有效' : 'JWT 无效' }}
            </div>
            <div v-if="!verifyResult.valid && verifyResult.error" class="error-message">
              {{ verifyResult.error }}
            </div>
            <div v-if="verifyResult.decoded" class="decoded-preview">
              <h5 class="preview-title">解码内容：</h5>
              <pre class="code-block small">{{ formatJson(verifyResult.decoded) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JWT 说明 -->
    <div class="info-section">
      <h3 class="info-title">关于 JWT</h3>
      <div class="info-content">
        <p><strong>JWT（JSON Web Token）</strong> 是一种开放标准（RFC 7519），用于在各方之间安全地传输信息。它由三部分组成，用点（.）分隔：</p>
        <ul class="info-list">
          <li><strong>Header（头部）</strong>：描述令牌的元数据，通常包含算法和类型。</li>
          <li><strong>Payload（载荷）</strong>：包含声明（claims），即要传输的实际数据，如用户 ID、过期时间等。</li>
          <li><strong>Signature（签名）</strong>：使用密钥对头部和载荷进行签名，确保数据未被篡改。</li>
        </ul>
        <p class="info-note">注意：JWT 的载荷部分只是 Base64 编码，可以被解码读取。敏感信息不应直接放在 JWT 中，应使用加密方式保护。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Unlock, Lock, CircleCheck, CircleClose, DocumentCopy } from '@element-plus/icons-vue'

/**
 * JWT 工具
 * 提供 JWT 解密、加密、校验功能
 */

// 功能标签页配置
const tabs = [
  { key: 'decode', label: 'JWT 解密', icon: Unlock },
  { key: 'encode', label: 'JWT 加密', icon: Lock },
  { key: 'verify', label: 'JWT 校验', icon: CircleCheck }
]

// 当前激活的功能标签
const activeTab = ref('decode')

// 解密数据
const decodeData = reactive({
  token: '',
  secret: ''
})

// 加密数据
const encodeData = reactive({
  algorithm: 'HS256',
  secret: '',
  header: JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2),
  payload: JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }, null, 2)
})

// 校验数据
const verifyData = reactive({
  token: '',
  secret: ''
})

// 解密结果
const decodeResult = ref<{
  header: any
  payload: any
  signature: string
  valid: boolean | null
} | null>(null)

// 加密结果
const encodeResult = ref<string>('')

// 校验结果
const verifyResult = ref<{
  valid: boolean
  decoded: any | null
  error: string | null
} | null>(null)

/**
 * 格式化 JSON
 */
const formatJsonInput = (value: string): string => {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}

/**
 * 失去焦点时格式化 JSON
 */
const handleHeaderBlur = (): void => {
  encodeData.header = formatJsonInput(encodeData.header)
}

/**
 * 失去焦点时格式化 JSON
 */
const handlePayloadBlur = (): void => {
  encodeData.payload = formatJsonInput(encodeData.payload)
}

/**
 * 监听算法变化，自动更新 header 中的 alg
 */
watch(() => encodeData.algorithm, (newAlgorithm) => {
  try {
    const header = JSON.parse(encodeData.header)
    header.alg = newAlgorithm
    encodeData.header = JSON.stringify(header, null, 2)
  } catch {
    // 如果 header 不是有效 JSON，则重置为默认值
    encodeData.header = JSON.stringify({ alg: newAlgorithm, typ: 'JWT' }, null, 2)
  }
})

/**
 * 监听 header 变化，确保 alg 字段同步
 */
watch(() => encodeData.header, () => {
  try {
    const header = JSON.parse(encodeData.header)
    if (header.alg !== encodeData.algorithm) {
      encodeData.algorithm = header.alg
    }
  } catch {
    // 忽略无效 JSON
  }
})

/**
 * 失去焦点时去除空格
 */
const handleTokenBlur = (): void => {
  decodeData.token = decodeData.token.trim()
  verifyData.token = verifyData.token.trim()
}

/**
 * Base64 URL 安全编码
 */

/**
 * Base64 URL 安全编码
 */
const base64UrlEncode = (str: string): string => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/**
 * Base64 URL 安全解码
 */
const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  try {
    return atob(base64)
  } catch {
    return str
  }
}

/**
 * HMAC-SHA256 签名
 */
const hmacSha256 = async (key: string, message: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  return crypto.subtle.sign('HMAC', cryptoKey, messageData)
}

/**
 * HMAC-SHA384 签名
 */
const hmacSha384 = async (key: string, message: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-384' },
    false,
    ['sign']
  )

  return crypto.subtle.sign('HMAC', cryptoKey, messageData)
}

/**
 * HMAC-SHA512 签名
 */
const hmacSha512 = async (key: string, message: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  )

  return crypto.subtle.sign('HMAC', cryptoKey, messageData)
}

/**
 * 根据算法生成签名
 */
const generateSignature = async (algorithm: string, secret: string, data: string): Promise<string> => {
  let signature: ArrayBuffer

  switch (algorithm) {
    case 'HS256':
      signature = await hmacSha256(secret, data)
      break
    case 'HS384':
      signature = await hmacSha384(secret, data)
      break
    case 'HS512':
      signature = await hmacSha512(secret, data)
      break
    default:
      throw new Error('不支持的签名算法')
  }

  // 将 ArrayBuffer 转换为 Base64 URL 安全字符串
  const bytes = new Uint8Array(signature)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return base64UrlEncode(binary)
}

/**
 * 验证签名
 */
const verifySignature = async (algorithm: string, secret: string, data: string, signature: string): Promise<boolean> => {
  try {
    const expectedSignature = await generateSignature(algorithm, secret, data)
    return expectedSignature === signature
  } catch {
    return false
  }
}

/**
 * 解码 JWT
 */
const decodeJwt = async (): Promise<void> => {
  if (!decodeData.token.trim()) {
    ElMessage.warning('请输入 JWT 字符串')
    return
  }

  try {
    const parts = decodeData.token.split('.')

    if (parts.length !== 3) {
      throw new Error('JWT 格式错误，必须包含 Header、Payload、Signature 三部分')
    }

    const [headerEncoded, payloadEncoded, signature] = parts

    const header = JSON.parse(base64UrlDecode(headerEncoded))
    const payload = JSON.parse(base64UrlDecode(payloadEncoded))

    // 如果有密钥，验证签名
    let valid: boolean | null = null
    if (decodeData.secret.trim()) {
      const data = `${headerEncoded}.${payloadEncoded}`
      valid = await verifySignature(header.alg, decodeData.secret, data, signature)
    }

    decodeResult.value = {
      header,
      payload,
      signature,
      valid
    }
    ElMessage.success('解码成功')
  } catch (error) {
    decodeResult.value = null
    ElMessage.error((error as Error).message)
  }
}

/**
 * 生成 JWT
 */
const encodeJwt = async (): Promise<void> => {
  if (!encodeData.secret.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }

  try {
    // 验证 Header 和 Payload 的 JSON 格式
    const header = JSON.parse(encodeData.header)
    const payload = JSON.parse(encodeData.payload)

    const headerEncoded = base64UrlEncode(encodeData.header)
    const payloadEncoded = base64UrlEncode(encodeData.payload)
    const data = `${headerEncoded}.${payloadEncoded}`

    const signature = await generateSignature(encodeData.algorithm, encodeData.secret, data)

    encodeResult.value = `${data}.${signature}`
    ElMessage.success('生成成功')
  } catch (error) {
    encodeResult.value = ''
    ElMessage.error((error as Error).message)
  }
}

/**
 * 校验 JWT
 */
const verifyJwt = async (): Promise<void> => {
  if (!verifyData.token.trim()) {
    ElMessage.warning('请输入 JWT 字符串')
    return
  }

  if (!verifyData.secret.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }

  try {
    const parts = verifyData.token.split('.')

    if (parts.length !== 3) {
      throw new Error('JWT 格式错误')
    }

    const [headerEncoded, payloadEncoded, signature] = parts
    const header = JSON.parse(base64UrlDecode(headerEncoded))

    const data = `${headerEncoded}.${payloadEncoded}`
    const isValid = await verifySignature(header.alg, verifyData.secret, data, signature)

    // 解码内容
    const payload = JSON.parse(base64UrlDecode(payloadEncoded))

    verifyResult.value = {
      valid: isValid,
      decoded: payload,
      error: isValid ? null : '签名验证失败，密钥不正确或 JWT 已被篡改'
    }
    ElMessage.success('校验完成')
  } catch (error) {
    verifyResult.value = {
      valid: false,
      decoded: null,
      error: (error as Error).message
    }
    ElMessage.error((error as Error).message)
  }
}

/**
 * 格式化 JSON
 */
const formatJson = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

/**
 * 复制文本
 */
const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/**
 * JWT 工具样式
 * 采用科技感面板设计，深色主题
 */

.jwt-tool {
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
  margin-bottom: 24px;
}

/* 功能选项卡 */
.function-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 16px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.tab-btn.active {
  color: var(--accent-primary);
  background-color: rgba(22, 93, 255, 0.1);
}

/* 功能内容区 */
.function-content {
  animation: fadeIn 0.3s ease;
}

/* 输入区域 */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.jwt-input,
.jwt-select {
  width: 100%;
}

.jwt-textarea {
  width: 100%;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  width: fit-content;
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

.btn-icon {
  padding: 6px;
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background-color: var(--bg-deep);
  color: var(--text-primary);
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 结果区域 */
.result-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-block {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 16px;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.code-block {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--text-primary);
  background-color: var(--bg-deep);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.code-block.small {
  font-size: 12px;
  padding: 8px;
}

.signature-block {
  word-break: break-all;
}

.jwt-output {
  position: relative;
}

/* 有效性指示器 */
.valid-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
}

.valid-indicator.valid {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.valid-indicator.invalid {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.valid-indicator.large {
  width: fit-content;
  font-size: 16px;
  padding: 16px 24px;
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 13px;
}

.decoded-preview {
  margin-top: 16px;
}

.preview-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

/* 说明区域 */
.info-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 24px;
}

.info-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.info-content {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.info-content p {
  margin: 12px 0;
}

.info-content strong {
  color: var(--text-primary);
}

.info-list {
  margin: 16px 0;
  padding-left: 24px;
}

.info-list li {
  margin-bottom: 8px;
}

.info-note {
  margin-top: 16px;
  padding: 12px;
  background-color: rgba(22, 93, 255, 0.1);
  border-left: 3px solid var(--accent-primary);
  border-radius: 4px;
  font-size: 13px;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Element Plus 样式覆盖 */
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

:deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-color: var(--border-light);
  box-shadow: none;
}

:deep(.el-select .el-input__inner) {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .jwt-tool {
    padding: 0 16px;
  }

  .tool-panel,
  .info-section {
    padding: 16px;
  }

  .function-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
