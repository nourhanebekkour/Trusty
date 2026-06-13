<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Mon Profil
        </h1>
        <p>Informations de votre compte professionnel.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement du profil...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ sanitizeText(error) }}</span>
      <button class="btn-ghost" @click="loadProfile">Réessayer</button>
    </div>

    <div v-else class="profile-content">
      <div class="profile-card">
        <div class="profile-avatar">
          {{ initials(profile.fullName || profile.email) }}
        </div>
        <div class="profile-info">
          <h2>{{ sanitizeText(profile.fullName) || 'Utilisateur' }}</h2>
          <p class="profile-email">{{ sanitizeText(profile.email) }}</p>
          <span class="profile-role">Professionnel</span>
        </div>
      </div>

      <div class="profile-details">
        <div class="prof-info-card">
          <h3>Informations générales</h3>
          <div class="detail-row">
            <span class="detail-label">Nom complet</span>
            <span class="detail-value">{{ sanitizeText(profile.fullName) || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ sanitizeText(profile.email) || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Téléphone</span>
            <span class="detail-value">{{ sanitizeText(profile.telephone || profile.phone) || '—' }}</span>
          </div>
        </div>

        <div class="prof-info-card" style="margin-top: 14px;">
          <h3>Entreprise</h3>
          <div class="detail-row">
            <span class="detail-label">Entreprise</span>
            <span class="detail-value">{{ sanitizeText(profile.entreprise || profile.company) || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Poste</span>
            <span class="detail-value">{{ sanitizeText(profile.poste || profile.position) || '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getProfessionalProfile } from '@/services/professionalApi'

const loading = ref(true)
const error   = ref(null)
const profile = ref({})

function sanitizeText(value) {
  if (!value) return ''
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 300)
}

function initials(name) {
  return String(name || '?')
    .replace(/<[^>]*>/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()
}

async function loadProfile() {
  if (loading.value && Object.keys(profile.value).length > 0) return
  loading.value = true
  error.value   = null
  try {
    const data = await getProfessionalProfile()
    profile.value = data && typeof data === 'object' ? data : {}
  } catch {
    error.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-content {
  max-width: 640px;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 18px;
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-panel, 0 8px 32px rgba(0,0,0,0.08));
  margin-bottom: 18px;
}
.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-accent-light, #E8F2EF);
  color: var(--color-accent, #3D6B5E);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}
.profile-info h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary, #0F1B2D);
}
.profile-email {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #6B7280);
}
.profile-role {
  display: inline-block;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--color-accent-light, #E8F2EF);
  color: var(--color-accent, #3D6B5E);
}
.detail-row {
  display: flex;
  justify-content: space-between;
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
</style>