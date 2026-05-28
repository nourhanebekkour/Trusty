<template>
  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="ti ti-clipboard-check"></i> Éléments à valider</div>
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
      v-for="projet in projets"
      :key="projet.id"
      class="proj-item"
    >
      <div class="proj-icon" :class="projet.color">
        <i :class="'ti ti-' + projet.icon"></i>
      </div>
      <div class="proj-info">
        <div class="proj-name">{{ projet.nom }}</div>
        <div class="proj-meta">{{ projet.etudiant }} · {{ projet.context }} · {{ projet.date }}</div>
        <div class="proj-desc">{{ projet.description }}</div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: projet.progress + '%', background: projet.statusColor }"
          ></div>
        </div>
      </div>
      <div class="proj-right">
        <span class="status-pill" :class="'pill-' + projet.status">
          {{ projet.statusLabel }}
        </span>
        <button
          v-if="projet.status === 'pending'"
          class="btn-primary btn-sm"
          @click="emit('valider', projet)"
        >
          Valider
        </button>
        <button v-if="projet.status === 'valide'" class="btn-ghost btn-sm ok-border">
          Certifier
        </button>
        <button class="btn-ghost btn-sm">Détails</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  projets: { type: Array, default: () => [] },
})

const emit = defineEmits(['valider'])

const tabs      = ['Projets', 'Stages', 'Activités']
const activeTab = ref('Projets')
</script>