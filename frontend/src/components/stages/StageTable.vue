<template>
  <div class="section">

    <!-- Section header -->
    <div class="section-header">
      <span class="section-title">Liste des expériences</span>
      <div class="section-actions">
        <button class="btn-sm" @click="store.showFilter = !store.showFilter">⊟ Filtrer</button>
      </div>
    </div>

    <!-- Filter bar -->
    <div v-if="store.showFilter" class="filter-bar">
      <select v-model="store.filterStatut" class="filter-select">
        <option value="">Tous les statuts</option>
        <option value="VALIDE">Validé</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="REJETE">Rejeté</option>
      </select>
      <input
        v-model="store.filterSearch"
        class="filter-input"
        placeholder="Rechercher une entreprise..."
      />
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <span>Chargement des stages...</span>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-state">
      <span>⚠ {{ store.error }}</span>
      <button class="btn-sm" @click="store.chargerStages">Réessayer</button>
    </div>

    <!-- Cards -->
    <div v-else class="cards-grid">
      <div
        v-for="stage in store.stagesPagines"
        :key="stage.id_stage"
        class="stage-card"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="card-header-left">
            <div class="card-logo" :style="{ background: logoColor(stage.entreprise) }">
              {{ initiales(stage.entreprise) }}
            </div>
            <div class="card-header-info">
              <div class="card-company">{{ stage.entreprise }}</div>
              <div class="card-poste">{{ stage.poste }}</div>
            </div>
          </div>
          <span class="badge" :class="badgeClass(stage.status_validation)">
            <span class="badge-dot"></span>
            {{ labelStatut(stage.status_validation) }}
          </span>
        </div>

        <div class="card-separator"></div>

        <!-- Card Body -->
        <div class="card-body">

          <!-- Dates & Durée -->
          <div class="card-row">
            <span class="card-icon">📅</span>
            <span class="card-label">Du</span>
            <span class="card-value">{{ formatDate(stage.date_debut) }}</span>
            <span class="card-label">au</span>
            <span class="card-value">{{ stage.date_fin ? formatDate(stage.date_fin) : '—' }}</span>
            <span v-if="stage.duree_semaines" class="card-duree">{{ stage.duree_semaines }} sem.</span>
          </div>

          <!-- Adresse -->
          <div v-if="stage.adresse_entreprise" class="card-row">
            <span class="card-icon">📍</span>
            <span class="card-value">{{ stage.adresse_entreprise }}</span>
          </div>

          <!-- Encadrants -->
          <div class="card-encadrants">
            <div class="card-row">
              <span class="card-icon">👤</span>
              <span class="card-label">Professionnel :</span>
              <span class="card-value">{{ stage.encadrant_professionnel || '—' }}</span>
            </div>
            <div class="card-row">
              <span class="card-icon">👤</span>
              <span class="card-label">Académique :</span>
              <span class="card-value">{{ stage.encadrant_academique || '—' }}</span>
            </div>
          </div>

          <!-- Missions expandable -->
          <div class="card-missions">
            <div class="card-row card-missions-header">
              <span class="card-icon">📋</span>
              <span class="card-label">Missions</span>
              <button
                v-if="stage.missions && stage.missions.length > 120"
                class="card-expand-btn"
                @click="toggleMissions(stage.id_stage)"
              >
                {{ expandedMissions.has(stage.id_stage) ? 'Réduire ▲' : 'Développer ▼' }}
              </button>
            </div>
            <p class="card-missions-text">
              {{ expandedMissions.has(stage.id_stage) || !stage.missions || stage.missions.length <= 120
                ? stage.missions || '—'
                : stage.missions.slice(0, 120) + '…'
              }}
            </p>
          </div>

          <!-- Technologies -->
          <div v-if="getTechnologies(stage).length" class="card-techs">
            <div class="card-row">
              <span class="card-icon">🛠️</span>
              <span class="card-label">Technologies</span>
            </div>
            <div class="card-tech-tags">
              <span
                v-for="tech in getTechnologies(stage)"
                :key="tech.id_technologie"
                class="tech-tag"
              >
                <span class="tech-emoji">{{ techEmoji(tech) }}</span>
                <span class="tech-name">{{ tech.nom }}</span>
                <span v-if="tech.version" class="tech-version">v{{ tech.version }}</span>
                <span class="tech-level" :class="techNiveauClass(tech.niveau_utilisation)">
                  {{ techNiveauLabel(tech.niveau_utilisation) }}
                </span>
              </span>
            </div>
          </div>

        </div>

        <!-- Card Footer -->
        <div class="card-footer">
          <div class="action-group">
            <button class="action-btn action-btn--voir" @click="$emit('voir', stage)">
              👁 Voir
            </button>
            <button class="action-btn action-btn--edit" @click="$emit('edit', stage)">
              ✎ Modifier
            </button>
          </div>
          <button
            class="action-btn action-btn--danger"
            @click="$emit('delete', stage)"
          >
            🗑 Supprimer
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!store.loading && store.stagesFiltres.length === 0" class="empty-state-wide">
        Aucun stage trouvé.
      </div>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <div class="table-info">
        Affichage de {{ store.stagesPagines.length }} stages sur {{ store.stagesFiltres.length }} au total
      </div>
      <div class="pagination">
        <button class="page-btn" :disabled="store.page === 1" @click="store.page--">‹</button>
        <button
          v-for="p in store.totalPages" :key="p"
          class="page-btn" :class="{ active: p === store.page }"
          @click="store.page = p"
        >{{ p }}</button>
        <button class="page-btn" :disabled="store.page === store.totalPages" @click="store.page++">›</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStageStore, initiales, logoColor, formatDate, badgeClass, labelStatut } from '@/stores/stageStore'

const store = useStageStore()

defineEmits(['voir', 'edit', 'delete'])

const expandedMissions = ref(new Set())

function toggleMissions(id) {
  const s = new Set(expandedMissions.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expandedMissions.value = s
}

function getTechnologies(stage) {
  const techs = stage.technologies ?? []
  return techs.map(t => ({
    id_technologie:     t.id_technologie,
    nom:                t.nom ?? t.technologie?.nom ?? '',
    categorie:          t.categorie ?? t.technologie?.categorie ?? '',
    version:            t.version ?? '',
    niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
  }))
}

function techEmoji(tech) {
  const map = {
    FRONTEND: '🎨', BACKEND: '⚙️', DATABASE: '🗄️',
    DEVOPS: '🚀', MOBILE: '📱', IA: '🤖', AI: '🤖',
    SECURITE: '🔒', CLOUD: '☁️', TESTING: '🧪',
    DESIGN: '✏️', AUTRE: '🔧',
  }
  return map[(tech.categorie || '').toUpperCase()] ?? '🔧'
}

function techNiveauClass(n) {
  return { DEBUTANT: 'lvl-green', INTERMEDIAIRE: 'lvl-yellow', AVANCE: 'lvl-orange', EXPERT: 'lvl-red' }[n] ?? ''
}

function techNiveauLabel(n) {
  return { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé', EXPERT: 'Expert' }[n] ?? n
}
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>
