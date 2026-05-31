<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title">Elements a recommander</div>
      <div class="tab-row">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-state">
      Chargement des candidats...
    </div>

    <div v-else-if="candidats.length === 0" class="empty-state">
      Aucun candidat disponible avec les endpoints actuels.
    </div>

    <template v-else>
      <div
        v-for="candidat in candidats"
        :key="candidat.id"
        class="proj-item"
        :class="{ 'selected-row': selectedId === candidat.id }"
        @click="emit('select', candidat)"
      >
        <div class="proj-icon" :class="candidat.color">
          {{ candidat.initiales }}
        </div>

        <div class="proj-info">
          <div class="proj-name">{{ candidat.nom }}</div>
          <div class="proj-meta">
            {{ candidat.formation }} - {{ candidat.ecole }}<span v-if="candidat.ville"> - {{ candidat.ville }}</span>
          </div>
          <div class="proj-desc">{{ candidat.description }}</div>
          <div v-if="candidat.sources?.length" class="source-row">
            <span v-for="source in candidat.sources" :key="source" class="source-chip">{{ source }}</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: candidat.score + '%', background: candidat.score >= 80 ? '#5C8C6A' : '#A87832' }"
            ></div>
          </div>
        </div>

        <div class="proj-right">
          <span class="status-pill" :class="aRecommande(candidat.id) ? 'pill-valide' : 'pill-pending'">
            {{ aRecommande(candidat.id) ? 'Recommande' : 'Disponible' }}
          </span>
          <button
            v-if="!aRecommande(candidat.id)"
            class="btn-primary btn-sm"
            type="button"
            @click.stop="emit('ouvrir-formulaire', candidat)"
          >
            Recommander
          </button>
          <button
            v-else
            class="btn-ghost btn-sm ok-border"
            type="button"
            @click.stop="emit('ouvrir-formulaire', candidat)"
          >
            Ajouter
          </button>
          <button class="btn-ghost btn-sm" type="button" @click.stop="emit('select', candidat)">Details</button>
          <button
            class="btn-ghost btn-sm"
            type="button"
            :class="{ 'ok-border': estFavori(candidat.id) }"
            title="Favori local non synchronise backend"
            @click.stop="store.toggleFavori(candidat.id)"
          >
            {{ estFavori(candidat.id) ? 'Suivi' : 'Suivre' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProfessionalStore } from '@/stores/professionalStore'

const props = defineProps({
  candidats: { type: Array, default: () => [] },
  selectedId: { type: [Number, String], default: null },
  recsEmises: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'ouvrir-formulaire'])
const store = useProfessionalStore()

const tabs = ['Portfolios', 'Stages', 'Projets']
const activeTab = ref('Portfolios')

function aRecommande(id) {
  return props.recsEmises.some(r => r.candidatId === id)
}

function estFavori(id) {
  return store.favoris.includes(id)
}
</script>
