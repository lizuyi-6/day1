<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  Plus,
  Trash2,
  Play,
  Edit,
  Clock,
  SortAsc,
  SortDesc,
  MoreVertical,
  FolderOpen,
  CheckSquare,
  Square,
  X,
} from 'lucide-vue-next';
import Logo from '@/components/layout/Logo.vue';
import { workflowService } from '@/services/workflowService';
import { useScrollAnimations } from '@/composables/useScrollAnimations';
import InputDialog from '@/components/common/InputDialog.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import type { DeploymentConfig } from '@/services/workflowService';

const router = useRouter();

// Initialize scroll animations
useScrollAnimations();

onMounted(() => {
  document.body.classList.add('page-loaded');
  loadWorkflows();
});

interface Workflow {
  id: string;
  name: string;
  description?: string;
  graphData: { nodes: any[]; edges: any[] };
  createdAt: string;
  updatedAt: string;
}

const workflows = ref<Workflow[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const sortField = ref<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
const sortDirection = ref<'asc' | 'desc'>('desc');
const deploying = ref<string | null>(null);

// Multi-select mode
const isSelectionMode = ref(false);
const selectedWorkflows = ref<Set<string>>(new Set());

// Dialog states
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const workflowToDelete = ref<{ id: string; name: string } | null>(null);
const showBatchDeleteDialog = ref(false);

const navLinks = [
  { name: '仪表盘', path: '/dashboard', icon: FolderOpen },
  { name: '工作流', path: '/workflows', icon: null },
  { name: '对话', path: '/chat', icon: null },
  { name: '知识库', path: '/knowledge', icon: null },
];

// Load all workflows
const loadWorkflows = async () => {
  loading.value = true;
  error.value = null;
  console.log('🔄 Loading workflows...');

  try {
    const result = await workflowService.getAllWorkflows();
    console.log('📥 Load workflows result:', result);

    if (result.success && result.workflows) {
      workflows.value = result.workflows;
      console.log('✅ Workflows loaded:', workflows.value.length);
    } else {
      error.value = result.error || '加载工作流失败';
      console.error('❌ Failed to load workflows:', error.value);
    }
  } catch (e) {
    console.error('❌ Exception loading workflows:', e);
    error.value = '加载工作流时发生错误';
  } finally {
    loading.value = false;
  }
};

// Create new workflow
const createWorkflow = async (name: string) => {
  if (!name || !name.trim()) return;

  loading.value = true;

  try {
    const result = await workflowService.createWorkflow(name.trim());

    if (result.success && result.workflow) {
      // Navigate to workflow editor with the new workflow ID
      // But also pass a flag to show example if it's empty
      router.push({ 
        path: `/workflow/${result.workflow.id}`,
        query: { new: 'true' }
      });
    } else {
      error.value = result.error || '创建工作流失败';
      loading.value = false;
    }
  } catch (e) {
    console.error(e);
    error.value = '创建工作流时发生错误';
    loading.value = false;
  }
};

// Delete workflow
const deleteWorkflow = async () => {
  if (!workflowToDelete.value) return;

  const { id, name } = workflowToDelete.value;
  loading.value = true;

  try {
    const result = await workflowService.deleteWorkflow(id);

    if (result.success) {
      // Remove from local list
      workflows.value = workflows.value.filter((w) => w.id !== id);
    } else {
      error.value = result.error || '删除工作流失败';
    }
  } catch (e) {
    console.error(e);
    error.value = '删除工作流时发生错误';
  } finally {
    loading.value = false;
    workflowToDelete.value = null;
  }
};

// Deploy workflow
const deployWorkflow = async (workflow: Workflow) => {
  const config: DeploymentConfig = {
    environment: 'production',
    version: '1.0.0',
    apiEnabled: true,
    webhooks: [],
  };

  deploying.value = workflow.id;

  try {
    console.log('🚀 开始部署工作流:', workflow.id, workflow.name)
    const result = await workflowService.deployWorkflow(workflow.id, config);

    if (result.success) {
      alert(`工作流 "${workflow.name}" 部署成功!\n访问地址: ${result.url}`);
      console.log('✅ 部署成功:', result.url)
    } else {
      alert(`部署失败: ${result.error}`);
      console.error('❌ 部署失败:', result.error)
    }
  } catch (e) {
    console.error(e);
    alert('部署时发生错误');
  } finally {
    deploying.value = null;
  }
};

// Sort workflows
const sortedWorkflows = computed(() => {
  const sorted = [...workflows.value];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (sortField.value === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField.value === 'createdAt') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField.value === 'updatedAt') {
      comparison =
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }

    return sortDirection.value === 'asc' ? comparison : -comparison;
  });

  return sorted;
});

const toggleSort = (field: 'name' | 'createdAt' | 'updatedAt') => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'desc';
  }
};

const openWorkflow = (id: string) => {
  router.push(`/workflow/${id}`);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 1000 * 60) {
    return '刚刚';
  }

  const days = Math.floor(diff / (1000 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`;
    }
    return `${hours} 小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
};

// Toggle selection mode
const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value;
  selectedWorkflows.value.clear();
};

// Exit selection mode
const exitSelectionMode = () => {
  isSelectionMode.value = false;
  selectedWorkflows.value.clear();
};

// Toggle workflow selection
const toggleWorkflowSelection = (id: string) => {
  if (selectedWorkflows.value.has(id)) {
    selectedWorkflows.value.delete(id);
  } else {
    selectedWorkflows.value.add(id);
  }
};

// Select all workflows
const selectAll = () => {
  if (!workflows.value || workflows.value.length === 0) return;

  if (selectedWorkflows.value.size === workflows.value.length) {
    selectedWorkflows.value.clear();
  } else {
    workflows.value.forEach(w => selectedWorkflows.value.add(w.id));
  }
};

// Batch delete workflows
const batchDeleteWorkflows = async () => {
  if (selectedWorkflows.value.size === 0) return;

  loading.value = true;

  try {
    const deletePromises = Array.from(selectedWorkflows.value).map(id =>
      workflowService.deleteWorkflow(id)
    );

    const results = await Promise.all(deletePromises);
    const failedIds = results
      .filter(r => !r.success)
      .map((r, i) => Array.from(selectedWorkflows.value)[i]);

    if (failedIds.length === 0) {
      if (workflows.value) {
        workflows.value = workflows.value.filter(w => !selectedWorkflows.value.has(w.id));
      }
      selectedWorkflows.value.clear();
      isSelectionMode.value = false;
    } else {
      error.value = `删除 ${failedIds.length} 个工作流失败`;
    }
  } catch (e) {
    console.error(e);
    error.value = '批量删除工作流时发生错误';
  } finally {
    loading.value = false;
    showBatchDeleteDialog.value = false;
  }
};
</script>

<template>
  <div
    class="flex flex-col h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-sand font-sans overflow-hidden"
  >
    <!-- Internal App Header -->
    <header
      class="h-16 px-6 border-b border-sand/30 dark:border-white/10 bg-white/80 dark:bg-[#1e1711]/80 backdrop-blur-md flex items-center justify-between z-20 shrink-0"
    >
      <div class="flex items-center gap-12">
        <Logo class="scale-90 origin-left" />
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            :class="
              $route.path === link.path
                ? 'text-primary font-bold'
                : 'text-charcoal/60 dark:text-sand/60 hover:text-charcoal dark:hover:text-sand'
            "
          >
            <component :is="link.icon" :size="16" v-if="link.icon" />
            {{ link.name }}
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <button
          @click="showCreateDialog = true"
          class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          :disabled="loading"
        >
          <Plus :size="16" />
          <span class="text-sm font-medium">新建工作流</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6 lg:p-10">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-charcoal dark:text-white mb-2">
                工作流列表
              </h1>
              <p class="text-sm text-khaki">
            管理和部署您的工作流
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="loadWorkflows"
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2a241e] border border-sand/30 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-sand/20 dark:hover:bg-white/5 transition-all"
            :disabled="loading"
          >
            <Clock :size="16" :class="{ 'animate-spin': loading }" />
            <span>{{ loading ? '刷新中...' : '刷新' }}</span>
          </button>
          <button
            v-if="!isSelectionMode"
            @click="toggleSelectionMode"
                class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2a241e] border border-sand/30 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-sand/20 dark:hover:bg-white/5 transition-all"
              >
                <Square :size="16" />
                <span>多选</span>
              </button>
              <button
                v-if="isSelectionMode"
                @click="exitSelectionMode"
                class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X :size="16" />
                <span>退出多选</span>
              </button>
              <button
                v-if="isSelectionMode && selectedWorkflows.size > 0"
                @click="showBatchDeleteDialog = true"
                class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
              >
                <Trash2 :size="16" />
                <span>删除 ({{ selectedWorkflows.size }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400"
        >
          {{ error }}
        </div>

        <!-- Loading State -->
        <div v-if="loading && workflows.length === 0" class="flex items-center justify-center py-20">
          <div class="flex items-center gap-3 text-khaki">
            <div class="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>加载中...</span>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!loading && workflows.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            class="size-20 rounded-full bg-sand/30 dark:bg-white/10 flex items-center justify-center mb-4"
          >
            <FolderOpen :size="40" class="text-khaki/50" />
          </div>
          <h3 class="text-lg font-semibold text-charcoal dark:text-white mb-2">
            还没有工作流
          </h3>
          <p class="text-sm text-khaki mb-6">
            创建您的第一个工作流开始使用
          </p>
          <button
            @click="showCreateDialog = true"
            class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus :size="18" />
            <span class="font-medium">创建工作流</span>
          </button>
        </div>

        <!-- Workflow List -->
        <div v-else class="space-y-4">
          <!-- Selection Controls -->
          <div v-if="isSelectionMode" class="flex items-center gap-4 mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <button
              @click="selectAll"
              class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2a241e] border border-sand/30 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-sand/20 dark:hover:bg-white/5 transition-all"
            >
              <CheckSquare :size="16" />
              <span>{{ selectedWorkflows.size === (workflows.value?.length || 0) ? '取消全选' : '全选' }}</span>
            </button>
            <span class="text-sm text-slate-600 dark:text-slate-400">
              已选择 {{ selectedWorkflows.size }} / {{ workflows.value?.length || 0 }} 个工作流
            </span>
          </div>

          <!-- Sort Controls -->
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xs font-bold text-khaki uppercase tracking-wider"
              >排序:</span
            >
            <button
              @click="toggleSort('name')"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
              :class="
                sortField === 'name'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-sand/20 dark:hover:bg-white/5 text-charcoal/60 dark:text-sand/60'
              "
            >
              名称
              <SortAsc
                v-if="sortField === 'name' && sortDirection === 'asc'"
                :size="14"
              />
              <SortDesc
                v-if="sortField === 'name' && sortDirection === 'desc'"
                :size="14"
              />
            </button>
            <button
              @click="toggleSort('updatedAt')"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
              :class="
                sortField === 'updatedAt'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-sand/20 dark:hover:bg-white/5 text-charcoal/60 dark:text-sand/60'
              "
            >
              更新时间
              <SortAsc
                v-if="sortField === 'updatedAt' && sortDirection === 'asc'"
                :size="14"
              />
              <SortDesc
                v-if="sortField === 'updatedAt' && sortDirection === 'desc'"
                :size="14"
              />
            </button>
            <button
              @click="toggleSort('createdAt')"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
              :class="
                sortField === 'createdAt'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-sand/20 dark:hover:bg-white/5 text-charcoal/60 dark:text-sand/60'
              "
            >
              创建时间
              <SortAsc
                v-if="sortField === 'createdAt' && sortDirection === 'asc'"
                :size="14"
              />
              <SortDesc
                v-if="sortField === 'createdAt' && sortDirection === 'desc'"
                :size="14"
              />
            </button>
          </div>

          <!-- Workflow Cards -->
          <div
            v-for="workflow in sortedWorkflows"
            :key="workflow.id"
            class="group bg-white dark:bg-[#2a241e] border border-sand/30 dark:border-white/10 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
            :class="[
              isSelectionMode ? 'cursor-pointer' : 'hover:border-primary/30',
              selectedWorkflows.has(workflow.id) ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : ''
            ]"
            @click="isSelectionMode ? toggleWorkflowSelection(workflow.id) : openWorkflow(workflow.id)"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Left: Workflow Info -->
              <div class="flex items-start gap-4 flex-1 min-w-0">
                <!-- Checkbox for selection mode -->
                <div
                  v-if="isSelectionMode"
                  @click.stop
                >
                  <button
                    @click="toggleWorkflowSelection(workflow.id)"
                    class="p-2 rounded-lg hover:bg-sand/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <CheckSquare
                      v-if="selectedWorkflows.has(workflow.id)"
                      :size="20"
                      class="text-indigo-600"
                    />
                    <Square
                      v-else
                      :size="20"
                      class="text-slate-400"
                    />
                  </button>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3
                      class="text-lg font-semibold text-charcoal dark:text-white truncate group-hover:text-primary transition-colors"
                    >
                      {{ workflow.name }}
                    </h3>
                  </div>
                  <p
                    v-if="workflow.description"
                    class="text-sm text-charcoal/60 dark:text-sand/60 mb-3 line-clamp-2"
                  >
                    {{ workflow.description }}
                  </p>
                  <div class="flex items-center gap-4 text-xs text-khaki">
                    <div class="flex items-center gap-1.5">
                      <Clock :size="12" />
                      <span>更新于 {{ formatTime(workflow.updatedAt) }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <MoreVertical :size="12" />
                      <span
                        >{{ workflow.graphData?.nodes?.length || 0 }} 个节点</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Actions -->
              <div
                v-if="!isSelectionMode"
                class="flex items-center gap-2 shrink-0"
                @click.stop
              >
                <button
                  @click="openWorkflow(workflow.id)"
                  class="p-2 rounded-lg hover:bg-sand/20 dark:hover:bg-white/5 text-charcoal/60 dark:text-sand/60 hover:text-primary transition-colors"
                  title="编辑"
                >
                  <Edit :size="18" />
                </button>
                <button
                  @click="deployWorkflow(workflow)"
                  :disabled="deploying === workflow.id"
                  class="p-2 rounded-lg hover:bg-sand/20 dark:hover:bg-white/5 text-charcoal/60 dark:text-sand/60 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="部署"
                >
                  <Play
                    :size="18"
                    :class="
                      deploying === workflow.id
                        ? 'animate-spin'
                        : ''
                    "
                  />
                </button>
                <button
                  @click="workflowToDelete = { id: workflow.id, name: workflow.name }; showDeleteDialog = true"
                  :disabled="loading"
                  class="p-2 rounded-lg hover:bg-sand/20 dark:hover:bg-white/5 text-charcoal/60 dark:text-sand/60 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="删除"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Workflow Dialog -->
    <InputDialog
      v-model="showCreateDialog"
      title="创建工作流"
      message="请输入新工作流的名称"
      placeholder="工作流名称"
      :default-value="'新工作流'"
      @confirm="createWorkflow"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="删除工作流"
      type="danger"
      :message="workflowToDelete ? `确定要删除工作流 &quot;${workflowToDelete.name}&quot; 吗？此操作无法撤销。` : ''"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="deleteWorkflow"
      @cancel="workflowToDelete = null"
    />

    <!-- Batch Delete Confirmation Dialog -->
    <ConfirmDialog
      v-model="showBatchDeleteDialog"
      title="批量删除工作流"
      type="danger"
      :message="`确定要删除选中的 ${selectedWorkflows.size} 个工作流吗？此操作无法撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="batchDeleteWorkflows"
      @cancel="showBatchDeleteDialog = false"
    />
  </div>
</template>
