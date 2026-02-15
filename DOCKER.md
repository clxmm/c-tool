# Docker 部署指南

## 本地构建与运行

### 1. 构建镜像

```bash
docker build -t c-tool .
```

### 2. 运行容器

```bash
# 使用默认端口 80
docker run -d -p 8080:80 --name c-tool c-tool

# 或使用自定义端口
docker run -d -p 3000:80 --name c-tool c-tool
```

### 3. 访问应用

浏览器打开 http://localhost:8080

---

## Docker Hub 镜像

### 拉取镜像

```bash
docker pull clxmm/c-tool:latest
```

### 使用 Docker Hub 镜像运行

```bash
docker run -d -p 8080:80 clxmm/c-tool:latest
```

---

## Docker Compose 部署

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  c-tool:
    image: clxmm/c-tool:latest
    container_name: c-tool
    ports:
      - "8080:80"
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

停止服务：

```bash
docker-compose down
```

---

## GitHub Actions 自动部署

项目配置了 GitHub Actions，**仅在推送 git tag 时**自动构建并推送 Docker 镜像：

- 创建并推送带有 `v*` 前缀的标签（如 v1.0.0）

### 如何触发构建

```bash
# 1. 提交代码
git add .
git commit -m "更新代码"

# 2. 推送到远程仓库
git push

# 3. 创建并推送 tag（这将触发 GitHub Actions）
git tag v1.0.0
git push origin v1.0.0
```

### 配置 Secrets

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 说明 |
|------------|------|
| `DOCKER_USERNAME` | Docker Hub 用户名 |
| `DOCKER_PASSWORD` | Docker Hub 访问令牌（推荐）或密码 |

> 注意：不要使用 Docker Hub 密码，建议使用 [Access Token](https://hub.docker.com/settings/security)

---

## 镜像标签说明

| 标签 | 说明 |
|------|------|
| `latest` | 最新版本（main 分支的最新提交） |
| `main` | main 分支版本 |
| `v1.0.0` | 指定版本号 |
| `v1` | 主版本 |
| `sha-abc123` | 基于提交 SHA 的版本 |

---

## 配置说明

- **Nginx 端口**: 80
- **Vue Router**: History 模式
- **静态资源**: 已配置缓存策略
- **安全头部**: 已配置基本安全头部

---

## 多架构支持

镜像支持以下平台：

- `linux/amd64`
- `linux/arm64`

Docker 会自动根据宿主机架构拉取合适的镜像。
