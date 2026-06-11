import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function init() {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') enable()
    else disable()
  }

  function enable() {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  }

  function disable() {
    isDark.value = false
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
  }

  function toggle() {
    isDark.value ? disable() : enable()
  }

  return { isDark, init, toggle }
})
