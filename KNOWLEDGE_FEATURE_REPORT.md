# 知识库功能检查报告

## 概述

知识库功能用于管理向量嵌入和 RAG（检索增强生成）数据源，以增强 AI 助手的记忆能力。

## 功能状态

### ✅ 已实现的功能

#### 1. 后端 API (knowledge.controller.ts)

**上传文档端点**
- 路径: `POST /knowledge/upload`
- 认证: 需要 (HybridAuthGuard - 支持 JWT 或 BrowserID)
- 支持文件类型: TXT, PDF, DOC, DOCX
- 文件大小限制: 10MB
- 功能:
  - 文件验证
  - 文档处理（分块）
  - 向量化（使用 OpenAI/Qwen embedding API）
  - 存储到数据库

**搜索端点**
- 路径: `GET /knowledge/search`
- 认证: 需要
- 参数: `q` (查询字符串)
- 功能:
  - 向量相似度搜索 (使用 pgvector)
  - 关键词降级搜索
  - SQL 注入防护
  - 查询长度限制 (500 字符)

#### 2. 前端 UI (KnowledgeView.vue)

**页面功能**
- 路径: `/knowledge`
- 上传文档按钮
- 拖拽上传区域
- 文档列表显示
  - 文件名
  - 上传日期
  - 分块数量
  - 索引状态
- 空状态提示

**支持的文件格式**
- .txt (纯文本)
- .md (Markdown)
- .pdf (PDF 文档)

#### 3. 数据库 (PostgreSQL + pgvector)

**表结构 (knowledge)**
```sql
- id: UUID (主键)
- fileName: 文件名
- content: 文本内容 (分块后)
- embedding: vector(1536) (向量嵌入)
- createdAt: 创建时间
```

**数据库配置**
- 类型: PostgreSQL
- 扩展: pgvector v0.4.1
- Docker 镜像: ankane/pgvector:v0.4.1

#### 4. 文档处理流程 (knowledge.service.ts)

**处理步骤**
1. 文件上传验证
2. 文本提取 (当前只支持 TXT，需添加 PDF 解析)
3. 文本分块 (RecursiveCharacterTextSplitter)
   - 块大小: 500 字符
   - 重叠: 100 字符
4. 向量化 (OpenAIEmbeddings)
   - 模型: text-embedding-v3
   - 向量维度: 1536
   - API: Qwen (通义千问) 兼容模式
5. 数据库存储

**降级策略**
- 如果 API 调用失败，使用随机向量（演示模式）
- 如果向量搜索失败，降级到 LIKE 关键词搜索

#### 5. 安全特性

- ✅ SQL 注入防护 (查询转义)
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ 认证保护 (HybridAuthGuard)
- ✅ 查询长度限制
- ✅ 速率限制 (ThrottlerGuard: 100 次/分钟)

### ❌ 缺失的功能

#### 1. 工作流节点集成

**问题:** 没有实现知识库检索节点 (KnowledgeNode)

**影响:**
- 无法在工作流中使用知识库检索
- 无法实现 RAG 工作流
- WorkflowInspector 中的知识库节点配置无法使用

**需要实现:**
- `backend/src/workflow/nodes/knowledge.node.ts`
- 集成 knowledge service
- 支持参数: query, topK
- 返回检索结果

**示例代码结构:**
```typescript
@RegisterNode()
export class KnowledgeNode extends BaseNode {
  type = 'knowledge';
  label = 'Knowledge';
  category = 'data';

  async execute(inputs: Record<string, any>, context: ExecutionContext) {
    const query = inputs.query || inputs.input;
    const topK = inputs.topK || 3;

    const results = await this.knowledgeService.search(query, topK);

    return {
      results,
      context: results.map(r => r.content).join('\n'),
      count: results.length
    };
  }
}
```

#### 2. 前端文档列表加载

**问题:** `loadDocuments()` 函数是空的

**当前状态:**
```typescript
const loadDocuments = async () => {
  // 暂时模拟获取列表，实际应该添加 GET /knowledge/documents 接口
  try {
    // Mock initial list or implement backend list endpoint
  } catch (error) {
    console.error('Failed to load documents', error)
  }
}
```

**需要实现:**
- 后端添加 `GET /knowledge/documents` 端点
- 前端调用该端点加载已上传文档列表
- 显示文档状态 (处理中、已索引、错误)

#### 3. PDF 解析

**问题:** 当前只支持纯文本文件

**当前代码:**
```typescript
const text = file.buffer.toString('utf-8'); // Simple TXT support for now
```

**需要添加:**
- PDF 解析库 (pdf-parse 或 pdfjs-dist)
- DOCX 解析库 (mammoth)
- Markdown 解析器

**建议实现:**
```typescript
async extractText(file: Express.Multer.File): Promise<string> {
  const mimeType = file.mimetype;

  switch (mimeType) {
    case 'application/pdf':
      return await this.parsePdf(file.buffer);
    case 'text/plain':
      return file.buffer.toString('utf-8');
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await this.parseDocx(file.buffer);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
```

#### 4. 文档删除功能

**问题:** 无法删除已上传的文档

**需要添加:**
- 后端: `DELETE /knowledge/documents/:id` 端点
- 前端: 删除按钮和确认对话框
- 清理相关向量嵌入

#### 5. 搜索 UI

**问题:** WorkflowInspector 中有搜索 UI 但未连接到后端

**当前状态:**
```vue
<div class="form-group">
  <label class="form-label">查询文本</label>
  <textarea v-model="selectedNode.data.query" rows="3" class="form-textarea" placeholder="在此输入查询内容..."></textarea>
</div>
```

**需要实现:**
- 实际的搜索功能
- 结果预览
- 测试按钮

## 配置要求

### 环境变量

```env
# 数据库配置
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=password1234
DB_NAME=aether_flow

# Qwen API 配置
OPENAI_API_KEY=sk-xxxxx
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 依赖项

**后端:**
- @langchain/textsplitters
- @langchain/openai
- pgvector (PostgreSQL 扩展)
- typeorm
- @nestjs/common

**前端:**
- 无特殊依赖

## 测试建议

### 1. 测试文档上传

```bash
# 使用 BrowserID 认证上传文档
curl -X POST http://localhost:3001/knowledge/upload \
  -H "X-Browser-Id: test-browser-123" \
  -F "file=@test.txt"
```

### 2. 测试搜索

```bash
# 搜索已上传的内容
curl "http://localhost:3001/knowledge/search?q=test&X-Browser-Id=test-browser-123"
```

### 3. 测试工作流集成

需要先实现 KnowledgeNode，然后创建测试工作流:
- Start 节点 → Knowledge 节点 → LLM 节点 → End 节点

## 优先级建议

### 高优先级
1. ✅ 实现知识库节点 (KnowledgeNode) - 工作流集成的核心
2. ✅ 实现文档列表加载 API - 查看已上传文档
3. ✅ 添加 PDF 解析支持 - 扩展文件格式支持

### 中优先级
4. ✅ 文档删除功能 - 管理知识库
5. ✅ 搜索结果预览 - 改善用户体验

### 低优先级
6. 批量上传
7. 文档分类/标签
8. 向量数据库优化（索引、性能）

## 总结

**整体完成度: 约 60%**

**核心功能:**
- ✅ 后端文档处理和向量化
- ✅ 前端上传界面
- ✅ 搜索 API
- ❌ 工作流节点集成（关键缺失）
- ❌ 文档列表加载

**建议:**
1. 优先实现 KnowledgeNode 以完成工作流集成
2. 添加文档列表 API 以显示已上传文档
3. 扩展文件解析支持（PDF、DOCX）
4. 添加文档管理功能（删除、更新）

**当前可用场景:**
- ✅ 通过 API 上传和搜索文档
- ❌ 在工作流中使用知识库（需要节点实现）
