<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-message-star"></i> Éléments à recommander</div>
      <div class="tab-row">
        <div
          v-for="tab in VALID_TABS"
          :key="tab"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="setActiveTab(tab)"
        >{{ tab }}</div>
      </div>
    </div>

    <div
      v-for="candidat in safeCandidats"
      :key="candidat.id"
      class="proj-item"
      :class="{ 'selected-row': selectedId === candidat.id }"
      @click="emit('select', candidat)"
    >
      <div class="proj-icon" :class="candidat.color">
        <i :class="'ti ti-' + safeIcon(candidat.icon)"></i>
      </div>
      <div class="proj-info">
        <div class="proj-name">{{ candidat.nom }}</div>
        <div class="proj-meta">{{ candidat.formation }} · {{ candidat.ecole }} · {{ candidat.ville }}</div>
        <div class="proj-desc">{{ candidat.description }}</div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: safeScore(candidat.score) + '%', background: candidat.score >= 80 ? '#66c99f' : '#f4b94b' }"
          ></div>
        </div>
      </div>
      <div class="proj-right">
        <span class="status-pill" :class="aRecommande(candidat.id) ? 'pill-valide' : 'pill-pending'">
          {{ aRecommande(candidat.id) ? 'Recommandé' : 'En attente' }}
        </span>
        <button
          v-if="!aRecommande(candidat.id)"
          class="btn-primary btn-sm"
          @click.stop="emit('ouvrir-formulaire', candidat)"
        >
          Recommander
        </button>
        <button
          v-else
          class="btn-ghost btn-sm ok-border"
          @click.stop="emit('ouvrir-formulaire', candidat)"
        >
          <i class="ti ti-plus" style="font-size:10px;"></i> Ajouter
        </button>
        <button class="btn-ghost btn-sm" @click.stop="emit('select', candidat)">Détails</button>
        <button
          class="btn-ghost btn-sm"
          :class="{ 'ok-border': estFavori(candidat.id) }"
          @click.stop="store.toggleFavori(candidat.id)"
        >
          <i :class="estFavori(candidat.id) ? 'ti ti-bookmark-filled' : 'ti ti-bookmark'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfessionalStore } from '@/stores/professionalStore'

const props = defineProps({
  candidats:  { type: Array,  default: () => [] },
  selectedId: { type: Number, default: null },
  recsEmises: { type: Array,  default: () => [] },
})

const emit  = defineEmits(['select', 'ouvrir-formulaire'])
const store = useProfessionalStore()

// ── Tabs ──────────────────────────────────────────────────────────────────────

// Liste blanche des onglets autorisés — empêche l'injection d'une valeur arbitraire
const VALID_TABS = ['Portfolios', 'Stages', 'Activités']
const activeTab  = ref('Portfolios')

function setActiveTab(tab) {
  if (VALID_TABS.includes(tab)) activeTab.value = tab
}

// ── Données filtrées ──────────────────────────────────────────────────────────

/**
 * On ne propage jamais le tableau brut : on vérifie que chaque élément
 * est bien un objet avec un id numérique positif.
 */
const safeCandidats = computed(() => {
  if (!Array.isArray(props.candidats)) return []
  return props.candidats.filter(
    (c) =>
      c &&
      typeof c === 'object' &&
      Number.isInteger(c.id) &&
      c.id > 0
  )
})

// ── Helpers de rendu ──────────────────────────────────────────────────────────

/**
 * N'autorise que des noms d'icônes composés de lettres, chiffres et tirets.
 * Empêche l'injection de classes CSS arbitraires via la prop `icon`.
 */
const ICON_RE = /^[a-z0-9-]+$/i
function safeIcon(icon) {
  return typeof icon === 'string' && ICON_RE.test(icon) ? icon : 'user'
}

/**
 * Borne le score entre 0 et 100 pour que width ne dépasse pas 100 %.
 */
function safeScore(score) {
  const n = Number(score)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

// ── Logique métier ──────────────────

function aRecommande(id) {
  if (!Array.isArray(props.recsEmises)) return false
  return props.recsEmises.some((r) => r?.candidatId === id)
}

function estFavori(id) {
  if (!Array.isArray(store.favoris)) return false
  return store.favoris.includes(id)
}
</script>