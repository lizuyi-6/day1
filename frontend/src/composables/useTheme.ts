import { ref, onMounted, computed } from 'vue'

export interface Theme {
  id: string
  name: string
  colors: Record<string, string>
  isCustom?: boolean
}

// Generate theme colors from two colors
function generateCustomTheme(primaryColor: string, secondaryColor: string): Record<string, string> {
  return {
    '--bg-app': secondaryColor,
    '--bg-panel': '#ffffff',
    '--bg-hover': adjustColor(secondaryColor, -10),
    '--border-light': adjustColor(secondaryColor, -5),
    '--border-dim': secondaryColor,
    '--border-dark': primaryColor,
    '--text-main': '#1F2937',
    '--text-secondary': '#4B5563',
    '--text-tertiary': '#9CA3AF',
    '--color-primary': primaryColor,
    '--color-cycle-1': adjustColor(primaryColor, -40),
    '--color-cycle-2': adjustColor(primaryColor, -20),
    '--color-cycle-3': primaryColor,
    '--color-cycle-4': adjustColor(primaryColor, 20),
    '--color-cycle-5': adjustColor(primaryColor, 40),
  }
}

// Helper function to adjust color brightness
function adjustColor(hex: string, amount: number): string {
  const color = hex.replace('#', '')
  const num = parseInt(color, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Defined themes: 3, 4, 5, 7, 8 (mapped to IDs)
// 3: Clean Slate
// 4: Forest Zen
// 5: Nordic Blue
// 7: Matcha Latte
// 8: Sandstone (Default)
export const availableThemes: Theme[] = [
  {
    id: 'sandstone',
    name: '暖砂石韵',
    colors: {
      '--bg-app': '#F5F5F4', // Stone 100
      '--bg-panel': '#ffffff',
      '--bg-hover': '#E7E5E4', // Stone 200
      '--border-light': '#D6D3D1', // Stone 300
      '--border-dim': '#E7E5E4',
      '--border-dark': '#D97706', // Amber 600
      '--text-main': '#44403C', // Stone 700
      '--text-secondary': '#78716C', // Stone 500
      '--text-tertiary': '#A8A29E', // Stone 400
      '--color-primary': '#D97706', // Amber 600
      '--color-cycle-1': '#78350F', // Amber 900
      '--color-cycle-2': '#92400E', // Amber 800
      '--color-cycle-3': '#B45309', // Amber 700
      '--color-cycle-4': '#D97706', // Amber 600
      '--color-cycle-5': '#F59E0B', // Amber 500
    }
  },
  {
    id: 'clean-slate',
    name: '素灰雅致',
    colors: {
      '--bg-app': '#F8FAFC', // Slate 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#F1F5F9', // Slate 100
      '--border-light': '#E2E8F0', // Slate 200
      '--border-dim': '#F1F5F9',
      '--border-dark': '#0F172A', // Slate 900
      '--text-main': '#0F172A', // Slate 900
      '--text-secondary': '#475569', // Slate 600
      '--text-tertiary': '#94A3B8', // Slate 400
      '--color-primary': '#0F172A', // Slate 900
      '--color-cycle-1': '#0F172A',
      '--color-cycle-2': '#334155',
      '--color-cycle-3': '#475569',
      '--color-cycle-4': '#64748B',
      '--color-cycle-5': '#94A3B8',
    }
  },
  {
    id: 'forest-zen',
    name: '翠林幽禅',
    colors: {
      '--bg-app': '#E3F4EC', // Mint
      '--bg-panel': '#ffffff',
      '--bg-hover': '#D1E8E0',
      '--border-light': '#D1E8E0',
      '--border-dim': '#E3F4EC',
      '--border-dark': '#AC8659', // Earthy Brown
      '--text-main': '#181411', // Dark Charcoal
      '--text-secondary': '#5C5C5C',
      '--text-tertiary': '#AC8659', // Brown
      '--color-primary': '#AC8659',
      '--color-cycle-1': '#166534', // Green 700
      '--color-cycle-2': '#15803D', // Green 600
      '--color-cycle-3': '#84CC16', // Lime
      '--color-cycle-4': '#14B8A6', // Teal
      '--color-cycle-5': '#A7F3D0', // Emerald 200
    }
  },
  {
    id: 'nordic-blue',
    name: '冰岛蔚蓝',
    colors: {
      '--bg-app': '#F0F9FF', // Sky 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#E0F2FE', // Sky 100
      '--border-light': '#BAE6FD', // Sky 200
      '--border-dim': '#E0F2FE',
      '--border-dark': '#0EA5E9', // Sky 500
      '--text-main': '#0C4A6E', // Sky 900
      '--text-secondary': '#0369A1', // Sky 700
      '--text-tertiary': '#38BDF8', // Sky 400
      '--color-primary': '#0EA5E9', // Sky 500
      '--color-cycle-1': '#0C4A6E',
      '--color-cycle-2': '#0369A1',
      '--color-cycle-3': '#0284C7',
      '--color-cycle-4': '#0EA5E9',
      '--color-cycle-5': '#38BDF8',
    }
  },
  {
    id: 'matcha-latte',
    name: '抹茶温韵',
    colors: {
      '--bg-app': '#F1F8E9', // Light Green 50
      '--bg-panel': '#ffffff',
      '--bg-hover': '#DCEDC8', // Light Green 100
      '--border-light': '#C5E1A5', // Light Green 200
      '--border-dim': '#DCEDC8',
      '--border-dark': '#558B2F', // Light Green 800
      '--text-main': '#1B5E20', // Green 900
      '--text-secondary': '#33691E', // Light Green 900
      '--text-tertiary': '#689F38', // Light Green 700
      '--color-primary': '#558B2F', // Light Green 800
      '--color-cycle-1': '#1B5E20',
      '--color-cycle-2': '#33691E',
      '--color-cycle-3': '#558B2F',
      '--color-cycle-4': '#689F38',
      '--color-cycle-5': '#9CCC65',
    }
  }
]

// Custom theme state
const customThemeColors = ref<{ primary: string; secondary: string } | null>(null)
const currentThemeId = ref('sandstone') // Default to Sandstone

// Initialize custom theme colors from localStorage
if (typeof window !== 'undefined') {
  const savedCustomColors = localStorage.getItem('custom-theme-colors')
  if (savedCustomColors) {
    try {
      customThemeColors.value = JSON.parse(savedCustomColors)
    } catch (e) {
      console.error('Failed to parse custom theme colors:', e)
    }
  }
}

export function useTheme() {

  const applyTheme = (themeId: string) => {
    // Check if it's a custom theme
    if (themeId === 'custom') {
      const savedCustomTheme = localStorage.getItem('custom-theme-colors')
      if (savedCustomTheme) {
        const colors = JSON.parse(savedCustomTheme)
        customThemeColors.value = colors

        currentThemeId.value = 'custom'
        localStorage.setItem('user-theme', 'custom')

        const themeColors = generateCustomTheme(colors.primary, colors.secondary)
        const root = document.documentElement
        Object.entries(themeColors).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })
      }
      return
    }

    const theme = availableThemes.find(t => t.id === themeId)
    if (!theme) return

    currentThemeId.value = themeId
    localStorage.setItem('user-theme', themeId)

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  const saveCustomTheme = (primaryColor: string, secondaryColor: string) => {
    const colors = { primary: primaryColor, secondary: secondaryColor }
    localStorage.setItem('custom-theme-colors', JSON.stringify(colors))
    customThemeColors.value = colors
    applyTheme('custom')
  }

  const getCustomTheme = computed(() => {
    if (!customThemeColors.value) {
      const saved = localStorage.getItem('custom-theme-colors')
      if (saved) {
        customThemeColors.value = JSON.parse(saved)
      } else {
        // Default custom colors
        customThemeColors.value = {
          primary: '#6366F1',
          secondary: '#F3F4F6'
        }
      }
    }

    if (customThemeColors.value) {
      return {
        id: 'custom',
        name: '专属定制',
        colors: generateCustomTheme(customThemeColors.value.primary, customThemeColors.value.secondary),
        isCustom: true
      }
    }
    return null
  })

  const initTheme = () => {
    const savedThemeId = localStorage.getItem('user-theme')
    if (savedThemeId) {
      applyTheme(savedThemeId)
    } else {
      applyTheme('sandstone') // Ensure default is applied
    }
  }

  return {
    currentThemeId,
    availableThemes,
    applyTheme,
    initTheme,
    saveCustomTheme,
    getCustomTheme,
    customThemeColors
  }
}
