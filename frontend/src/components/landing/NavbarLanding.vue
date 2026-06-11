<template>
  <nav class="navbar-landing" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-logo">
        <svg class="navbar-shield" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" stroke="currentColor" opacity="0.5" />
        </svg>
        <span class="navbar-brand">TRUSTY</span>
      </router-link>

      <div class="navbar-links" :class="{ open: mobileOpen }">
        <a href="#hero" class="nav-link" @click="closeMobile">Accueil</a>
        <a href="#features" class="nav-link" @click="closeMobile">Fonctionnalités</a>
        <a href="#spaces" class="nav-link" @click="closeMobile">Espaces</a>
        <a href="#contact" class="nav-link" @click="closeMobile">Contact</a>
        <div class="nav-actions">
          <button class="btn-theme" @click="toggle" :title="landingMode === 'dark' ? 'Mode clair' : 'Mode sombre'" type="button">
            <svg v-if="landingMode === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <button class="btn-nav-outline" @click="$router.push('/login')">Se connecter</button>
          <button class="btn-nav-gradient" @click="$router.push('/register')">Commencer</button>
        </div>
      </div>

      <div class="navbar-mobile-actions">
        <button class="btn-theme" @click="toggle" :title="landingMode === 'dark' ? 'Mode clair' : 'Mode sombre'" type="button">
          <svg v-if="landingMode === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button class="hamburger" :class="{ active: mobileOpen }" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLandingTheme } from '@/composables/useLandingTheme'

const { landingMode, toggle } = useLandingTheme()

const isScrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 60
}

function closeMobile() {
  mobileOpen.value = false
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.navbar-landing {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 0;
  background: var(--landing-nav-bg);
  transition: background 0.4s ease, padding 0.4s ease, backdrop-filter 0.4s ease;
}

.navbar-landing.scrolled {
  background: var(--landing-nav-scrolled);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  padding: 10px 0;
  border-bottom: 1px solid var(--landing-nav-border);
}

.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--landing-text);
}

.navbar-shield {
  filter: drop-shadow(0 0 6px var(--landing-glow-strong));
}

.navbar-brand {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: var(--landing-text-secondary);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--landing-text);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 16px;
}

.btn-theme {
  background: var(--landing-surface);
  border: 1px solid var(--landing-border);
  color: var(--landing-text-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.btn-theme:hover {
  background: var(--landing-surface-hover);
  color: var(--landing-text);
  border-color: var(--landing-border-hover);
}

.btn-nav-outline {
  background: transparent;
  border: 1px solid var(--landing-border);
  color: var(--landing-text);
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-nav-outline:hover {
  background: var(--landing-surface-hover);
  border-color: var(--landing-border-hover);
}

.btn-nav-gradient {
  border: none;
  background: var(--landing-gradient-btn);
  color: white;
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--landing-glow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-nav-gradient:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--landing-glow-strong);
}

.navbar-mobile-actions {
  display: none;
  align-items: center;
  gap: 8px;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--landing-text);
  border-radius: 2px;
  transition: transform 0.3s, opacity 0.3s;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .navbar-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    flex-direction: column;
    align-items: flex-start;
    padding: 80px 32px 32px;
    background: var(--landing-nav-scrolled);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-left: 1px solid var(--landing-nav-border);
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    gap: 24px;
  }

  .navbar-links.open {
    right: 0;
  }

  .nav-actions {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    margin-top: 16px;
  }

  .btn-nav-outline,
  .btn-nav-gradient {
    width: 100%;
    text-align: center;
  }

  .navbar-mobile-actions {
    display: flex;
  }

  .hamburger {
    display: flex;
  }
}
</style>
