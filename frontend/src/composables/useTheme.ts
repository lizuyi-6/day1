import { ref, onMounted } from 'vue'

export interface Theme {
  id: string
  name: string
  colors: Record<string, string>
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
    name: 'Sandstone',
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
    name: 'Clean Slate',
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
    name: 'Forest Zen',
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
    name: 'Nordic Blue',
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
    name: 'Matcha Latte',
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

const currentThemeId = ref('sandstone') // Default to Sandstone

export function useTheme() {
  
  const applyTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId)
    if (!theme) return

    currentThemeId.value = themeId
    localStorage.setItem('user-theme', themeId)

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

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
    initTheme
  }
}
