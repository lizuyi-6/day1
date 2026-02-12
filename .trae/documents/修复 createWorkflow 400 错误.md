## 问题诊断

**错误原因**：前端发送的请求包含后端 DTO 未定义的 `status` 字段，导致 class-validator 验证失败（`forbidNonWhitelisted: true`）。

### 对比分析

**前端发送** (`workflowService.ts`):
```typescript
{
  name,
  description,
  graphData: { nodes: [], edges: [] },
  status: 'draft'  // ❌ 多余字段
}
```

**后端 DTO** (`create-workflow.dto.ts`):
```typescript
{
  name: string;
  description?: string;
  graphData?: {...};
  // ❌ 没有 status 字段
}
```

## 修复方案

采用 **方案 1**：移除前端多余的 `status` 字段。

### 修改文件

**文件**: `frontend/src/services/workflowService.ts`

```typescript
// 第 30-40 行，createWorkflow 函数
const response = await api.post('/workflow', {
  name,
  description,
  graphData: { nodes: [], edges: [] }
  // 删除: status: 'draft'
})
```

## 验证步骤

1. 保存修改后的代码
2. 刷新前端页面
3. 点击"新建工作流"按钮
4. 确认工作流创建成功，不再出现 400 错误