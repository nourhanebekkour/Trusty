import { ref, onMounted } from 'vue'

const landingMode = ref('dark')

export function useLandingTheme() {
  function setMode(mode) {
    landingMode.value = mode
    document.documentElement.setAttribute('data-landing-mode', mode)
    localStorage.setItem('landing-mode', mode)
  }

  function toggle() {
    setMode(landingMode.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const saved = localStorage.getItem('landing-mode')
    if (saved === 'light' || saved === 'dark') {
      setMode(saved)
    } else {
      setMode('dark')
    }
  })

  return { landingMode, toggle, setMode }
}
