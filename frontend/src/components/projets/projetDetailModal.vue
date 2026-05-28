<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal modal-large">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">{{ projet.titre }}</h3>
            <span
              :class="['badge-statut', `badge-${projet.status_validation?.toLowerCase().replace('_','-')}`]"
              style="margin-top:5px;display:inline-block"
            >{{ formatStatut(projet.status_validation) }}</span>
          </div>
          <button class="modal-close" @click="$emit('update:modelValue', false)">×</button>
        </div>

        <div class="modal-body detail-body">
          <div class="detail-section">
            <h5 class="detail-section-title">Description</h5>
            <p class="detail-text">{{ projet.description }}</p>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Type</span>
              <span class="detail-value">{{ formatType(projet.type_projet) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date début</span>
              <span class="detail-value">{{ formatDate(projet.date_debut) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date fin</span>
              <span class="detail-value">{{ projet.date_fin ? formatDate(projet.date_fin) : '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Collaborateurs</span>
              <span class="detail-value">{{ projet.nombre_collaborateurs }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Soumis le</span>
              <span class="detail-value">{{ formatDate(projet.date_soumission) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Visibilité</span>
              <span class="detail-value">{{ projet.est_public ? 'Public' : 'Privé' }}</span>
            </div>
          </div>

          <div v-if="projet.resultats_obtenus" class="detail-section">
            <h5 class="detail-section-title">Résultats</h5>
            <p class="detail-text">{{ projet.resultats_obtenus }}</p>
          </div>

          <div v-if="projet.commentaire_validation" class="detail-section">
            <h5 class="detail-section-title">Commentaire de validation</h5>
            <p class="detail-text">{{ projet.commentaire_validation }}</p>
          </div>

          <!-- Liens -->
          <div class="detail-links">
            <a v-if="projet.lien_github" :href="projet.lien_github"
               target="_blank" class="detail-link github">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a v-if="projet.lien_demo" :href="projet.lien_demo"
               target="_blank" class="detail-link demo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" width="14" height="14">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Demo
            </a>
            <a v-if="projet.lien_youtube" :href="projet.lien_youtube"
               target="_blank" class="detail-link yt">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>
          </div>

          <!-- Technologies -->
          <div v-if="projet.technologies?.length" class="detail-section">
            <h5 class="detail-section-title">Technologies</h5>
            <div class="tech-list">
              <div v-for="t in projet.technologies" :key="t.id_technologie"
                   class="tech-detail-badge">
                <span class="tech-nom">{{ t.technologie.nom }}</span>
                <span class="tech-cat">{{ t.technologie.categorie }}</span>
                <span class="tech-niveau">{{ formatNiveau(t.niveau_utilisation) }}</span>
              </div>
            </div>
          </div>

          <!-- Participants -->
          <div v-if="projet.participations?.length" class="detail-section">
            <h5 class="detail-section-title">Participants</h5>
            <div class="participants-list">
              <div v-for="p in projet.participations" :key="p.id_etudiant"
                   class="participant-detail">
                <span class="participant-avatar large">{{ initiales(p.etudiant) }}</span>
                <div>
                  <div class="participant-nom">{{ nomComplet(p.etudiant) }}</div>
                  <div class="participant-role">{{ p.role_joue }} · {{ p.etudiant?.filiere }}</div>
                </div>
                <span v-if="p.est_createur" class="creator-badge">Créateur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { nomComplet, initiales, formatType, formatStatut, formatNiveau, formatDate } from './projetHelpers'

export default {
  name: 'ProjetDetailModal',
  props: {
    modelValue: { type: Boolean, default: false },
    projet:     { type: Object,  default: () => ({}) },
  },
  emits: ['update:modelValue'],
  methods: { nomComplet, initiales, formatType, formatStatut, formatNiveau, formatDate },
}
</script>
<style scoped>
   @import "@/assets/projet"
</style>