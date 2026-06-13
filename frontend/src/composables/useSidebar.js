import { ref } from 'vue'

const isMobileOpen = ref(false)
const isCollapsed = ref(false)

export function useSidebar() {
  function toggleMobile() {
    isMobileOpen.value = !isMobileOpen.value
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    isMobileOpen,
    isCollapsed,
    toggleMobile,
    closeMobile,
    toggleCollapsed,
  }
}
