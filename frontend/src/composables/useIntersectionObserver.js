import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(options = {}) {
  const el = ref(null)
  const isVisible = ref(false)

  const { threshold = 0.15, once = true } = options

  let observer = null

  onMounted(() => {
    if (!el.value) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          if (once) observer.unobserve(entry.target)
        } else if (!once) {
          isVisible.value = false
        }
      },
      { threshold }
    )
    observer.observe(el.value)
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return { el, isVisible }
}

export function useStaggeredObserver(count, options = {}) {
  const items = Array.from({ length: count }, () => {
    const el = ref(null)
    const isVisible = ref(false)
    return { el, isVisible }
  })

  const { threshold = 0.1 } = options

  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = items.find(i => i.el.value === entry.target)
          if (item && entry.isIntersecting) {
            item.isVisible.value = true
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )
    items.forEach(item => {
      if (item.el.value) observer.observe(item.el.value)
    })
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return items
}
