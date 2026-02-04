import { onMounted, onUnmounted } from 'vue'

export function useScrollAnimations() {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          // 可选：动画完成后停止观察
          // observer?.unobserve(entry.target)
        }
      })
    }, observerOptions)

    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-from-left, .animate-from-right, .animate-scale-in')

    animatedElements.forEach((el) => {
      observer.observe(el)
    })

    // 立即触发一次检查,处理已在视口中的元素
    // 使用 setTimeout 确保 DOM 完全渲染
    setTimeout(() => {
      animatedElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0
        if (isVisible) {
          el.classList.add('animate-in')
        }
      })
    }, 100)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    observer
  }
}
