export interface NavLink {
  label: string
  href: string
  sectionId: string
}

export const NAV_LINKS: NavLink[] = [
  { label: '功能', href: '#features', sectionId: 'features' },
  { label: '理念', href: '#manifesto', sectionId: 'manifesto' },
  { label: '数据', href: '#stats', sectionId: 'stats' },
  { label: '动态', href: '#footer', sectionId: 'footer' }
]

export const STATS_DATA = [
  { value: '10万+', label: '创作者' },
  { value: '40%', label: '效率提升' },
  { value: 'Top 1', label: '年度创新工具' }
] as const

export const FEATURES_DATA = [
  {
    icon: 'touch_app',
    title: '行云流水的交互体验',
    description: '每一次操作都精准回应，每一次连接都顺理成章。化繁为简，让工作成为艺术。'
  },
  {
    icon: 'hub',
    title: '洞悉需求的智能助手',
    description: '在你思考之前，已然为你准备好答案。预判需求，主动推荐，让工作流自然流淌。'
  },
  {
    icon: 'grid_view',
    title: '自我组织的智能画布',
    description: '自动整理布局，将混乱化为秩序。释放创意，让工具为思想服务。'
  }
] as const
