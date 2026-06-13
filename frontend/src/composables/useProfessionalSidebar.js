import { ref } from 'vue'

const isMobileOpen = ref(false)

export function useProfessionalSidebar() {
  function toggleMobile() {
    isMobileOpen.value = !isMobileOpen.value
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  return {
    isMobileOpen,
    toggleMobile,
    closeMobile,
  }
}
