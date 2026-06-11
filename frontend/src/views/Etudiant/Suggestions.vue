<template>
  <div class="parcours-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          Suggestions d'Amélioration (IA)
        </h1>
        <p class="page-subtitle">Découvrez des recommandations sur-mesure pour enrichir votre profil.</p>
      </div>
      <button class="btn-primary" @click="genererSuggestion" :disabled="generating">
        <svg v-if="!generating" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        <div v-else class="spinner-small"></div>
        {{ generating ? 'Génération en cours...' : 'Générer une suggestion' }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="state-box">
      <span>Chargement des suggestions...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="state-box state-error">
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="fetchSuggestions">Réessayer</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="suggestions.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1m-1.636 5.636l-.707-.707M12 21v-1m-5.636-1.636l.707-.707M3 12h1m1.636-5.636l.707.707M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
      <p class="empty-title">Aucune suggestion pour le moment</p>
      <p class="empty-sub">Laissez l'IA analyser votre profil et vous guider.</p>
    </div>

    <!-- Grid -->
    <div v-else class="cards-grid">
      <div v-for="(sugg, i) in suggestions" :key="sugg.id_suggestion" class="formation-card" :style="{ animationDelay: i * 60 + 'ms' }" :class="{ 'unread': !sugg.est_lue }">
        <div class="card-topbar">
          <span class="card-type-badge">{{ sugg.type_suggestion }}</span>
          <span class="status-badge" :class="getPriorityClass(sugg.priorite)">
            {{ sugg.priorite }}
          </span>
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ sugg.titre }}</h3>
          <p class="card-etab" v-if="sugg.element_suggere"><strong>Cible:</strong> {{ sugg.element_suggere }}</p>
          <p class="card-desc">{{ sugg.description }}</p>
          <div class="justification-box">
            <strong>Pourquoi ?</strong> {{ sugg.justification_ia }}
          </div>
        </div>
        <div class="card-meta-row" style="display:flex; justify-content: space-between; align-items:center; padding-top: 10px; border-top: 1px solid var(--color-border, #eaeaea);">
          <span class="meta-date">{{ new Date(sugg.date_generation).toLocaleDateString('fr-FR') }}</span>
          <button v-if="!sugg.est_lue" class="btn-ghost btn-small" @click="marquerLue(sugg.id_suggestion)">Marquer comme lu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api.js'

const suggestions = ref([])
const loading = ref(true)
const generating = ref(false)
const error = ref(null)

const fetchSuggestions = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/suggestions')
    if (response.data.success) {
      suggestions.value = response.data.data
    } else {
      error.value = response.data.message
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

const genererSuggestion = async () => {
  if (generating.value) return
  generating.value = true
  error.value = null
  try {
    const response = await api.post('/suggestions/generer')
    if (response.data.success) {
      await fetchSuggestions()
    } else {
      error.value = response.data.message
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la génération'
  } finally {
    generating.value = false
  }
}

const marquerLue = async (id) => {
  try {
    const res = await api.patch(`/suggestions/${id}/lu`)
    if (res.data.success) {
      const s = suggestions.value.find(x => x.id_suggestion === id)
      if (s) s.est_lue = true
    }
  } catch (err) {
    console.error("Erreur lors du marquage", err)
  }
}

const getPriorityClass = (priorite) => {
  if (priorite === 'HAUTE') return 'status-active'
  return 'status-done'
}

onMounted(() => {
  fetchSuggestions()
})
</script>

<style scoped>
.parcours-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); }
.page-subtitle { color: var(--color-text-secondary); margin-top: 0.25rem; font-size: 0.95rem; }
.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: var(--color-accent, #4f46e5); color: white; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.formation-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
.formation-card.unread { border-left: 4px solid var(--color-accent, #4f46e5); }
.formation-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.card-topbar { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.card-type-badge { background: var(--color-surface-alt, rgba(0,0,0,0.05)); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; color: var(--color-text-primary); }
.status-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 12px; font-weight: 500; }
.status-active { background: rgba(239, 68, 68, 0.1); color: var(--color-danger, #ef4444); } 
.status-done { background: var(--color-surface-alt, #f3f4f6); color: var(--color-text-secondary, #4b5563); }
.card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text-primary); }
.card-etab { font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 1rem; }
.card-desc { font-size: 0.9rem; color: var(--color-text-primary); margin-bottom: 1rem; line-height: 1.5; }
.justification-box { background: var(--color-surface-alt, rgba(0,0,0,0.03)); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem; color: var(--color-text-primary); margin-bottom: 1rem; }
.meta-date { font-size: 0.85rem; color: var(--color-text-tertiary, #888); }
.spinner-small { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.state-box { text-align: center; padding: 3rem; color: var(--color-text-secondary); }
.empty-card { text-align: center; padding: 4rem 2rem; background: var(--color-surface); border-radius: 12px; border: 1px dashed var(--color-border); }
.empty-icon { color: var(--color-text-tertiary); margin-bottom: 1rem; }
.empty-title { font-weight: 600; font-size: 1.1rem; color: var(--color-text-primary); margin-bottom: 0.5rem; }
.empty-sub { color: var(--color-text-secondary); }
.btn-ghost { background: transparent; border: 1px solid var(--color-border); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: background 0.2s; color: var(--color-text-primary); }
.btn-ghost:hover { background: var(--color-surface-alt, rgba(0,0,0,0.05)); }
.btn-small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
</style>
