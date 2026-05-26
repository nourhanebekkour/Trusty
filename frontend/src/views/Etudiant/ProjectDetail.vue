<template>
  <main class="project-detail">
    <button class="back-link" type="button" @click="router.push('/projets')">
      Retour aux projets
    </button>

    <section class="detail-panel">
      <div class="detail-panel__header">
        <span class="detail-panel__eyebrow">Projet {{ id }}</span>
        <h1>{{ project?.titre || 'Détail du projet' }}</h1>
        <p>
          {{ project?.description || 'Sélectionnez un projet depuis la liste pour consulter ses informations.' }}
        </p>
      </div>

      <dl class="detail-grid">
        <div>
          <dt>Type</dt>
          <dd>{{ project?.type || project?.type_projet || 'Non renseigné' }}</dd>
        </div>
        <div>
          <dt>Statut</dt>
          <dd>{{ project?.statut || project?.status_validation || 'Non renseigné' }}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{{ formattedDate }}</dd>
        </div>
      </dl>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps({
  id: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const project = computed(() => route.state?.project ?? null)

const formattedDate = computed(() => {
  const date = project.value?.dateDebut ?? project.value?.date_debut
  if (!date) return 'Non renseignée'

  return new Date(date).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
})
</script>

<style scoped>
.project-detail {
  min-height: 100%;
  padding: 32px;
  color: var(--color-text);
  background: var(--color-background);
}

.back-link {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  margin-bottom: 20px;
}

.detail-panel {
  max-width: 860px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
}

.detail-panel__eyebrow {
  display: block;
  color: var(--color-text-muted);
  font-size: 13px;
  margin-bottom: 8px;
}

.detail-panel h1 {
  margin: 0 0 10px;
  font-size: 28px;
}

.detail-panel p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0 0;
}

.detail-grid div {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px;
}

.detail-grid dt {
  color: var(--color-text-muted);
  font-size: 12px;
  margin-bottom: 6px;
}

.detail-grid dd {
  margin: 0;
  font-weight: 600;
}

@media (max-width: 760px) {
  .project-detail {
    padding: 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
