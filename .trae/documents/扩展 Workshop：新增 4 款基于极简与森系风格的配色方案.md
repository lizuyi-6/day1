# 扩展 Theme Workshop：新增极简与森系风格变体

很高兴您喜欢“Clean Slate (极简)”和“Forest Zen (森系)”风格！我将基于这两个方向，为您扩展更多变体，探索不同的色调和氛围。

## 1. 扩展思路

### 基于“Clean Slate (极简雅白)”的变体
这个系列的核心是**干净、高易读性、SaaS 专业感**。我将尝试引入不同的“品牌色”来改变氛围，保持背景的洁净。

*   **变体 C1: Nordic Blue (北欧蓝)**
    *   保留极简灰白背景，引入**冰蓝色**作为强调色。
    *   风格：冷静、理智、高效。
*   **变体 C2: Soft Purple (柔和紫)**
    *   极简背景，搭配**淡紫色**和**深紫灰**文字。
    *   风格：创意、优雅、现代。

### 基于“Forest Zen (自然森系)”的变体
这个系列的核心是**有机、放松、自然色调**。我将探索不同的自然景观配色。

*   **变体 D1: Matcha Latte (抹茶拿铁)**
    *   背景更偏向**暖绿/黄绿**，文字使用**深绿**而非棕色。
    *   风格：清新、年轻、活力。
*   **变体 D2: Sandstone (砂岩)**
    *   背景为**极淡的暖灰/沙色**，强调色为**赤陶色/砖红**。
    *   风格：温暖、质朴、坚实。

## 2. 实施计划

我将直接更新 `frontend/src/views/ThemeWorkshop.vue` 文件，在现有的 `themes` 数组中添加这 4 个新选项。

### 新增主题配置

1.  **Nordic Blue**
    *   Bg: `#F0F9FF` (Sky 50)
    *   Primary: `#0EA5E9` (Sky 500)
    *   Text: `#0C4A6E` (Sky 900)

2.  **Soft Purple**
    *   Bg: `#FAFAFA` (Zinc 50)
    *   Primary: `#8B5CF6` (Violet 500)
    *   Text: `#2E1065` (Violet 950)

3.  **Matcha Latte**
    *   Bg: `#F1F8E9` (Light Green 50)
    *   Primary: `#558B2F` (Light Green 800)
    *   Text: `#1B5E20` (Green 900)

4.  **Sandstone**
    *   Bg: `#F5F5F4` (Stone 100)
    *   Primary: `#D97706` (Amber 600)
    *   Text: `#44403C` (Stone 700)

## 3. 预期效果
更新后，Workshop 页面将展示 8 个主题选项（原 4 个 + 新增 4 个）。您可以继续点击切换，寻找最触动您的那一款。
