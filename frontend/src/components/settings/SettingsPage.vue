<template>
  <div class="settings-page">

    <div v-if="loading" class="settings-state">
      <div class="spinner"></div>
      <span>Chargement des paramètres...</span>
    </div>

    <div v-else class="settings-body">
      <section class="settings-card">
        <h2 class="settings-card__title">Informations du compte</h2>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Nom</span>
            <span class="info-value">{{ user.nom || 'Non renseigné' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Prénom</span>
            <span class="info-value">{{ user.prenom || 'Non renseigné' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">{{ user.email || 'Non renseigné' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rôle</span>
            <span class="info-value">{{ roleLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Établissement</span>
            <span class="info-value">{{ user.ecole || 'Non renseigné' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Téléphone</span>
            <span class="info-value">{{ user.telephone || 'Non renseigné' }}</span>
          </div>
        </div>
      </section>

      <section class="settings-card">
        <h2 class="settings-card__title">Préférences d'affichage</h2>
        <div class="info-row">
          <span class="info-label">Thème</span>
          <div class="theme-toggle">
            <span class="theme-label">{{ theme.isDark ? 'Sombre' : 'Clair' }}</span>
            <button class="toggle-switch" :class="{ active: theme.isDark }" @click="theme.toggle()" type="button">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
      </section>

      <section class="settings-card">
        <h2 class="settings-card__title">Aide</h2>
        <p class="settings-help-text">
          Pour toute difficulté avec votre compte ou l'utilisation de la plateforme, contactez l'administration ou le support.
        </p>
      </section>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import { useThemeStore } from '@/stores/themeStore'

const auth = useAuthStore()
const theme = useThemeStore()

const loading = ref(true)
const user = computed(() => auth.user || {})

const roleLabel = computed(() => {
  const labels = {
    ETUDIANT: 'Étudiant',
    PROFESSEUR: 'Professeur',
    ADMINISTRATEUR: 'Administrateur',
    PROFESSIONNEL: 'Professionnel',
  }
  return labels[user.value.role] || user.value.role || 'Non renseigné'
})

onMounted(async () => {
  try {
    await auth.fetchUser()
  } catch {
    // user stays as-is
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.settings-page {
  max-width: 640px;
}

.settings-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  color: var(--color-text-secondary, #6B7280);
  font-size: 0.875rem;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid var(--color-border, #D6D0C4);
  border-top-color: var(--color-accent, #3D6B5E);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-card {
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 12px;
  padding: 20px 22px;
}

.settings-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary, #0F1B2D);
  margin: 0 0 14px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border, #D6D0C4);
  font-size: 0.84rem;
  gap: 12px;
}
.info-row:last-child { border-bottom: none; }

.info-label {
  color: var(--color-text-secondary, #6B7280);
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  color: var(--color-text-primary, #0F1B2D);
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}
.theme-label {
  font-size: 0.78rem;
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

.settings-help-text {
  font-size: 0.84rem;
  color: var(--color-text-secondary, #6B7280);
  line-height: 1.6;
  margin: 0;
  padding: 4px 0;
}
</style>
