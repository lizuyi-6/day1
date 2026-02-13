<template>
  <div class="workshop-container">
    <!-- 顶部进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 左侧导航 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">答辩知识库</h2>
        <p class="sidebar-subtitle">Aether Flow</p>
      </div>

      <nav class="nav-menu">
        <div
          v-for="(section, index) in sections"
          :key="section.id"
          class="nav-section"
          :class="{ active: activeSection === section.id }"
        >
          <div
            class="nav-item"
            @click="scrollToSection(section.id)"
          >
            <span class="nav-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="nav-label">{{ section.title }}</span>
            <span class="nav-check" v-if="readSections.includes(section.id)">✓</span>
          </div>
          <div v-if="section.children" class="nav-children">
            <div
              v-for="child in section.children"
              :key="child.id"
              class="nav-child"
              :class="{ active: activeSection === child.id }"
              @click="scrollToSection(child.id)"
            >
              {{ child.title }}
            </div>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="progress-info">
          <span>已阅读 {{ readSections.length }}/{{ sections.length }} 章节</span>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content" ref="mainContent">
      <!-- 标题区域 -->
      <header class="page-header">
        <h1 class="page-title">Aether Flow 智能工作流平台</h1>
        <p class="page-subtitle">答辩知识库 - 基于 Vue 3 + NestJS + RAG 的 AI Agent 协同系统</p>
      </header>

      <!-- 第一章：系统架构 -->
      <section id="architecture" class="content-section">
        <div class="section-header">
          <span class="section-number">01</span>
          <h2 class="section-title">系统架构</h2>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 章节定义
const sections = [
  {
    id: 'architecture',
    title: '系统架构',
    children: [
      { id: 'arch-fullstack', title: '全栈架构' },
      { id: 'arch-modules', title: '核心模块' },
      { id: 'arch-dataflow', title: '数据流向' }
    ]
  }
]

// 当前活动章节
const activeSection = ref('architecture')

// 已阅读章节
const readSections = ref<string[]>(['architecture'])

// 主内容区域引用
const mainContent = ref<HTMLElement | null>(null)

// 计算进度百分比
const progressPercent = computed(() => {
  const totalSections = sections.reduce((sum, section) => {
    return sum + 1 + (section.children?.length || 0)
  }, 0)

  return Math.round((readSections.value.length / totalSections) * 100)
})

// 滚动到指定章节
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element && mainContent.value) {
    const offsetTop = element.offsetTop - 100
    mainContent.value.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    activeSection.value = sectionId
  }
}

// 监听滚动事件
const handleScroll = () => {
  if (!mainContent.value) return

  const scrollTop = mainContent.value.scrollTop + 150
  let currentSection = 'architecture'

  for (const section of sections) {
    const sectionElement = document.getElementById(section.id)
    if (sectionElement && sectionElement.offsetTop <= scrollTop) {
      currentSection = section.id
    }

    if (section.children) {
      for (const child of section.children) {
        const childElement = document.getElementById(child.id)
        if (childElement && childElement.offsetTop <= scrollTop) {
          currentSection = child.id
        }
      }
    }
  }

  activeSection.value = currentSection
}

// 页面滚动时更新已阅读章节
const updateReadSections = () => {
  if (!mainContent.value) return

  const scrollTop = mainContent.value.scrollTop + mainContent.value.clientHeight / 2

  for (const section of sections) {
    const sectionElement = document.getElementById(section.id)
    if (sectionElement && sectionElement.offsetTop <= scrollTop) {
      if (!readSections.value.includes(section.id)) {
        readSections.value.push(section.id)
      }
    }

    if (section.children) {
      for (const child of section.children) {
        const childElement = document.getElementById(child.id)
        if (childElement && childElement.offsetTop <= scrollTop) {
          if (!readSections.value.includes(child.id)) {
            readSections.value.push(child.id)
          }
        }
      }
    }
  }
}

// 监听滚动事件
onMounted(() => {
  if (mainContent.value) {
    mainContent.value.addEventListener('scroll', handleScroll)
    mainContent.value.addEventListener('scroll', updateReadSections)
  }
})

onUnmounted(() => {
  if (mainContent.value) {
    mainContent.value.removeEventListener('scroll', handleScroll)
    mainContent.value.removeEventListener('scroll', updateReadSections)
  }
})
</script>
