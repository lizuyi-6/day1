# 示例工作流使用指南

## 📊 工作流信息

**工作流ID**: `3a514ee1-f178-451e-8a7e-84d7de8fdfef`  
**名称**: 示例工作流 - AI智能助手  
**创建时间**: 2026-02-08 16:42:15  
**状态**: ✅ 已保存到数据库

---

## 🎯 工作流功能

这个示例工作流演示了一个简单的AI对话助手，包含3个节点：

### 节点流程图

```
┌─────────┐
│  开始   │  (Start Node)
└────┬────┘
     │
     ↓
┌─────────┐
│ AI处理  │  (LLM Node)
└────┬────┘
     │
     ↓
┌─────────┐
│  结束   │  (End Node)
└─────────┘
```

### 节点详情

#### 1. **开始节点** (Start)
- **ID**: `start-node`
- **位置**: (100, 150)
- **功能**: 接收用户输入
- **变量**: `userInput` = "请介绍一下你自己"

#### 2. **AI处理节点** (LLM)
- **ID**: `llm-node`
- **位置**: (400, 150)
- **功能**: 调用LLM API生成回复
- **配置**:
  - **Prompt**: "你是一个友好的AI助手。请回答：{{userInput}}"
  - **Model**: gpt-3.5-turbo
  - **Temperature**: 0.7
  - **Max Tokens**: 500

#### 3. **结束节点** (End)
- **ID**: `end-node`
- **位置**: (700, 150)
- **功能**: 输出最终结果
- **输出映射**: `response` ← `aiResponse`

---

## 🚀 如何使用

### 方法1: 通过前端界面

1. **访问前端**:
   ```
   http://localhost:5173/workflow
   ```

2. **查找工作流**:
   - 在工作流列表中找到"示例工作流 - AI智能助手"
   - 或使用ID: `3a514ee1-f178-451e-8a7e-84d7de8fdfef`

3. **查看工作流**:
   - 点击工作流卡片查看详情
   - 可视化显示3个节点和2个连接

4. **执行工作流**:
   - 点击"执行"按钮
   - 系统会运行整个工作流
   - 查看执行结果

### 方法2: 通过API

#### 获取工作流详情
```bash
curl http://localhost:3001/workflow/3a514ee1-f178-451e-8a7e-84d7de8fdfef
```

#### 执行工作流
```bash
curl -X POST http://localhost:3001/workflow/3a514ee1-f178-451e-8a7e-84d7de8fdfef/run \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"userInput": "你好，请介绍一下你自己"}}'
```

#### 更新工作流
```bash
curl -X PUT http://localhost:3001/workflow/3a514ee1-f178-451e-8a7e-84d7de8fdfef \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的AI助手",
    "graphData": {
      "nodes": [...],
      "edges": [...]
    }
  }'
```

#### 删除工作流
```bash
curl -X DELETE http://localhost:3001/workflow/3a514ee1-f178-451e-8a7e-84d7de8fdfef
```

---

## 📚 完整工作流JSON

工作流的完整数据已保存在: `X:/day1/SAMPLE_WORKFLOW.json`

```json
{
  "id": "3a514ee1-f178-451e-8a7e-84d7de8fdfef",
  "name": "示例工作流 - AI智能助手",
  "description": "演示如何使用LLM节点创建一个简单的AI对话助手",
  "created": "2026-02-08T16:42:15.029Z",
  "graphData": {
    "nodes": [
      {
        "id": "start-node",
        "type": "start",
        "position": { "x": 100, "y": 150 },
        "data": {
          "label": "开始",
          "variables": {
            "userInput": "请介绍一下你自己"
          }
        }
      },
      {
        "id": "llm-node",
        "type": "llm",
        "position": { "x": 400, "y": 150 },
        "data": {
          "label": "AI处理",
          "config": {
            "prompt": "你是一个友好的AI助手。请回答：{{userInput}}",
            "model": "gpt-3.5-turbo",
            "temperature": 0.7,
            "maxTokens": 500
          }
        }
      },
      {
        "id": "end-node",
        "type": "end",
        "position": { "x": 700, "y": 150 },
        "data": {
          "label": "结束",
          "outputMapping": {
            "response": "aiResponse"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "start-node",
        "target": "llm-node",
        "type": "default",
        "animated": true
      },
      {
        "id": "edge-2",
        "source": "llm-node",
        "target": "end-node",
        "type": "default",
        "animated": true
      }
    ]
  }
}
```

---

## 💡 自定义和扩展

### 修改Prompt

编辑LLM节点的prompt来改变AI的行为：

```javascript
// 原始prompt
"你是一个友好的AI助手。请回答：{{userInput}}"

// 示例1: 专业翻译
"你是一个专业翻译。请将以下内容翻译成英文：{{userInput}}"

// 示例2: 代码生成器
"你是一个程序员。请为以下需求生成代码：{{userInput}}"

// 示例3: 文案写作
"你是一个文案专家。请为以下产品写广告语：{{userInput}}"
```

### 添加更多节点

你可以扩展这个工作流，添加更多节点：

1. **知识库节点**: 添加知识检索
2. **条件节点**: 根据条件分支
3. **循环节点**: 重复执行
4. **变量节点**: 存储中间结果
5. **HTTP请求节点**: 调用外部API

### 节点类型参考

- `start` - 开始节点
- `llm` - LLM/AI处理
- `end` - 结束节点
- `knowledge` - 知识库检索
- `code` - 代码执行
- `condition` - 条件判断
- `loop` - 循环控制
- `variable` - 变量操作
- `http` - HTTP请求

---

## 🔧 技术细节

### 数据库存储

工作流保存在PostgreSQL数据库的`workflow`表中：

```sql
SELECT id, name, "graphData", "createdAt", "updatedAt" 
FROM workflow 
WHERE id = '3a514ee1-f178-451e-8a7e-84d7de8fdfef';
```

### API端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/workflow` | 获取所有工作流 |
| GET | `/workflow/:id` | 获取单个工作流 |
| POST | `/workflow` | 创建新工作流 |
| PUT | `/workflow/:id` | 更新工作流 |
| DELETE | `/workflow/:id` | 删除工作流 |
| POST | `/workflow/:id/run` | 执行工作流 |

### 执行流程

1. **验证**: 验证图结构是否包含循环
2. **缓存**: 检查图结构缓存
3. **拓扑排序**: 确定节点执行顺序
4. **执行**: 按顺序执行每个节点
5. **重试**: 失败时自动重试（最多3次）
6. **超时**: 30秒执行超时保护

---

## 📖 相关文档

- **完整修复报告**: `COMPREHENSIVE_FIX_REPORT.md`
- **E2E测试报告**: `E2E_TEST_REPORT.md`
- **认证指南**: `backend/AUTH_GUIDE.md`
- **快速开始**: `QUICK_START.md`

---

## 🎓 学习示例

通过这个示例工作流，你可以学习：

1. ✅ **节点创建**: 如何创建和配置不同类型的节点
2. ✅ **节点连接**: 如何使用edges连接节点
3. ✅ **数据流**: 如何在节点之间传递数据
4. ✅ **LLM集成**: 如何配置和使用LLM节点
5. ✅ **变量使用**: 如何使用和引用变量
6. ✅ **工作流执行**: 如何执行和调试工作流

---

**创建时间**: 2026-02-08 16:42:15  
**创建方式**: API自动化创建  
**文件位置**: X:/day1/

---

🎉 **祝你使用愉快！如有问题，请参考相关文档或查看源代码。**
