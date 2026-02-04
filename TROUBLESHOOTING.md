# Aether Flow - 故障排查指南

本文档帮助你诊断和解决 Aether Flow 启动和运行中的常见问题。

## 快速诊断

### 检查所有服务状态
```bash
docker-compose ps
```

正常输出应显示所有服务为 `Up` 状态：
- `aether_db` - 数据库服务
- `aether_backend` - 后端服务
- `aether_frontend` - 前端服务

### 查看实时日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f db
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 常见问题与解决方案

### 1. 数据库启动失败

**症状：**
- 后端无法连接数据库
- 日志显示 "connection refused" 或 "database is not ready"

**诊断步骤：**
```bash
# 检查数据库容器状态
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 检查数据库健康状态
docker inspect aether_db --format='{{.State.Health.Status}}'
```

**解决方案：**

1. **端口冲突**
```bash
# 检查 5432 端口是否被占用
netstat -ano | findstr :5432  # Windows
lsof -i :5432                  # Linux/Mac

# 如果被占用，修改 docker-compose.yml 中的端口映射
ports:
  - "5433:5432"  # 改为 5433
```

2. **数据卷损坏**
```bash
# 删除旧数据重新初始化
docker-compose down
docker volume rm day1_postgres_data
docker-compose up -d
```

3. **权限问题**
```bash
# 重建容器
docker-compose down
docker-compose up -d --force-recreate
```

### 2. 后端启动失败

**症状：**
- 后端服务反复重启
- 无法访问 http://localhost:3001

**诊断步骤：**
```bash
# 检查后端日志
docker-compose logs backend

# 检查健康状态
docker inspect aether_backend --format='{{.State.Health.Status}}'

# 手动测试健康检查端点
curl http://localhost:3001/health
```

**解决方案：**

1. **依赖安装失败**
```bash
# 进入后端容器
docker exec -it aether_backend sh

# 手动安装依赖
npm install --legacy-peer-deps

# 退出容器
exit

# 重启后端服务
docker-compose restart backend
```

2. **数据库连接超时**
```bash
# 检查数据库是否就绪
docker exec aether_backend sh -c "nc -z db 5432 && echo 'DB reachable'"

# 查看等待日志
docker-compose logs backend | grep "Waiting for database"
```

3. **TypeScript 编译错误**
```bash
# 查看完整编译日志
docker-compose logs backend | tail -100

# 在本地重新构建测试
cd backend
npm run build
```

### 3. 前端启动失败

**症状：**
- 无法访问 http://localhost:5174
- 页面显示连接错误

**诊断步骤：**
```bash
# 检查前端日志
docker-compose logs frontend

# 检查容器是否运行
docker-compose ps frontend
```

**解决方案：**

1. **端口冲突**
```bash
# 检查 5174 端口是否被占用
netstat -ano | findstr :5174  # Windows
lsof -i :5174                  # Linux/Mac

# 修改 docker-compose.yml 中的端口
ports:
  - "5175:5173"  # 改为 5175
```

2. **后端 API 连接失败**
```bash
# 检查 VITE_API_URL 配置
docker exec aether_frontend env | grep VITE_API_URL

# 测试后端连接
docker exec aether_frontend wget -O- http://backend:3000/health
```

### 4. 冷启动失败

**症状：**
- 首次启动或重启后服务无法正常启动
- 健康检查超时

**解决方案：**

1. **使用改进的启动脚本**
```bash
# Windows
.\start.ps1

# Linux/Mac
chmod +x start.sh
./start.sh
```

2. **手动逐步启动**
```bash
# 先启动数据库
docker-compose up -d db

# 等待数据库健康
docker inspect aether_db --format='{{.State.Health.Status}}'

# 启动后端
docker-compose up -d backend

# 等待后端健康
curl http://localhost:3001/health

# 启动前端
docker-compose up -d frontend
```

3. **增加健康检查超时**
   编辑 `docker-compose.yml`，增加 `start_period`：
```yaml
healthcheck:
  start_period: 60s  # 从 40s 增加到 60s
```

### 5. 性能问题

**症状：**
- 服务响应缓慢
- CPU/内存占用过高

**诊断步骤：**
```bash
# 查看容器资源使用
docker stats

# 查看数据库连接
docker exec aether_db psql -U admin -d aether_flow -c "SELECT count(*) FROM pg_stat_activity;"
```

**解决方案：**

1. **清理未使用的资源**
```bash
docker system prune -a
```

2. **限制容器资源**
   在 `docker-compose.yml` 中添加：
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 6. 环境变量问题

**症状：**
- API 调用失败
- 配置未生效

**解决方案：**

1. **检查环境变量文件**
```bash
# 确保 .env 文件存在
cat .env

# 检查格式是否正确（不能有引号）
# 正确: API_KEY=your-api-key
# 错误: API_KEY="your-api-key"
```

2. **验证容器内环境变量**
```bash
docker exec aether_backend env | grep OPENAI
```

3. **重新加载配置**
```bash
docker-compose down
docker-compose up -d
```

## 完全重置

如果问题无法解决，执行完全重置：

```bash
# 停止并删除所有容器
docker-compose down

# 删除数据卷（⚠️ 会删除所有数据）
docker volume rm day1_postgres_data

# 删除 node_modules（可选）
rm -rf backend/node_modules
rm -rf frontend/node_modules

# 重新启动
./start.sh  # Linux/Mac
.\start.ps1 # Windows
```

## 获取帮助

如果以上方法都无法解决问题：

1. **收集诊断信息**
```bash
# 保存日志
docker-compose logs > logs.txt

# 保存容器状态
docker-compose ps > status.txt

# 保存配置
docker-compose config > config.txt
```

2. **检查系统要求**
   - Docker Desktop 已安装并运行
   - Docker Compose 版本 >= 1.29
   - 至少 4GB 可用内存
   - 至少 10GB 可用磁盘空间

3. **查看特定版本信息**
```bash
docker --version
docker-compose --version
docker info
```

## 预防措施

1. **定期备份**
```bash
# 备份数据库
docker exec aether_db pg_dump -U admin aether_flow > backup.sql

# 备份环境变量
cp .env .env.backup
```

2. **使用版本控制**
```bash
git add .
git commit -m "Working state"
```

3. **监控健康状态**
```bash
# 定期检查
watch -n 5 'docker-compose ps'
```

## 参考命令速查

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 重启特定服务
docker-compose restart backend

# 查看日志
docker-compose logs -f --tail=100 backend

# 进入容器
docker exec -it aether_backend sh

# 重建服务
docker-compose up -d --force-recreate

# 查看资源使用
docker stats
```
