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
        :key="project.id"
        class="project-card"
        :class="getProjectCardClass(project.statut)"
        @click="$router.push(`/projets/${project.id}`)"
      >
        <div class="project-card__header">
          <span class="badge badge--type">{{ project.type }}</span>
          <span class="badge badge--status" :class="getStatusBadgeClass(project.statut)">
            <img v-if="project.statut === 'Certifié'" src="@/assets/icons/trusty.svg" class="icon icon--xs" alt="" />
            <span v-else class="badge__dot" />
            {{ project.statut }}
          </span>
        </div>
        <h3 class="project-card__title">{{ project.titre }}</h3>
        <p class="project-card__date">{{ formatDate(project.dateDebut) }}</p>
        <p class="project-card__description">{{ project.description }}</p>
        <div class="project-card__footer">
          <div class="project-card__icons">
            <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <button class="btn btn--link" @click.stop="$router.push(`/projets/${project.id}`)">
            Détails ↗
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ projects: Array, loading: Boolean })

// API statut values: "Certifié" / "En attente" / "En cours"
const getStatusBadgeClass = (s) => ({
  'Certifié':  'badge--status-ok',
  'En attente': 'badge--status-wait',
  'En cours':  'badge--status-progress',
}[s] ?? '')

const getProjectCardClass = (s) => s === 'En attente' ? 'project-card--pending' : ''

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
</script>

<style scoped>
@import '@/assets/Dashboard.css';
</style>