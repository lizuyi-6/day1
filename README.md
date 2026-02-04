# Aether Flow

基于 Vue 3 和 NestJS 的 AI Agent 可视化工作流编排平台。

## 项目简介

Aether Flow 是一个全栈 AI 应用开发平台，允许用户通过可视化界面设计、部署和管理 AI Agent 工作流。平台集成了多个大语言模型提供商，支持知识库检索增强生成（RAG），并提供完整的工作流编排能力。

核心特点：

- **可视化工作流编辑器** - 基于 Vue Flow 的拖拽式节点编辑器，支持多种节点类型
- **知识库管理** - 文档上传、自动向量化、语义检索和 RAG 集成
- **多模型支持** - 兼容 OpenAI、Claude、通义千问等主流 LLM
- **会话管理** - 完整的多轮对话历史和上下文维护
- **容器化部署** - Docker Compose 一键启动

## 功能说明

### 1. 工作流编辑器

支持以下节点类型：

- **LLM 节点** - 调用大语言模型
- **知识库节点** - 检索相关文档
- **条件节点** - 根据结果分支
- **循环节点** - 重复执行逻辑
- **HTTP 请求节点** - 调用外部 API
- **延迟节点** - 控制执行节奏
- **变量节点** - 数据转换和处理

### 2. 知识库 (RAG)

- 支持文本文件上传
- 自动生成 1536 维向量嵌入
- 基于关键词的文档检索
- 与 LLM 的上下文增强集成

### 3. 对话系统

- 多轮对话会话管理
- 可选的知识库检索增强
- 流式响应支持（SSE）
- 完整的对话历史记录

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Docker 和 Docker Compose
- Git

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/lizuyi-6/day1.git
cd day1
```

#### 2. 配置环境变量

复制环境变量模板并填入实际值：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=aether_flow

# LLM API 配置（以通义千问为例）
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL=qwen-flash

# 前端配置
VITE_API_URL=http://backend:3000
```

**获取 API Key：**
- 通义千问：https://dashscope.console.aliyun.com/
- OpenAI：https://platform.openai.com/api-keys
- Claude：https://console.anthropic.com/

#### 3. 启动服务

**方式一：Docker Compose（推荐）**

```bash
# 启动所有服务
docker-compose up -d

# 查看后端日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

**方式二：本地开发**

```bash
# 安装依赖
npm run install:all

# 启动后端（终端 1）
npm run dev:backend

# 启动前端（终端 2）
npm run dev:frontend
```

#### 4. 访问应用

- 前端界面：http://localhost:5173
- 后端 API：http://localhost:3000
- PostgreSQL：localhost:5432

## 使用指南

### 创建工作流

1. 进入"工作流"页面
2. 从左侧面板选择节点类型，拖拽到画布
3. 拖动节点的连接点，建立节点间的数据流
4. 点击节点，在右侧面板配置参数
5. 点击"保存"，输入工作流名称

### 上传知识库文档

1. 进入"知识库"页面
2. 点击"上传文档"按钮
3. 选择文件（支持 .txt、.md、.pdf 等格式）
4. 等待系统自动处理（向量化）
5. 使用搜索框测试检索效果

### AI 对话

1. 进入"对话"页面
2. 在输入框输入问题
3. 勾选"使用知识库"启用 RAG 检索
4. 发送消息，查看 AI 响应
5. 支持多轮连续对话

## 技术架构

### 前端技术栈

- **框架**：Vue 3.4+ (Composition API)
- **语言**：TypeScript 5.0+
- **构建工具**：Vite 5.0+
- **工作流引擎**：Vue Flow（节点编辑器）
- **样式**：Tailwind CSS 3.0+
- **状态管理**：Pinia
- **路由**：Vue Router 4.0+

### 后端技术栈

- **框架**：NestJS 10.x
- **语言**：TypeScript 5.0+
- **ORM**：TypeORM 0.3.x
- **数据库**：PostgreSQL 15
- **LLM 集成**：LangChain.js
- **向量嵌入**：OpenAI Embeddings API
- **认证**：（待实现）JWT / Passport

### 基础设施

- **容器化**：Docker + Docker Compose
- **数据库**：PostgreSQL 15 Alpine
- **反向代理**：（待实现）Nginx
- **监控**：（待实现）Winston 日志

## 项目结构

```
day1/
├── backend/                    # NestJS 后端服务
│   ├── src/
│   │   ├── agent/             # Agent 服务层
│   │   │   ├── agent.controller.ts
│   │   │   ├── agent.service.ts
│   │   │   ├── dto/            # 数据传输对象
│   │   │   └── agent.module.ts
│   │   ├── knowledge/         # 知识库服务
│   │   │   ├── knowledge.controller.ts
│   │   │   ├── knowledge.service.ts
│   │   │   ├── entities/       # 实体定义
│   │   │   └── knowledge.module.ts
│   │   ├── session/           # 会话管理
│   │   │   ├── entities/       # Message, Session 实体
│   │   │   ├── session.controller.ts
│   │   │   ├── session.service.ts
│   │   │   └── session.module.ts
│   │   ├── workflow/          # 工作流服务
│   │   │   ├── entities/       # Workflow 实体
│   │   │   ├── workflow.controller.ts
│   │   │   ├── workflow.service.ts
│   │   │   └── workflow.module.ts
│   │   ├── common/            # 公共模块
│   │   │   └── filters/        # 全局异常过滤器
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── main.ts            # 应用入口
│   │   └── app.module.ts      # 根模块
│   ├── test/                  # 测试文件
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                   # Vue 3 前端应用
│   ├── src/
│   │   ├── components/        # Vue 组件
│   │   │   └── workflow/      # 工作流相关组件
│   │   │       ├── nodes/      # 各种节点组件
│   │   │       ├── edges/      # 连线组件
│   │   │       ├── ModelManager.vue
│   │   │       ├── VariableManager.vue
│   │   │       └── PluginManager.vue
│   │   ├── views/             # 页面视图
│   │   │   ├── HomeView.vue
│   │   │   ├── WorkflowView.vue
│   │   │   ├── ChatView.vue
│   │   │   ├── KnowledgeView.vue
│   │   │   └── LandingPage.vue
│   │   ├── services/          # API 服务
│   │   │   └── workflowService.ts
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── router/            # Vue Router 配置
│   │   ├── assets/            # 静态资源
│   │   └── main.ts            # 应用入口
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docker/                     # Docker 相关配置
│   └── init-db.sql            # 数据库初始化脚本
│
├── docker-compose.yml          # Docker Compose 配置
├── .env.example                # 环境变量模板
├── .gitignore
└── README.md
```

## API 文档

### Agent 相关

```
POST   /agent/chat           # 单次对话
POST   /agent/chat/stream    # 流式对话 (SSE)
```

### 知识库相关

```
POST   /knowledge/upload     # 上传文档
GET    /knowledge/search     # 搜索文档
GET    /knowledge            # 获取所有文档
DELETE /knowledge/:id        # 删除文档
```

### 工作流相关

```
POST   /workflow             # 创建工作流
GET    /workflow             # 获取所有工作流
GET    /workflow/:id         # 获取单个工作流
PUT    /workflow/:id         # 更新工作流
DELETE /workflow/:id         # 删除工作流
POST   /workflow/:id/execute # 执行工作流
```

### 会话相关

```
GET    /session              # 获取所有会话
GET    /session/:id/messages # 获取会话消息
POST   /session              # 创建新会话
```

## 常见问题

### Docker 相关

**Q: Docker 启动后无法访问前端？**

检查端口占用情况：

```bash
# Windows
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :5173
```

如果端口被占用，可以修改 `docker-compose.yml` 中的端口映射。

**Q: 后端容器启动失败？**

查看容器日志：

```bash
docker logs aether_backend
```

常见原因：
- 数据库未就绪（等待 10-20 秒）
- 环境变量配置错误
- 端口冲突

### 数据库相关

**Q: 数据库连接失败？**

确认数据库容器状态：

```bash
docker ps | grep aether_db
docker logs aether_db
```

测试数据库连接：

```bash
docker exec -it aether_db psql -U admin -d aether_flow -c "SELECT 1;"
```

### API 调用相关

**Q: LLM API 调用失败？**

检查清单：

1. API Key 是否正确
2. Base URL 是否可访问
3. 网络连接是否正常
4. API 配额是否充足

测试通义千问 API：

```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-flash","messages":[{"role":"user","content":"hello"}]}'
```

### 开发相关

**Q: 前端热更新不生效？**

重启开发服务器：

```bash
cd frontend
npm run dev
```

**Q: 后端代码修改后不生效？**

NestJS 在 watch 模式下会自动重启，如果没有：

```bash
cd backend
npm run start:dev
```

## 生产环境部署

### 安全检查清单

部署到生产环境前，请确认以下事项：

1. **修改默认密码**
   - 更改数据库 `DB_PASSWORD`
   - 使用强密码生成器

2. **配置 CORS**
   - 编辑 `backend/src/main.ts`
   - 限制允许的域名

3. **启用认证**
   - 实现 JWT 或 OAuth2
   - 添加用户管理模块

4. **数据库配置**
   - 设置 `synchronize: false`
   - 使用迁移管理数据库结构

5. **日志和监控**
   - 集成 Winston 日志系统
   - 添加错误监控（如 Sentry）

6. **HTTPS 配置**
   - 使用 Nginx 反向代理
   - 配置 SSL 证书

7. **环境变量**
   - 确保 `.env` 不在版本控制中
   - 使用环境变量管理服务

### 性能优化建议

1. **数据库优化**
   - 添加适当的索引
   - 使用连接池
   - 启用查询缓存

2. **前端优化**
   - 启用生产构建
   - 配置 CDN
   - 实现代码分割

3. **后端优化**
   - 实现 Redis 缓存
   - 使用消息队列处理异步任务
   - 添加限流机制

## 开发指南

### 本地开发

```bash
# 安装依赖
npm run install:all

# 启动后端（开发模式）
cd backend
npm run start:dev

# 启动前端（开发模式）
cd frontend
npm run dev
```

### 代码规范

```bash
# 后端 Lint
cd backend
npm run lint

# 前端 Lint
cd frontend
npm run lint
```

### 运行测试

```bash
# 后端单元测试
cd backend
npm run test

# 后端 E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

## 贡献指南

欢迎贡献代码、报告问题或提出建议。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 遵循 ESLint 配置
- 使用 Prettier 格式化
- 添加必要的注释
- 编写测试用例

## License

MIT License

## 联系方式

- GitHub：[@lizuyi-6](https://github.com/lizuyi-6)
- Issues：[GitHub Issues](https://github.com/lizuyi-6/day1/issues)
