# 知识库测试文档使用指南

## 已创建的测试文档

我在 `X:\day1\test-docs\` 目录下创建了4个测试文档：

### 1. ai-introduction.txt
- **主题**: 人工智能技术概述
- **内容**: AI 的主要应用领域（NLP、计算机视觉、机器学习、专家系统、机器人技术）
- **字数**: 约 1500 字
- **适合测试**: 搜索"人工智能"、"机器学习"、"计算机视觉"等关键词

### 2. workflow-guide.md
- **主题**: Aether Flow 工作流引擎使用指南
- **内容**: 节点介绍、工作流创建步骤、RAG 应用示例
- **字数**: 约 2000 字
- **适合测试**: 搜索"工作流"、"节点"、"RAG"、"Knowledge"等

### 3. nestjs-best-practices.txt
- **主题**: NestJS 最佳实践
- **内容**: 模块化架构、依赖注入、DTO、异常处理、测试等
- **字数**: 约 2500 字
- **适合测试**: 搜索"NestJS"、"依赖注入"、"模块"、"测试"等

### 4. docker-tips.md
- **主题**: Docker 和 Docker Compose 实用技巧
- **内容**: Docker 命令、Docker Compose、最佳实践、调试技巧
- **字数**: 约 2800 字
- **适合测试**: 搜索"Docker"、"容器"、"镜像"、"Compose"等

## 上传测试文档的方法

### 方法 1: 通过 Web 界面上传（推荐）

1. 打开浏览器，访问 http://localhost:5173/knowledge
2. 点击"上传新文档"按钮
3. 依次选择以下文件上传：
   - `X:\day1\test-docs\ai-introduction.txt`
   - `X:\day1\test-docs\workflow-guide.md`
   - `X:\day1\test-docs\nestjs-best-practices.txt`
   - `X:\day1\test-docs\docker-tips.md`
4. 等待每个文件上传完成（会显示"上传成功"）

### 方法 2: 通过命令行上传

```bash
# 设置浏览器 ID
export BROWSER_ID="test-doc-upload"

# 上传所有文档
cd X:/day1/test-docs

curl -X POST http://localhost:3001/knowledge/upload \
  -H "X-Browser-Id: $BROWSER_ID" \
  -F "file=@ai-introduction.txt"

curl -X POST http://localhost:3001/knowledge/upload \
  -H "X-Browser-Id: $BROWSER_ID" \
  -F "file=@workflow-guide.md"

curl -X POST http://localhost:3001/knowledge/upload \
  -H "X-Browser-Id: $BROWSER_ID" \
  -F "file=@nestjs-best-practices.txt"

curl -X POST http://localhost:3001/knowledge/upload \
  -H "X-Browser-Id: $BROWSER_ID" \
  -F "file=@docker-tips.md"
```

## 测试知识库功能

### 1. 查看文档列表

上传后，文档会自动显示在知识库页面，显示：
- 文件名
- 上传日期
- Chunk 数量（每个文档会被分块）

### 2. 测试搜索功能

在知识库页面的搜索框中输入以下关键词进行测试：

**AI 相关**:
- "人工智能" - 应该返回 ai-introduction.txt
- "机器学习" - 应该返回相关内容
- "NLP" - 应该返回自然语言处理相关内容
- "深度学习" - 应该返回相关内容

**工作流相关**:
- "Aether Flow" - 应该返回 workflow-guide.md
- "节点" - 应该返回节点类型和配置相关内容
- "RAG" - 应该返回检索增强生成相关内容
- "工作流" - 应该返回工作流创建和配置相关内容

**NestJS 相关**:
- "NestJS" - 应该返回 nestjs-best-practices.txt
- "依赖注入" - 应该返回 DI 相关内容
- "模块" - 应该返回模块化架构相关内容
- "DTO" - 应该返回数据传输对象相关内容

**Docker 相关**:
- "Docker" - 应该返回 docker-tips.md
- "容器" - 应该返回容器操作相关内容
- "镜像" - 应该返回镜像管理相关内容
- "Compose" - 应该返回 Docker Compose 相关内容

### 3. 测试工作流集成

1. 访问 http://localhost:5173/workflows
2. 创建或编辑一个工作流
3. 添加以下节点：
   - **Start 节点**: 设置输入变量 `query`
   - **Knowledge 节点**:
     - 配置 query 使用上游变量
     - 设置 topK = 3
   - **LLM 节点**: 接收 Knowledge 的输出
   - **End 节点**: 返回最终结果
4. 连接节点: Start → Knowledge → LLM → End
5. 保存并发布工作流
6. 在对话页面测试该工作流

### 4. 测试删除功能

1. 在知识库页面找到已上传的文档
2. 点击文档右侧的删除按钮（垃圾桶图标）
3. 确认删除
4. 验证文档已从列表中移除
5. 搜索相关关键词，确认不再返回该文档内容

### 5. 测试 PDF 上传

如果您有 PDF 文件：
1. 点击"上传新文档"
2. 选择 PDF 文件
3. 系统会自动提取文本内容
4. 上传后可以搜索 PDF 中的内容

## 预期结果

### 上传成功后

每个文档应该：
- 显示在"已索引文档库"区域
- 显示正确的文件名
- 显示 chunk 数量（每个文档约 3-10 个 chunks）
- 状态显示为"已索引"

### 搜索成功后

搜索结果应该显示：
- 相关文档的文件名
- 匹配的内容片段
- 内容预览（约 100 字符）
- 上传日期

### 工作流集成成功后

- Knowledge 节点能够检索相关文档
- LLM 节点能够基于检索结果生成回答
- 最终返回的回答包含知识库中的信息

## 故障排除

### 文档未显示

**问题**: 上传后文档列表为空
**解决**:
1. 检查浏览器控制台是否有错误
2. 确认后端服务正常运行：`docker ps`
3. 查看后端日志：`docker logs aether_backend`

### 搜索无结果

**问题**: 搜索关键词返回空结果
**解决**:
1. 确认文档已成功上传并索引
2. 尝试使用更通用的关键词
3. 检查 OPENAI_API_KEY 是否配置（向量搜索需要）

### PDF 上传失败

**问题**: PDF 文件无法上传
**解决**:
1. 确认 PDF 文件大小不超过 10MB
2. 确认 pdf-parse 库已安装
3. 检查后端日志查看具体错误

## 测试检查清单

- [ ] 4个测试文档全部上传成功
- [ ] 文档列表显示正确（文件名、日期、chunk数）
- [ ] 搜索"人工智能"返回 ai-introduction.txt 内容
- [ ] 搜索"工作流"返回 workflow-guide.md 内容
- [ ] 搜索"NestJS"返回 nestjs-best-practices.txt 内容
- [ ] 搜索"Docker"返回 docker-tips.md 内容
- [ ] 删除一个文档后，搜索不再返回该文档内容
- [ ] 工作流中 Knowledge 节点能检索到相关文档
- [ ] WorkflowInspector 中测试 Knowledge 节点成功

祝您测试顺利！🎉
