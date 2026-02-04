# Aether Flow

一个 AI Agent 工作流平台，用可视化方式编排 AI 应用。

## 这是干嘛的

简单说就是让你能用拖拽的方式搭建 AI 工作流，不用写代码。

主要功能：

- **可视化工作流编辑器** - 拖拽节点，连线，搞定
- **知识库管理** - 上传文档，自动向量化，支持 RAG
- **多模型支持** - OpenAI、Claude、通义千问都能用
- **对话管理** - 多轮对话，带上下文

## 快速上手

### 1. 克隆项目

```bash
git clone https://github.com/lizuyi-6/day1.git
cd day1
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 然后编辑 .env，把 API Key 填进去
```

`.env` 文件主要配置：

```env
# 数据库
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=aether_flow

# 通义千问 API（你也可以换成其他兼容的）
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL=qwen-flash
```

### 3. 启动

**推荐用 Docker：**

```bash
docker-compose up -d
```

**或者本地开发：**

```bash
# 安装依赖
npm run install:all

# 启动后端
npm run dev:backend

# 启动前端（另一个终端）
npm run dev:frontend
```

### 4. 访问

- 前端：http://localhost:5173
- 后端：http://localhost:3000
- 数据库：localhost:5432

## 技术栈

**前端：**
- Vue 3 + TypeScript
- Vite
- Vue Flow（工作流编辑器）
- Tailwind CSS

**后端：**
- NestJS
- TypeORM
- PostgreSQL
- LangChain

## 怎么用

### 创建工作流

1. 打开工作流页面
2. 从左侧拖拽节点到画布
3. 连接节点
4. 配置每个节点的参数
5. 保存

### 上传文档到知识库

1. 进入知识库页面
2. 上传文件
3. 等待自动处理完成
4. 测试搜索

### 对话

1. 打开对话页面
2. 输入问题
3. 勾选"使用知识库"可以启用 RAG

## 项目结构

```
day1/
├── backend/           # NestJS 后端
│   └── src/
│       ├── agent/     # Agent 服务
│       ├── knowledge/ # 知识库
│       ├── session/   # 会话管理
│       └── workflow/  # 工作流
├── frontend/          # Vue 3 前端
│   └── src/
│       ├── components/
│       ├── views/
│       └── services/
└── docker-compose.yml # Docker 配置
```

## 常见问题

**Docker 启动失败？**

检查端口占用：
```bash
# Windows
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5173
```

**数据库连接不上？**

```bash
docker ps | grep aether_db
docker logs aether_db
```

**API 调用失败？**

检查：
1. API Key 对不对
2. 网络能不能访问
3. 配额够不够

## 注意事项

这个项目还是开发阶段，如果要上生产环境，需要：

1. 改数据库默认密码
2. 配置 CORS
3. 加认证
4. 关掉 TypeORM 的自动同步
5. 加日志和监控

## License

MIT

---

有问题就提 issue，或者直接联系我。

GitHub: [@lizuyi-6](https://github.com/lizuyi-6)
