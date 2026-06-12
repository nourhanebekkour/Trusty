<template>
  <div class="consult-page">
    <div v-if="loading" class="consult-loading">
      <div class="spinner"></div>
      <span>Redirection vers le portfolio...</span>
    </div>
    <div v-else-if="error" class="consult-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  const studentId = route.params.id
  if (!studentId) {
    error.value = 'Identifiant étudiant introuvable.'
    loading.value = false
    return
  }
  try {
    const res = await api.get('/stages/')
    const stages = Array.isArray(res.data?.data ?? res.data) ? (res.data?.data ?? res.data) : []
    let found = false
    for (const stage of stages) {
      const e = stage.etudiant
      if (!e || String(e.id_etudiant) !== String(studentId)) continue
      const u = e.utilisateur || {}
      const prenom = (u.prenom || '').toLowerCase().replace(/[^a-z0-9]/g, '-')
      const nom = (u.nom || '').toLowerCase().replace(/[^a-z0-9]/g, '-')
      const slug = `${prenom}-${nom}-portfolio`
      router.replace(`/portfolio/${slug}`)
      found = true
      break
    }
    if (!found) {
      error.value = 'Étudiant non trouvé.'
      loading.value = false
    }
  } catch {
    error.value = 'Impossible de charger les informations.'
    loading.value = false
  }
})
</script>

<style scoped>
.consult-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-page-bg, #F5F3EE);
  font-family: 'Inter', sans-serif;
}
.consult-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-secondary, #6B7280);
  font-size: 0.9rem;
}
.consult-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-danger, #ef4444);
  font-size: 0.9rem;
}
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--color-border, #D6D0C4);
  border-top-color: var(--color-accent, #3D6B5E);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
