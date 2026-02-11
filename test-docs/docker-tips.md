# Docker 和 Docker Compose 实用技巧

## Docker 基础命令

### 镜像操作

```bash
# 构建镜像
docker build -t myapp:latest .

# 查看本地镜像
docker images

# 删除镜像
docker rmi myapp:latest

# 推送到镜像仓库
docker push myrepo/myapp:latest
```

### 容器操作

```bash
# 运行容器
docker run -d -p 8080:80 --name web nginx

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop web

# 启动已停止的容器
docker start web

# 重启容器
docker restart web

# 删除容器
docker rm web

# 查看容器日志
docker logs web

# 实时查看日志
docker logs -f web

# 进入容器 shell
docker exec -it web bash
```

## Docker Compose 基础

### 基本结构

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### 常用命令

```bash
# 启动所有服务
docker-compose up

# 后台启动
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务日志
docker-compose logs -f

# 重启特定服务
docker-compose restart web

# 构建并启动
docker-compose up --build

# 扩展服务
docker-compose up -d --scale web=3
```

## 最佳实践

### 1. 优化镜像大小

**使用多阶段构建**:
```dockerfile
# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
CMD ["npm", "start"]
```

**选择合适的基础镜像**:
- 生产环境使用 alpine 镜像（更小）
- 开发环境使用完整镜像（便于调试）

### 2. 数据持久化

使用命名卷或绑定挂载：
```yaml
services:
  app:
    volumes:
      - app_data:/app/data  # 命名卷
      - ./local:/app/local  # 绑定挂载

volumes:
  app_data:
```

### 3. 环境变量管理

创建 `.env` 文件：
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=secret_key_here
```

在 docker-compose.yml 中引用：
```yaml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - API_KEY=${API_KEY}
```

### 4. 健康检查

定义健康检查确保服务正常运行：
```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 5. 网络配置

创建自定义网络：
```yaml
services:
  web:
    networks:
      - frontend

  api:
    networks:
      - frontend
      - backend

networks:
  frontend:
  backend:
```

### 6. 资源限制

限制容器资源使用：
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 调试技巧

### 查看容器详细信息

```bash
# 查看容器资源使用
docker stats

# 查看容器进程
docker top web

# 查看容器端口映射
docker port web

# 查看容器元数据
docker inspect web
```

### 实时监控

```bash
# 监控多个容器
docker stats web api db

# 查看实时日志
docker logs -f --tail 100 web
```

### 网络调试

```bash
# 查看容器网络
docker network ls

# 检查容器间的连接
docker network inspect bridge
```

## 常见问题解决

### 容器无法启动

```bash
# 查看容器退出码
docker ps -a

# 查看详细日志
docker logs web --tail 50

# 交互式调试
docker run -it --rm --entrypoint bash myimage
```

### 权限问题

```bash
# 以特定用户运行
docker run -u 1000:1000 myimage

# 使用 --user 标记
docker-compose run --user node app
```

### 清理未使用资源

```bash
# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune -a

# 删除未使用的卷
docker volume prune

# 删除未使用的网络
docker network prune

# 清理所有未使用资源
docker system prune -a --volumes
```

## 安全建议

1. **不要在镜像中存储敏感信息**: 使用环境变量或 secrets
2. **使用非 root 用户**: 在 Dockerfile 中创建用户
3. **定期更新基础镜像**: 获取安全补丁
4. **扫描镜像漏洞**: 使用 `docker scan` 命令
5. **限制容器权限**: 避免使用 --privileged 标志

掌握这些技巧可以更高效地使用 Docker 和 Docker Compose！
