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
        :key="projectId(project)"
        class="project-card"
        :class="getProjectCardClass(projectStatus(project))"
        @click="$router.push(`/projets/${projectId(project)}`)"
      >
        <div class="project-card__header">
          <span class="badge badge--type">{{ projectType(project) }}</span>
          <span class="badge badge--status" :class="getStatusBadgeClass(projectStatus(project))">
            <img
              v-if="projectStatus(project) === 'Certifié'"
              src="@/assets/icons/trusty.svg"
              class="icon icon--xs"
              alt=""
            />
            <span v-else class="badge__dot" />
            {{ projectStatus(project) }}
          </span>
        </div>
        <h3 class="project-card__title">{{ project.titre }}</h3>
        <p class="project-card__date">{{ formatDate(projectDate(project)) }}</p>
        <p class="project-card__description">{{ project.description }}</p>
        <div class="project-card__footer">
          <div class="project-card__icons">
            <span v-for="tag in projectTags(project)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
          <button class="btn btn--link" @click.stop="$router.push('/projets')">
            Détails ↗
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ projects: Array, loading: Boolean })

const projectId = (project) => project.id_projet ?? project.id

const projectType = (project) =>
  project.type ?? formatTypeProjet(project.type_projet)

const projectDate = (project) =>
  project.date_debut ?? project.dateDebut

const projectTags = (project) => {
  if (Array.isArray(project.tags)) return project.tags
  if (Array.isArray(project.technologies)) {
    return project.technologies
      .map(item => item.technologie?.nom ?? item.nom ?? item)
      .filter(Boolean)
  }
  return []
}

const projectStatus = (project) =>
  project.statut ?? formatStatut(project.status_validation)

const getStatusBadgeClass = (status) => ({
  VALIDE: 'badge--status-ok',
  'Certifié': 'badge--status-ok',
  'En cours': 'badge--status-progress',
  EN_ATTENTE: 'badge--status-wait',
  'En attente': 'badge--status-wait',
  REJETE: 'badge--status-error',
  Rejeté: 'badge--status-error',
}[status] ?? '')

const getProjectCardClass = (status) =>
  ['EN_ATTENTE', 'En attente'].includes(status) ? 'project-card--pending' : ''

const formatStatut = (status) => ({
  VALIDE: 'Certifié',
  EN_ATTENTE: 'En attente',
  REJETE: 'Rejeté',
}[status] ?? status)

const formatTypeProjet = (type) => ({
  MODULE: 'Module',
  PFA: 'PFA',
  PFE: 'PFE',
  STAGE: 'Stage',
  PERSONNEL: 'Personnel',
  HACKATHON: 'Hackathon',
  INTEGRATION: 'Intégration',
  AUTRE: 'Autre',
}[type] ?? type)

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
</script>

<style scoped>
@import '@/assets/dashboard.css';
</style>
