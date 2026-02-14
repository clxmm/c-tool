# ===================================
# Dockerfile - c-tool 开发者工具镜像
# ===================================

# 第一阶段：构建阶段
# 使用 Node.js 18 作为构建环境
FROM node:24-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 Vue 应用
RUN npm run build

# 第二阶段：运行阶段
# 使用 Nginx 作为 Web 服务器
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
