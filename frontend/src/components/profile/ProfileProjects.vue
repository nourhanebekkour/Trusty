<template>
  <div class="card">
    <div class="section-header">
      <h3>Projets Académiques</h3>
      <button class="add-btn" @click="router.push('/projets/nouveau')">+ Ajouter</button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="repos-loading">
      <div class="skeleton" v-for="n in 3" :key="n"></div>
    </div>

    <!-- Liste des projets -->
    <div class="project-list" v-else-if="projets.length">
      <div
        class="project-row"
        v-for="pp in projets"
        :key="pp.projet?.id_projet ?? pp.id_projet"
        @click="goToProjet(pp)"
        style="cursor:pointer"
      >
        <div class="project-info">
          <span class="project-icon">{{ typeIcon(pp.projet?.type_projet ?? pp.type_projet) }}</span>
          <div>
            <p class="project-title">{{ pp.projet?.titre ?? pp.titre }}</p>
            <p class="project-desc">
              <span class="project-role" v-if="pp.role_joue">{{ pp.role_joue }} · </span>
              {{ pp.projet?.type_projet ?? pp.type_projet }}
            </p>
            <p class="project-desc">{{ pp.projet?.description ?? pp.description }}</p>
          </div>
        </div>
        <div class="project-right">
          <span class="status" :class="statusClass(pp.projet?.status_validation ?? pp.status_validation)">
            {{ formatStatut(pp.projet?.status_validation ?? pp.status_validation) }}
          </span>
          <span class="creator-badge" v-if="pp.est_createur">👑 Créateur</span>
        </div>
      </div>
    </div>

    <p class="empty-msg" v-else>Aucun projet académique.</p>

    <button class="link-btn" @click="router.push('/projets')">Voir tous les projets →</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ user: Object })
const router  = useRouter()
const loading = ref(false)

// Les projets viennent du store user (participations_projets) ou directement de l'étudiant
const projets = computed(() => {
  const participations = props.user?.etudiant?.participations_projets ?? []
  // Normaliser : certains backends retournent directement la liste des projets
  // d'autres retournent des objets { projet, role_joue, est_createur, ... }
  return participations
})

const formatStatut = (s) => ({
  VALIDE:     'Validé',
  EN_ATTENTE: 'En attente',
  REJETE:     'Rejeté',
}[s] ?? s ?? '—')

const statusClass = (s) => ({
  'status-green': s === 'VALIDE',
  'status-amber': s === 'EN_ATTENTE',
  'status-gray':  s === 'REJETE',
})

const typeIcon = (type) => ({
  MODULE:      '📚',
  INTEGRATION: '🔗',
  PFA:         '🎓',
  PFE:         '🏆',
  STAGE:       '💼',
  PERSONNEL:   '💡',
  HACKATHON:   '⚡',
  AUTRE:       '📁',
}[type] ?? '📁')

const goToProjet = (pp) => {
  const id = pp.projet?.id_projet ?? pp.id_projet
  if (id) router.push(`/projets/${id}`)
}
</script>

<style scoped>
@import '@/assets/profile.css';

.repos-loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.skeleton {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.project-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.project-role {
  font-size: 11px;
  color: var(--color-text-secondary, #888);
  font-style: italic;
}

.creator-badge {
  font-size: 10px;
  color: #d97706;
  font-weight: 600;
}
</style>