<template>
  <section class="section">
    <div class="section__header">
      <h2 class="section__title">Mon Portfolio Numérique</h2>
      <div class="section__actions">
        <button class="btn btn--ghost">Filtres</button>
        <button class="btn btn--ghost btn--ghost-accent">Trier par date</button>
      </div>
    </div>

    <div v-if="loading" class="project-grid">
      <div v-for="n in 6" :key="n" class="project-card">
        <div class="skeleton skeleton--short" />
        <div class="skeleton skeleton--full" />
        <div class="skeleton skeleton--full" />
      </div>
    </div>

    <div v-else-if="projects.length === 0" class="empty-state">
      <img src="@/assets/icons/projets.svg" class="icon icon--lg" alt="" />
      <p class="empty-state__title">Aucun projet pour le moment</p>
      <button class="btn btn--primary" @click="$router.push('/projets')">+ Ajouter un projet</button>
    </div>

    <div v-else class="project-grid">
      <div
        v-for="project in projects"
        :key="project.id_projet"
        class="project-card"
        :class="getProjectCardClass(project.status_validation)"
        @click="$router.push(`/projets/${project.id_projet}`)"
      >
        <div class="project-card__header">
          <span class="badge badge--type">{{ formatTypeProjet(project.type_projet) }}</span>
          <span class="badge badge--status" :class="getStatusBadgeClass(project.status_validation)">
            <img v-if="project.status_validation === 'VALIDE'" src="@/assets/icons/trusty.svg" class="icon icon--xs" alt="" />
            <span v-else class="badge__dot" />
            {{ formatStatut(project.status_validation) }}
          </span>
        </div>
        <h3 class="project-card__title">{{ project.titre }}</h3>
        <p class="project-card__date">{{ formatDate(project.date_debut) }}</p>
        <p class="project-card__description">{{ project.description }}</p>
        <div class="project-card__footer">
          <div class="project-card__icons">
            <span v-for="t in project.technologies" :key="t.technologie.nom" class="tag">
              {{ t.technologie.nom }}
            </span>
          </div>
          <button class="btn btn--link" @click.stop="$router.push(`/projets/${project.id_projet}`)">
            Détails ↗
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ projects: Array, loading: Boolean })

// status_validation : EN_ATTENTE | VALIDE | REJETE  (enum StatusValidation)
const getStatusBadgeClass = (s) => ({
  VALIDE:     'badge--status-ok',
  EN_ATTENTE: 'badge--status-wait',
  REJETE:     'badge--status-error',
}[s] ?? '')

const getProjectCardClass = (s) => s === 'EN_ATTENTE' ? 'project-card--pending' : ''

const formatStatut = (s) => ({
  VALIDE:     'Certifié',
  EN_ATTENTE: 'En attente',
  REJETE:     'Rejeté',
}[s] ?? s)

// type_projet : enum TypeProjet
const formatTypeProjet = (t) => ({
  MODULE:    'Module',
  PFA:       'PFA',
  PFE:       'PFE',
  STAGE:     'Stage',
  PERSONNEL: 'Personnel',
  HACKATHON: 'Hackathon',
  INTEGRATION: 'Intégration',
  AUTRE:     'Autre',
}[t] ?? t)

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
</script>

<style scoped>
@import '@/assets/dashboard.css';
</style>