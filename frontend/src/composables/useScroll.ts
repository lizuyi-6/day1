export function useScroll() {
  const scrollToSection = (id: string, closeMenu?: () => void) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      closeMenu?.()
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    scrollToSection,
    scrollToTop
  }
}
