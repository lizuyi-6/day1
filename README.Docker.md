# Docker 部署指南 🐳

## 快速开始

### 1. 确保安装了 Docker 和 Docker Compose
```bash
docker --version
docker-compose --version
```

### 2. 启动所有服务
```bash
# 构建并启动所有容器
docker-compose up --build

# 或者在后台运行
docker-compose up -d --build
```

### 3. 访问应用
- **前端**: http://localhost:5173
- **后端**: http://localhost:3001
- **数据库**: localhost:5432

### 4. 停止服务
```bash
# 停止所有容器
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

## 服务说明

### 📦 容器列表
| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| Frontend | workflow-frontend | 5173 | Vue + Vite 开发服务器 |
| Backend | workflow-backend | 3001 | NestJS API 服务器 |
| Database | workflow-postgres | 5432 | PostgreSQL 数据库 |

### 🔧 常用命令

```bash
# 查看运行中的容器
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 重启服务
docker-compose restart

# 进入容器
docker exec -it workflow-backend sh
docker exec -it workflow-frontend sh
docker exec -it workflow-postgres psql -U workflow_user -d workflow_db

# 重新构建
docker-compose build --no-cache

# 清理未使用的镜像和容器
docker system prune -a
```

## 开发模式特性

✅ **热重载**: 代码修改自动重启
✅ **数据持久化**: PostgreSQL 数据保存在 volume
✅ **网络隔离**: 服务间通过 Docker 网络通信
✅ **健康检查**: 自动检测数据库是否就绪

## 生产部署

创建 `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
    command: npm run start:prod

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    # 使用 Nginx 服务静态文件
```

启动生产环境：
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 故障排查

### 端口被占用
```bash
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3001

# 杀掉进程
taskkill /PID <PID> /F
```

### 容器无法启动
```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend

# 重新构建
docker-compose build --no-cache
docker-compose up
```

### 数据库连接失败
```bash
# 检查数据库健康状态
docker-compose ps

# 进入数据库容器
docker exec -it workflow-postgres psql -U workflow_user -d workflow_db
```

## 环境变量

复制 `.env.example` 到 `.env` 并修改配置：
```bash
cp .env.example .env
```

## 数据备份

```bash
# 备份数据库
docker exec workflow-postgres pg_dump -U workflow_user workflow_db > backup.sql

# 恢复数据库
docker exec -i workflow-postgres psql -U workflow_user workflow_db < backup.sql
```

---

🎉 **现在你的工作流系统已经完全 Docker 化了！**
