import { ref, onMounted, onUnmounted } from 'vue'

export function useMouseParallax(smoothFactor = 0.06) {
  const mouseX = ref(0)
  const mouseY = ref(0)
  const targetX = ref(0)
  const targetY = ref(0)
  let rafId = null

  function handleMouseMove(e) {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    targetX.value = (e.clientX - cx) / cx
    targetY.value = (e.clientY - cy) / cy
  }

  function handleMouseLeave() {
    targetX.value = 0
    targetY.value = 0
  }

  function animate() {
    mouseX.value += (targetX.value - mouseX.value) * smoothFactor
    mouseY.value += (targetY.value - mouseY.value) * smoothFactor
    rafId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    rafId = requestAnimationFrame(animate)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseleave', handleMouseLeave)
    if (rafId) cancelAnimationFrame(rafId)
  })

  return { mouseX, mouseY }
}
