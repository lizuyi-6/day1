## 修复计划

### 1. 修复版本控制器 - 保存正确的数据

修改 `workflow.service.ts` 的 `update` 方法：
- 将 `workflow.graphData` 改为 `updateWorkflowDto.graphData`
- 确保版本保存的是更新后的数据

### 2. 实现真实的 LLM 节点

修改 `llm.node.ts`：
- 注入 `ModelService`
- 从节点数据中获取 `modelId`
- 调用 ModelService 获取模型配置
- 使用 axios 调用 LLM API（支持 OpenAI、Anthropic、自定义）
- 返回真实的 API 响应

### 3. 注册 ModelModule 到 WorkflowModule

修改 `workflow.module.ts`：
- 导入 `ModelModule`
- 在 `imports` 数组中添加 `ModelModule`
- 使 `LlmNode` 可以访问 `ModelService`

### 4. 更新 CreateWorkflowDto

修改 `create-workflow.dto.ts`：
- 确保 `comment` 字段正确导出

### 修改的文件列表

后端：
- `backend/src/workflow/workflow.service.ts` (修复版本保存逻辑)
- `backend/src/workflow/nodes/llm.node.ts` (实现真实 LLM 调用)
- `backend/src/workflow/workflow.module.ts` (导入 ModelModule)
