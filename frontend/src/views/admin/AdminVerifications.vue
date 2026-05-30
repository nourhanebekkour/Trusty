<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1 class="admin-page__title">Verifications</h1>
        <p class="admin-page__subtitle">
          Validation des activites parascolaires et des comptes professionnels avec les endpoints backend existants.
        </p>
      </div>
      <button class="admin-btn admin-btn--secondary" type="button" @click="admin.fetchVerificationQueue">
        <RefreshCw :size="16" />
        Actualiser
      </button>
    </header>

    <section class="admin-stats">
      <article class="admin-stat admin-stat--accent">
        <span class="admin-stat__label">Total en attente</span>
        <strong class="admin-stat__value">{{ admin.verificationQueue.length }}</strong>
        <span class="admin-stat__sub">Activites + professionnels</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Activites</span>
        <strong class="admin-stat__value">{{ typeCount('ACTIVITE') }}</strong>
        <span class="admin-stat__sub">Modele ActiviteParascolaire</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Professionnels</span>
        <strong class="admin-stat__value">{{ typeCount('PROFESSIONNEL') }}</strong>
        <span class="admin-stat__sub">Modele Professionnel</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Sources API</span>
        <strong class="admin-stat__value">2</strong>
        <span class="admin-stat__sub">Aucune nouvelle route backend</span>
      </article>
    </section>

    <div v-if="admin.error" class="admin-error">{{ admin.error }}</div>
    <div v-if="actionError" class="admin-error">{{ actionError }}</div>

    <article class="admin-card">
      <div class="admin-card__header">
        <div>
          <h2 class="admin-card__title">File prioritaire</h2>
          <p class="admin-card__subtitle">Chaque action appelle le endpoint correspondant selon le type de demande.</p>
        </div>
        <div class="admin-actions">
          <select v-model="typeFilter" class="admin-select">
            <option value="">Tous les types</option>
            <option>ACTIVITE</option>
            <option>PROFESSIONNEL</option>
          </select>
          <input v-model="search" class="admin-input" type="search" placeholder="Rechercher" />
        </div>
      </div>

      <div v-if="admin.loading" class="admin-state">Chargement...</div>
      <div v-else-if="filteredItems.length === 0" class="admin-state">Aucune verification en attente.</div>
      <div v-else class="admin-stack">
        <article v-for="item in filteredItems" :key="item.id" class="admin-card" style="box-shadow:none;">
          <div class="admin-card__header">
            <div class="admin-user-cell">
              <span class="admin-avatar">{{ initials(item.studentName) }}</span>
              <div>
                <h3 class="admin-card__title">{{ item.studentName }}</h3>
                <p class="admin-card__subtitle">{{ item.title }}</p>
              </div>
            </div>
            <span :class="['admin-badge', item.type === 'ACTIVITE' ? 'admin-badge--warning' : 'admin-badge--success']">
              {{ item.type }}
            </span>
          </div>

          <p class="admin-page__subtitle" style="margin-bottom: 12px;">{{ item.description }}</p>

          <div class="admin-form-grid">
            <div class="admin-field">
              <label>Identifiant Prisma</label>
              <input class="admin-input" :value="item.id" readonly />
            </div>
            <div class="admin-field">
              <label>Date de soumission</label>
              <input class="admin-input" :value="formatDate(item.createdAt)" readonly />
            </div>
          </div>

          <div class="admin-field" style="margin-top: 12px;">
            <label>Commentaire de decision</label>
            <textarea v-model="notes[item.id]" class="admin-textarea" placeholder="Optionnel pour les activites; ignore par l'API professionnel actuelle."></textarea>
          </div>

          <div class="admin-actions" style="margin-top: 14px;">
            <button class="admin-btn" type="button" :disabled="actionLoadingId === item.id" @click="validate(item, 'VALIDE')">
              <Check :size="16" />
              Valider
            </button>
            <button class="admin-btn admin-btn--danger" type="button" :disabled="actionLoadingId === item.id" @click="validate(item, 'REJETE')">
              <X :size="16" />
              Rejeter
            </button>
          </div>
        </article>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check, RefreshCw, X } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const admin = useAdminStore()
const search = ref('')
const typeFilter = ref('')
const notes = ref({})
const actionError = ref(null)
const actionLoadingId = ref(null)

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  return admin.verificationQueue.filter(item => {
    const matchesType = !typeFilter.value || item.type === typeFilter.value
    const haystack = `${item.studentName} ${item.title} ${item.description} ${item.id}`.toLowerCase()
    const matchesSearch = !query || haystack.includes(query)
    return matchesType && matchesSearch
  })
})

function typeCount(type) {
  return admin.verificationQueue.filter(item => item.type === type).length
}

async function validate(item, decision) {
  actionError.value = null
  actionLoadingId.value = item.id
  const result = await admin.validateVerification(item, decision, notes.value[item.id] || '')
  actionLoadingId.value = null
  if (!result.success) actionError.value = result.message
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(admin.fetchVerificationQueue)
</script>
