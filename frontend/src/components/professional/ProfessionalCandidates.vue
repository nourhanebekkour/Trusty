<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-message-star"></i> Éléments à recommander</div>
      <div class="tab-row">
        <div
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >{{ tab }}</div>
      </div>
    </div>

    <div
      v-for="candidat in candidats"
      :key="candidat.id"
      class="proj-item"
      :class="{ 'selected-row': selectedId === candidat.id }"
      @click="emit('select', candidat)"
    >
      <div class="proj-icon" :class="candidat.color">
        <i :class="'ti ti-' + candidat.icon"></i>
      </div>
      <div class="proj-info">
        <div class="proj-name">{{ candidat.nom }}</div>
        <div class="proj-meta">{{ candidat.formation }} · {{ candidat.ecole }} · {{ candidat.ville }}</div>
        <div class="proj-desc">{{ candidat.description }}</div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: candidat.score + '%', background: candidat.score >= 80 ? '#66c99f' : '#f4b94b' }"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  candidats:   { type: Array,  default: () => [] },
  selectedId:  { type: Number, default: null },
  recsEmises:  { type: Array,  default: () => [] },
})

const emit = defineEmits(['select', 'ouvrir-formulaire'])

const tabs      = ['Portfolios', 'Stages', 'Activités']
const activeTab = ref('Portfolios')

function aRecommande(id) {
  return props.recsEmises.some(r => r.candidatId === id)
}
</script>