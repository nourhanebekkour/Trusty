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

    <!-- Table -->
    <table v-else>
      <thead>
        <tr>
          <th>Entreprise</th>
          <th>Professeur Tuteur</th>
          <th>Statut</th>
          <th>Date de début</th>
          <th>Date de fin</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stage in store.stagesPagines" :key="stage.id_stage">
          <td>
            <div class="company-cell">
              <div class="company-logo" :style="{ background: logoColor(stage.entreprise) }">
                {{ initiales(stage.entreprise) }}
              </div>
              <div>
                <div class="company-name">{{ stage.entreprise }}</div>
                <div class="company-sector">⊞ {{ stage.poste }}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="tutor-cell">
              <div class="tutor-avatar" :style="{ background: avatarColor(stage.encadrant_academique) }">
                {{ initiales(stage.encadrant_academique || '??') }}
              </div>
              <div class="tutor-name">{{ stage.encadrant_academique || '—' }}</div>
            </div>
          </td>
          <td>
            <span class="badge" :class="badgeClass(stage.status_validation)">
              <span class="badge-dot"></span>
              {{ labelStatut(stage.status_validation) }}
            </span>
          </td>
          <td>
            <div class="date-cell">
              <span class="date-icon">📅</span>
              {{ formatDate(stage.date_debut) }}
            </div>
          </td>
          <td>
            <div class="date-cell">
              <span class="date-icon">📅</span>
              {{ stage.date_fin ? formatDate(stage.date_fin) : '—' }}
            </div>
          </td>
          <td>
            <div class="action-cell">
              <button class="action-btn" title="Voir"      @click="$emit('voir', stage)">👁</button>
              <button class="action-btn" title="Modifier"  @click="$emit('edit', stage)">✎</button>
              <button class="action-btn action-btn--danger" title="Supprimer" @click="store.confirmerSuppression(stage)">🗑</button>
            </div>
          </td>
        </tr>
        <tr v-if="!store.loading && store.stagesFiltres.length === 0">
          <td colspan="6" class="empty-state">Aucun stage trouvé.</td>
        </tr>
      </tbody>
    </table>

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
import { useStageStore, initiales, logoColor, avatarColor, formatDate, badgeClass, labelStatut } from '@/stores/stageStore'

const store = useStageStore()

defineEmits(['voir', 'edit'])
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>