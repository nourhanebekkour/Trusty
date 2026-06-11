<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="detail-modal">

        <!-- Header -->
        <div class="detail-header">
          <div class="detail-header-left">
            <span class="detail-icon">📁</span>
            <h3 class="detail-title">Détail du projet</h3>
          </div>
          <button class="modal-close" @click="close">×</button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="detail-loading">
          <div class="spinner"></div>
          <span>Chargement des informations…</span>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="detail-error">
          <span>⚠ {{ error }}</span>
        </div>

        <!-- Content -->
        <div v-else-if="projet" class="detail-scroll">

          <!-- Hero -->
          <div class="detail-hero">
            <div class="detail-hero-logo">
              {{ firstParticipantInitials(projet.participations) }}
            </div>
            <div class="detail-hero-info">
              <h2 class="detail-hero-title">{{ projet.titre }}</h2>
              <p class="detail-hero-type">{{ formatType(projet.type_projet) }} · {{ formatDate(projet.date_soumission) }}</p>
            </div>
            <div class="detail-hero-badges">
              <span class="badge" :class="badgeClass(projet.status_validation)">
                <span class="badge-dot"></span>
                {{ formatStatut(projet.status_validation) }}
              </span>
              <span class="badge" :class="projet.est_public ? 'badge--public' : 'badge--private'">
                {{ projet.est_public ? '🌐 Public' : '🔒 Privé' }}
              </span>
            </div>
          </div>

          <!-- Grid -->
          <div class="detail-grid">

            <!-- Description -->
            <div class="detail-section detail-section--full">
              <h4 class="detail-section-title">📝 Description</h4>
              <p class="detail-text">{{ projet.description || '—' }}</p>
            </div>

            <!-- Période -->
            <div class="detail-section">
              <h4 class="detail-section-title">📅 Période</h4>
              <div class="detail-field">
                <span class="detail-label">Début</span>
                <span class="detail-value">{{ formatDate(projet.date_debut) }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Fin</span>
                <span class="detail-value">{{ projet.date_fin ? formatDate(projet.date_fin) : '—' }}</span>
              </div>
            </div>

            <!-- Infos -->
            <div class="detail-section">
              <h4 class="detail-section-title">ℹ️ Infos</h4>
              <div class="detail-field">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ formatType(projet.type_projet) }}</span>
              </div>
              <div class="detail-field" v-if="projet.nombre_collaborateurs">
                <span class="detail-label">Collaborateurs</span>
                <span class="detail-value">{{ projet.nombre_collaborateurs }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Soumis le</span>
                <span class="detail-value">{{ formatDate(projet.date_soumission) }}</span>
              </div>
            </div>

            <!-- Résultats -->
            <div v-if="projet.resultats_obtenus" class="detail-section detail-section--full">
              <h4 class="detail-section-title">🎯 Résultats</h4>
              <p class="detail-text">{{ projet.resultats_obtenus }}</p>
            </div>

            <!-- Commentaire validation -->
            <div v-if="projet.commentaire_validation" class="detail-section detail-section--full">
              <h4 class="detail-section-title">💬 Commentaire de validation</h4>
              <p class="detail-text">{{ projet.commentaire_validation }}</p>
            </div>

          </div>

          <!-- Technologies -->
          <div v-if="technologies.length" class="detail-section detail-section--full">
            <h4 class="detail-section-title">🛠️ Technologies</h4>
            <div class="detail-techs">
              <div v-for="tech in technologies" :key="tech.id_technologie" class="detail-tech-item">
                <span class="detail-tech-emoji">{{ techEmoji(tech) }}</span>
                <div class="detail-tech-info">
                  <span class="detail-tech-name">{{ tech.nom }}</span>
                  <span v-if="tech.version" class="detail-tech-version">v{{ tech.version }}</span>
                </div>
                <span class="tech-level" :class="techNiveauClass(tech.niveau_utilisation)">
                  {{ techNiveauLabel(tech.niveau_utilisation) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Participants -->
          <div v-if="participants.length" class="detail-section detail-section--full">
            <h4 class="detail-section-title">👥 Participants</h4>
            <div class="detail-participants">
              <div v-for="p in participants" :key="p.id_etudiant" class="detail-participant">
                <span class="participant-avatar">{{ initiales(p.etudiant) }}</span>
                <div class="participant-info">
                  <span class="participant-nom">{{ nomComplet(p.etudiant) }}</span>
                  <span class="participant-role">{{ p.role_joue }}{{ p.est_createur ? ' · Créateur' : '' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Liens -->
          <div v-if="hasLinks" class="detail-section detail-section--full">
            <h4 class="detail-section-title">🔗 Liens</h4>
            <div class="detail-links">
              <a v-if="projet.lien_github" :href="projet.lien_github" target="_blank" class="detail-link github">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a v-if="projet.lien_demo" :href="projet.lien_demo" target="_blank" class="detail-link demo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Demo
              </a>
              <a v-if="projet.lien_youtube" :href="projet.lien_youtube" target="_blank" class="detail-link yt">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="detail-footer">
          <button class="btn-cancel" @click="close">Fermer</button>
          <button class="btn-new" @click="goToEdit">✎ Modifier ce projet</button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import {
  nomComplet, initiales, formatType, formatStatut, formatNiveau, formatDate,
  badgeClass, firstParticipantInitials,
} from './projetHelpers'

export default {
  name: 'ProjetDetailModal',

  props: {
    modelValue: { type: Boolean, default: false },
    projet:     { type: Object, default: () => ({}) },
  },

  emits: ['update:modelValue', 'edit'],

  data() {
    return {
      loading: false,
      error: null,
    }
  },

  computed: {
    technologies() {
      const techs = this.projet.technologies ?? []
      return techs.map(t => ({
        id_technologie:     t.id_technologie,
        nom:                t.nom ?? t.technologie?.nom ?? '',
        categorie:          t.categorie ?? t.technologie?.categorie ?? '',
        version:            t.version ?? '',
        niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
      }))
    },

    participants() {
      return this.projet.participations ?? []
    },

    hasLinks() {
      return !!(this.projet.lien_github || this.projet.lien_demo || this.projet.lien_youtube)
    },
  },

  methods: {
    nomComplet, initiales, formatType, formatStatut, formatNiveau, formatDate,
    badgeClass, firstParticipantInitials,

    close() {
      this.$emit('update:modelValue', false)
    },

    goToEdit() {
      this.close()
      if (this.projet) {
        this.$emit('edit', this.projet)
      }
    },

    techNiveauLabel(n) {
      return { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé', EXPERT: 'Expert' }[n] ?? n
    },

    techNiveauClass(n) {
      return { DEBUTANT: 'lvl-green', INTERMEDIAIRE: 'lvl-yellow', AVANCE: 'lvl-orange', EXPERT: 'lvl-red' }[n] ?? ''
    },

    techEmoji(tech) {
      const map = {
        FRONTEND: '🎨', BACKEND: '⚙️', DATABASE: '🗄️',
        DEVOPS: '🚀', MOBILE: '📱', IA: '🤖', AI: '🤖',
        SECURITE: '🔒', CLOUD: '☁️', TESTING: '🧪',
        DESIGN: '✏️', AUTRE: '🔧',
      }
      return map[(tech.categorie || '').toUpperCase()] ?? '🔧'
    },
  },
}
</script>

<style scoped>
@import '@/assets/StageList.css';

.detail-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 720px;
  max-width: 94vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-panel);
  animation: fadeUp 0.25s ease;
  color: var(--color-text-primary);
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.detail-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-icon {
  font-size: 18px;
}

.detail-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}

.modal-close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

/* ── Loading / Error ── */
.detail-loading,
.detail-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.detail-error {
  color: #DC2626;
}

/* ── Scrollable body ── */
.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* ── Hero ── */
.detail-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 28px 20px;
  background: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border-light);
}

.detail-hero-logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
}

.detail-hero-info {
  flex: 1;
  min-width: 0;
}

.detail-hero-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-hero-type {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 3px 0 0;
}

.detail-hero-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  flex-shrink: 0;
}

.badge--public {
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-color: var(--color-accent-border);
}

.badge--private {
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

/* ── Grid ── */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 8px 28px;
}

/* ── Sections ── */
.detail-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-section:nth-child(odd) {
  padding-right: 20px;
}

.detail-section:nth-child(even) {
  padding-left: 20px;
  border-left: 1px solid var(--color-border-light);
}

.detail-section--full {
  grid-column: 1 / -1;
  padding: 16px 28px;
  border-left: none !important;
}

.detail-section--full:nth-child(odd) {
  padding-right: 28px;
}

.detail-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.detail-field:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detail-value {
  font-size: 14px;
  color: var(--color-text-primary);
}

.detail-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
}

/* ── Technologies ── */
.detail-techs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-tech-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--color-surface-alt);
  border-radius: 10px;
  border: 1px solid var(--color-border);
}

.detail-tech-emoji {
  font-size: 20px;
  flex-shrink: 0;
}

.detail-tech-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-tech-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.detail-tech-version {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  padding: 1px 7px;
  border-radius: 6px;
}

.detail-tech-item .tech-level {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 14px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

/* ── Participants ── */
.detail-participants {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-participant {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-surface-alt);
  border-radius: 10px;
  border: 1px solid var(--color-border);
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.participant-nom {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.participant-role {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ── Liens ── */
.detail-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.detail-link.github {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.detail-link.demo {
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-color: var(--color-accent-border);
}

.detail-link.yt {
  background: #FEF2F2;
  color: #DC2626;
  border-color: #FECACA;
}

.detail-link:hover {
  transform: translateY(-1px);
  filter: brightness(1.15);
}

/* ── Footer ── */
.detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* ── Transition ── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
