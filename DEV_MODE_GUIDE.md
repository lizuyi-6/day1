# 开发模式使用指南

本文档介绍如何使用 Aether Flow 的开发模式功能进行调试和错误追踪。

## 目录

- [概述](#概述)
- [后端开发模式](#后端开发模式)
- [前端开发模式](#前端开发模式)
- [常见问题](#常见问题)

---

## 概述

开发模式提供了一套完整的调试工具，帮助您快速定位和解决错误：

- **详细的错误日志**：包含堆栈跟踪、代码位置、请求上下文
- **请求/响应追踪**：记录所有 API 请求和响应的详细信息
- **可视化调试面板**：在前端实时查看错误和网络请求
- **智能错误提示**：自动分析错误并提供解决建议

---

## 后端开发模式

### 启用开发模式

后端开发模式通过环境变量 `NODE_ENV` 控制：

```bash
# 在 backend/.env 文件中设置
NODE_ENV=development
```

### 功能特性

#### 1. 增强的错误响应

在开发模式下，API 错误响应包含额外的调试信息：

```json
{
  "statusCode": 500,
  "timestamp": "2025-01-08T10:30:00.000Z",
  "path": "/api/workflow/123/run",
  "method": "POST",
  "requestId": "1lk2j3k4-abc123def",
  "message": "Workflow execution failed",
  "debug": {
    "type": "Error",
    "stack": "Error: Workflow execution failed\n    at WorkflowService.execute...",
    "codeLocation": {
      "file": "backend/src/workflow/workflow.service.ts",
      "line": "145",
      "column": "13"
    },
    "request": {
      "headers": { "content-type": "application/json", ... },
      "query": {},
      "body": { "input": "test" },
      "params": { "id": "123" }
    },
    "system": {
      "nodeVersion": "v20.10.0",
      "platform": "win32",
      "env": "development"
    }
  }
}
```

#### 2. 控制台日志

开发模式下，后端控制台会显示详细的请求/响应日志：

```
[HTTP] → [1lk2j3k4] POST /api/workflow/123/run
  Query: {}
  Body: {
    "input": "test"
  }
  Headers: {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0...",
    "authorization": "***"
  }

[HTTP] ← [1lk2j3k4] POST /api/workflow/123/run 200 45ms ✅
```

#### 3. 错误堆栈跟踪

当发生错误时，自动记录完整的堆栈跟踪：

```
[Error] Unhandled exception occurred {
  "requestId": "1lk2j3k4-abc123def",
  "error": {
    "name": "ValidationError",
    "message": "Invalid workflow configuration",
    "stack": "ValidationError: Invalid workflow configuration\n    at ..."
  },
  "request": { ... }
}
```

### 关闭详细日志

在生产环境中，设置 `NODE_ENV=production` 以关闭详细日志：

```bash
NODE_ENV=production
```

生产环境下：
- 不返回堆栈跟踪
- 不返回详细的错误信息
- 只记录基本的请求日志

---

## 前端开发模式

### 启用开发模式

前端开发模式通过构建工具自动检测：

```bash
# 开发模式（自动启用）
npm run dev

# 生产构建（开发模式关闭）
npm run build
```

### 开发面板

点击右下角的 🔧 按钮打开开发面板。

#### 功能按钮

- **🔧**：打开/关闭开发面板
- **🗑️ 清除**：清除所有日志
- **📥 导出**：导出日志为 JSON 文件
- **✕**：关闭面板

#### 错误日志标签页

显示所有捕获的错误信息：

- **时间戳**：错误发生的时间
- **错误类型**：❌ 错误 / ⚠️ 警告 / ℹ️ 信息
- **错误消息**：简短的错误描述
- **详细信息**（点击展开）：
  - 上下文信息（URL、方法、状态码）
  - 堆栈跟踪
  - 代码位置（文件、行号、列号）

#### 网络请求标签页

显示所有 HTTP 请求的详细信息：

- **方法**：GET / POST / PUT / DELETE（带颜色标识）
- **URL**：请求地址
- **状态码**：响应状态（绿色成功，红色失败）
- **耗时**：请求持续时间（毫秒）
- **详细信息**（点击展开）：
  - 请求头和请求体
  - 响应头和响应体
  - 错误信息（如果失败）

### 错误自动捕获

前端会自动捕获以下类型的错误：

1. **API 请求错误**
   - HTTP 错误（4xx, 5xx）
   - 网络超时
   - 连接失败

2. **JavaScript 错误**
   - 运行时错误
   - 未处理的异常
   - Promise 拒绝

3. **组件错误**
   - Vue 组件渲染错误
   - 生命周期钩子错误

### 导出日志

点击"导出"按钮可以将所有日志导出为 JSON 文件：

```json
{
  "exportTime": "2025-01-08T10:30:00.000Z",
  "errorLogs": [...],
  "networkRequests": [...]
}
```

---

## 使用示例

### 示例 1：调试 API 错误

**场景**：工作流执行失败

**步骤**：

1. 打开前端开发面板
2. 切换到"网络请求"标签
3. 找到失败的 POST 请求（红色状态码）
4. 点击展开查看详情
5. 查看"响应"中的错误消息和堆栈跟踪
6. 复制错误信息（📋 复制按钮）
7. 在后端代码中定位问题（使用文件名和行号）

### 示例 2：追踪前端错误

**场景**：页面渲染时出现错误

**步骤**：

1. 打开前端开发面板
2. 切换到"错误日志"标签
3. 查看最新的错误记录
4. 展开查看完整的堆栈跟踪
5. 点击"代码位置"中的文件链接
6. 在 IDE 中打开对应的文件和行号

### 示例 3：性能优化

**场景**：API 响应时间过长

**步骤**：

1. 打开前端开发面板
2. 切换到"网络请求"标签
3. 查看所有请求的耗时（毫秒）
4. 找到耗时最长的请求
5. 检查请求体是否过大
6. 在后端添加优化（缓存、索引等）

---

## 最佳实践

### 1. 开发时保持开发模式开启

- 设置 `NODE_ENV=development`
- 使用 `npm run dev` 启动前端
- 保持开发面板打开以便及时发现问题

### 2. 定期检查错误日志

- 每天开始开发前检查之前的错误
- 修复错误后清除日志
- 导出日志作为问题追踪记录

### 3. 生产环境注意事项

- **务必设置** `NODE_ENV=production`
- 不要在生产环境暴露详细错误信息
- 使用日志聚合工具（如 Sentry、DataDog）
- 定期审查生产日志

### 4. 错误处理建议

**后端**：
```typescript
// 使用业务异常而非通用错误
throw new BadRequestException('Invalid workflow ID')

// 记录足够的上下文信息
this.logger.error({
  message: 'Workflow execution failed',
  workflowId,
  nodeId,
  error: exception.message,
})

// 提供有用的错误消息
throw new HttpException(
  'Workflow validation failed: missing start node',
  HttpStatus.BAD_REQUEST
)
```

**前端**：
```typescript
// 捕获 API 错误并显示友好消息
try {
  await workflowService.executeWorkflow(id, inputs)
} catch (error) {
  // 开发模式下会自动记录到面板
  console.error('Workflow execution failed:', error)
  // 显示用户友好的错误消息
  alert('工作流执行失败，请稍后重试')
}
```

---

## 常见问题

### Q: 为什么开发面板不显示？

A: 确保：
- 前端运行在开发模式（`npm run dev`）
- 不是生产构建（`npm run build`）
- DevModePanel 组件已在 App.vue 中导入

### Q: 后端错误响应中没有 debug 字段？

A: 检查：
- `NODE_ENV=development` 已设置
- .env 文件在正确位置（backend/.env）
- 重启后端服务器

### Q: 前端捕获不到 API 错误？

A: 可能原因：
- API 请求被 CORS 阻止
- 使用了其他 HTTP 库（非 fetch）
- 拦截器未正确初始化

### Q: 日志太多，如何过滤？

A:
- 使用"清除"按钮清空日志
- 只关注最新的错误（按时间排序）
- 导出日志后在文本编辑器中搜索

### Q: 生产环境如何查看错误？

A:
- 使用后端日志文件
- 集成错误追踪服务（Sentry、DataDog）
- 查看数据库中的错误记录

---

## 技术实现

### 后端组件

- **AllExceptionsFilter**：全局异常过滤器（`backend/src/common/filters/all-exceptions.filter.ts`）
- **LoggingMiddleware**：请求/响应日志中间件（`backend/src/common/middleware/logging.middleware.ts`）
- **ConfigService**：配置服务（读取 NODE_ENV）

### 前端组件

- **DevModePanel**：开发模式面板组件（`frontend/src/components/dev/DevModePanel.vue`）
- **useDevMode**：开发模式 composable（`frontend/src/composables/useDevMode.ts`）
- **apiInterceptor**：API 拦截器（`frontend/src/utils/apiInterceptor.ts`）

---

## 更新日志

### v1.0.0 (2025-01-08)

- ✅ 初始版本
- ✅ 后端异常过滤器增强
- ✅ 后端日志中间件
- ✅ 前端开发面板
- ✅ API 拦截器
- ✅ 全局错误处理

---

## 支持

如有问题或建议，请：
- 查看项目文档
- 提交 Issue
- 联系开发团队

**祝您开发顺利！** 🚀
