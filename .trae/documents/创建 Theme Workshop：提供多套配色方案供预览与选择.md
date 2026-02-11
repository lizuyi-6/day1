# 创建主题设计 Workshop

为了帮助您找到最满意的配色方案，我将为您搭建一个专门的 **Theme Workshop**（主题工坊）页面。这个页面将展示几个精心设计的配色方案，并允许您一键切换预览。

## 1. 核心改造：颜色系统动态化
目前颜色在 `tailwind.config.js` 中是硬编码的 hex 值。为了实现动态切换，我将重构颜色配置，使其引用 CSS 变量。

*   **修改 `tailwind.config.js`**:
    *   `colors.primary` -> `var(--color-primary)`
    *   `colors.background-light` -> `var(--bg-app)`
    *   `colors.charcoal` -> `var(--text-main)`
    *   ...以及其他关键颜色。

*   **修改 `base.css`**:
    *   确保所有 CSS 变量（`--color-primary`, `--bg-app` 等）都有默认值（使用当前的米色方案）。

## 2. 设计 4 款精选主题
我将为您准备以下 4 种风格迥异的方案供选择：

1.  **方案 A：复古米色 (Vintage Cream)** - *当前方案*
    *   背景: `#DED7CD` (暖米色)
    *   文字/强调: `#1660AB` (深海蓝)
    *   风格: 温暖、怀旧、纸质感

2.  **方案 B：深空极客 (Deep Space)**
    *   背景: `#0F172A` (深蓝灰)
    *   文字/强调: `#38BDF8` (天蓝色)
    *   风格: 现代、科技、专注、高对比度

3.  **方案 C：极简雅白 (Clean Slate)**
    *   背景: `#F8FAFC` (极浅灰白)
    *   文字/强调: `#334155` (深灰) + `#6366F1` (靛蓝)
    *   风格: 干净、专业、SaaS 标准风格

4.  **方案 D：自然森系 (Forest Zen)**
    *   背景: `#E3F4EC` (淡薄荷绿)
    *   文字/强调: `#AC8659` (木棕色)
    *   风格: 清新、放松、有机

## 3. 开发 Workshop 页面
*   **新建页面**: `frontend/src/views/ThemeWorkshop.vue`
*   **功能**:
    *   顶部展示 4 个主题卡片，点击即可切换全局 CSS 变量。
    *   下方展示关键 UI 组件预览（按钮、卡片、文字排版、输入框），让您直观看到配色在实际界面中的效果。
*   **路由**: 添加 `/workshop` 路径。

## 4. 实施步骤
1.  **重构 Tailwind 配置**: 将颜色值替换为 CSS 变量引用。
2.  **创建 Workshop 页面**: 编写 Vue 组件和样式切换逻辑。
3.  **注册路由**: 在 `router/index.ts` 中添加入口。
4.  **验证**: 访问 `/workshop` 并测试切换效果。

完成后，您只需访问 `/workshop` 即可亲自体验并选择最喜欢的一款。
