# 实现用户自定义主题切换功能

您希望保留方案 3 (Clean Slate), 4 (Forest Zen), 5 (Nordic Blue), 7 (Matcha Latte), 8 (Sandstone) 供用户选择，并默认使用方案 8 (Sandstone)。

我将把 Workshop 中的主题切换功能正式集成到应用的主界面中，使用户可以在全局范围内自由切换主题，并持久化保存选择。

## 1. 核心任务：状态管理与持久化
*   **创建 `useTheme` Composable**:
    *   管理当前主题状态 (`currentTheme`)。
    *   在应用启动时从 `localStorage` 读取主题，如果不存在则默认加载 **Sandstone**。
    *   提供 `setTheme` 方法，切换主题时自动更新 CSS 变量并保存到 `localStorage`。
    *   包含选定的 5 个主题配置数据。

## 2. 界面集成
*   **创建 `ThemeSwitcher` 组件**:
    *   设计一个精简的下拉菜单或浮动面板，放置在全局导航栏（Header）或侧边栏底部。
    *   展示选定的 5 个主题选项。
*   **集成到 `App.vue`**:
    *   在应用挂载时调用 `useTheme` 初始化主题，确保默认加载 Sandstone。
    *   引入 `ThemeSwitcher` 组件，方便用户随时切换。

## 3. 清理与配置更新
*   **更新 `base.css`**: 将默认的 CSS 变量值修改为 **Sandstone** 的配色，确保无 JS 环境下的首屏渲染一致。
*   **移除临时页面**: 删除 `ThemeWorkshop.vue` 及其路由（如果不再需要），或者保留作为高级调试页。

## 4. 实施步骤
1.  **创建 `frontend/src/composables/useTheme.ts`**: 封装主题逻辑与数据。
2.  **创建 `frontend/src/components/ThemeSwitcher.vue`**: UI 组件。
3.  **修改 `frontend/src/App.vue`**: 引入 `ThemeSwitcher` 并初始化主题。
4.  **更新 `frontend/src/assets/base.css`**: 设置 Sandstone 为默认 CSS 变量。

这样，您的应用将拥有正式的多主题支持，且默认风格为您指定的 Sandstone。
