# 解决工作流不显示和刷新无反应问题

我已分析前端代码，发现 `ChatView.vue` 和 `WorkflowListView.vue` 中的数据加载逻辑存在以下问题：

1. **`ChatView.vue` 加载逻辑缺陷**:
   - `loadAgents` 函数中使用原生 `fetch` 而非封装好的 `apiRequest` 或 `workflowService`。
   - 这导致请求**没有带上 `X-Browser-Id` 或 `Authorization` 头**，从而再次触发 401 认证错误（虽然之前修复了 `workflowService`，但这里没用到）。
   - 错误处理只是简单打印 console，导致 UI 上没有任何反馈。

2. **`WorkflowListView.vue` 潜在问题**:
   - 虽然使用了 `workflowService.getAllWorkflows`，但如果之前的 `X-Browser-Id` 修复没有正确应用到所有请求路径，或者后端返回的结构与前端预期不符（例如分页结构），也会导致列表为空。

## 修复计划

我将分两步彻底解决这个问题：

### 第一步：重构 `ChatView.vue` (关键修复)
- **替换 `fetch`**: 将所有原生 `fetch` 调用替换为 `workflowService` 中的方法，或者使用 `src/utils/api.ts` 中的 `get/post` 方法。这将自动带上认证头。
- **增强错误处理**: 当加载失败时，在界面上显示错误提示，而不是默默失败。
- **添加调试日志**: 在加载过程中添加 console log，方便在浏览器控制台确认数据是否返回。

### 第二步：验证与优化 `WorkflowListView.vue`
- **检查数据加载**: 确认 `loadWorkflows` 是否正确处理了分页响应结构。
- **添加刷新反馈**: 确保点击刷新按钮时有明显的加载状态。

## 验证方案
1. 修改代码后，无需重启容器（前端热重载）。
2. 打开 `/chat` 页面，检查左侧列表是否加载了工作流。
3. 打开 `/workflows` 页面，点击刷新，确认列表正常显示。
