<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Paramètres
        </h1>
        <p>Gérez vos préférences et informations de compte.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement des paramètres...</span>
    </div>

    <div v-else class="settings-content">

      <div class="prof-info-card">
        <h3>Informations du compte</h3>
        <div class="detail-row">
          <span class="detail-label">Nom complet</span>
          <span class="detail-value">{{ profile.fullName || profile.email || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ profile.email || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Rôle</span>
          <span class="detail-value">Professionnel</span>
        </div>
      </div>

      <div class="prof-info-card">
        <h3>Préférences</h3>
        <div class="detail-row">
          <span class="detail-label">Thème</span>
          <div class="theme-toggle">
            <span class="theme-label">{{ theme.isDark ? 'Sombre' : 'Clair' }}</span>
            <button class="toggle-switch" :class="{ active: theme.isDark }" @click="theme.toggle()">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authstore'

const theme = useThemeStore()
const authStore = useAuthStore()
const loading = ref(true)
const profile = ref({})

onMounted(async () => {
  try {
    await authStore.fetchUser()
    profile.value = authStore.user || {}
  } catch {
    profile.value = {}
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.settings-content {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border, #D6D0C4);
  font-size: 13px;
}
.detail-row:last-child { border-bottom: none; }
.detail-label {
  color: var(--color-text-secondary, #6B7280);
  font-weight: 500;
}
.detail-value {
  color: var(--color-text-primary, #0F1B2D);
  font-weight: 600;
  text-align: right;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}
.theme-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #6B7280);
  min-width: 48px;
  text-align: right;
}

.toggle-switch {
  width: 42px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: var(--color-border, #D6D0C4);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  padding: 0;
}
.toggle-switch.active {
  background: var(--color-accent, #3D6B5E);
}
.toggle-knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}
.toggle-switch.active .toggle-knob {
  transform: translateX(18px);
}
</style>
