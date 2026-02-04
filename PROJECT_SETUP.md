# Aether Flow - 项目启动指南

## 项目概述

Aether Flow 是一个全栈 AI Agent 工作流管理平台，包含：
- **后端**: NestJS + TypeScript + PostgreSQL
- **前端**: Vue 3 + TypeScript + Vite
- **数据库**: PostgreSQL 15

## 已完成的配置和修复

### 1. 模块依赖注入修复
- ✅ 在 `knowledge.module.ts` 中添加了 `exports: [KnowledgeService]`
- ✅ 在 `workflow.module.ts` 中添加了 `exports: [WorkflowService]`
- ✅ 修复了 NestJS 依赖注入错误

### 2. 向量存储配置
- ✅ 使用 JSON 类型存储 embedding 数据（而非 pgvector）
- ✅ 可在将来轻松升级到 pgvector 以获得更好的性能

### 3. 前后端连接配置
- ✅ 创建了 `frontend/src/config/api.ts` 配置文件
- ✅ 更新了 `ChatView.vue` 和 `WorkflowView.vue` 使用 API 配置
- ✅ 配置了正确的容器间网络通信

## 服务状态

所有服务已成功启动并运行：

| 服务 | 状态 | 端口 | URL |
|------|------|------|-----|
| 前端 | ✅ 运行中 | 5174 | http://localhost:5174 |
| 后端 | ✅ 运行中 | 3001 | http://localhost:3001 |
| 数据库 | ✅ 健康运行 | 5432 | localhost:5432 |

## 可用的 API 端点

### 基础端点
- `GET /` - 健康检查

### Agent API
- `POST /agent/chat` - 聊天接口
  - Body: `{ "message": "your message" }`
  - Response: `{ "response": "...", "sources": [...] }`

- `POST /agent/run/:workflowId` - 执行工作流
  - Body: `{ "inputMessage": "input" }`

### Workflow API
- `GET /workflow` - 获取所有工作流
- `POST /workflow` - 创建新工作流
- `GET /workflow/:id` - 获取单个工作流
- `PUT /workflow/:id` - 更新工作流
- `DELETE /workflow/:id` - 删除工作流

### Knowledge API
- `POST /knowledge/upload` - 上传知识库文档
- `GET /knowledge/search?q=query` - 搜索知识库

## 如何使用

### 启动项目

```bash
# 使用 Docker Compose 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并清除数据
docker-compose down -v
```

### 访问应用

1. 打开浏览器访问: **http://localhost:5174**
2. 使用前端界面创建和管理工作流
3. 通过聊天界面与 Agent 交互

## 功能模块

### 1. 工作流编辑器 (Workflow Editor)
- 创建和编辑可视化工作流
- 支持的节点类型：
  - START (开始节点)
  - ACTION (动作节点)
  - CONDITION (条件节点)
  - END (结束节点)
- 配置节点属性和连接关系

### 2. Agent 聊天 (Chat)
- 与 AI Agent 进行实时对话
- 支持执行工作流命令
- 搜索知识库内容

### 3. 知识库管理 (Knowledge)
- 上传 PDF 文档
- 文档内容提取和存储
- 基于关键词的搜索

## 技术栈

### 后端
- NestJS 11.0
- TypeORM 0.3
- PostgreSQL 15
- Langchain (AI 集成)

### 前端
- Vue 3.5
- TypeScript 5.9
- Vite 5.4
- Vue Flow (工作流可视化)
- Pinia (状态管理)

## 开发命令

### 后端
```bash
cd backend
npm install
npm run start:dev   # 开发模式
npm run build       # 构建
npm run start:prod  # 生产模式
npm test            # 运行测试
```

### 前端
```bash
cd frontend
npm install
npm run dev         # 开发服务器
npm run build       # 构建
npm run type-check  # 类型检查
npm run lint        # 代码检查
```

## 注意事项

1. **向量搜索升级**: 当前使用 JSON 存储 embedding 数据。如需高性能向量搜索，可以：
   - 使用 pgvector/pgvector:pg15 镜像替换 postgres:15-alpine
   - 在 `init-db.sql` 中启用 vector 扩展
   - 将 `knowledge.entity.ts` 中的字段类型改为 `vector`

2. **API 密钥配置**: 如需使用 LLM 功能，请在环境变量中配置：
   - `OPENAI_API_KEY` - OpenAI API 密钥
   - 其他 AI 服务密钥

3. **数据持久化**: 数据存储在 Docker volume `day1_postgres_data` 中

## 故障排查

### 服务无法启动
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### 前端无法连接后端
- 确保 VITE_API_URL 环境变量正确
- 检查容器网络通信：`docker network inspect day1_default`

### 数据库连接问题
- 确保 PostgreSQL 容器健康：`docker exec aether_db pg_isready -U admin`
- 检查数据库凭据：用户名=admin, 密码=password

## 后续改进建议

1. **认证系统**: 添加用户认证和授权
2. **WebSocket**: 实现实时通信
3. **更多节点类型**: 扩展工作流节点库
4. **性能优化**:
   - 实现向量搜索
   - 添加缓存机制
   - 优化数据库查询
5. **测试**: 添加单元测试和集成测试
6. **文档**: 完善 API 文档和用户手册

## 许可证

UNLICENSED
