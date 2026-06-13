<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="detail-modal">

        <!-- Header -->
        <div class="detail-header">
          <div class="detail-header-left">
            <span class="detail-icon"><AppIcon name="briefcase" /></span>
            <h3 class="detail-title">Détail du stage</h3>
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
          <span><AppIcon name="warning" /> {{ error }}</span>
        </div>

        <!-- Content -->
        <div v-else-if="stage" class="detail-scroll">

          <!-- Hero -->
          <div class="detail-hero">
            <div class="detail-hero-logo" :style="{ background: logoColor(stage.entreprise) }">
              {{ initiales(stage.entreprise) }}
            </div>
            <div class="detail-hero-info">
              <h2 class="detail-hero-company">{{ stage.entreprise }}</h2>
              <p class="detail-hero-poste">{{ stage.poste }}</p>
            </div>
            <div class="detail-hero-badges">
              <span class="badge" :class="badgeClass(stage.status_validation)">
                <span class="badge-dot"></span>
                {{ labelStatut(stage.status_validation) }}
              </span>
              <span class="badge badge--public" v-if="stage.est_public !== false">
                <AppIcon name="globe" /> Public
              </span>
              <span class="badge badge--private" v-else>
                <AppIcon name="lock" /> Privé
              </span>
            </div>
          </div>

          <div class="detail-grid">

            <!-- Infos générales -->
            <div class="detail-section">
              <h4 class="detail-section-title"><AppIcon name="calendar" /> Période</h4>
              <div class="detail-field">
                <span class="detail-label">Date de début</span>
                <span class="detail-value">{{ formatDate(stage.date_debut) }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Date de fin</span>
                <span class="detail-value">{{ stage.date_fin ? formatDate(stage.date_fin) : '—' }}</span>
              </div>
              <div class="detail-field" v-if="stage.duree_semaines">
                <span class="detail-label">Durée</span>
                <span class="detail-value">{{ stage.duree_semaines }} semaines</span>
              </div>
            </div>

            <!-- Lieu -->
            <div class="detail-section" v-if="stage.adresse_entreprise">
              <h4 class="detail-section-title"><AppIcon name="map" /> Lieu</h4>
              <div class="detail-field">
                <span class="detail-label">Adresse</span>
                <span class="detail-value">{{ stage.adresse_entreprise }}</span>
              </div>
            </div>

            <!-- Encadrement -->
            <div class="detail-section">
              <h4 class="detail-section-title"><AppIcon name="users" /> Encadrement</h4>
              <div class="detail-field">
                <span class="detail-label">Professionnel</span>
                <span class="detail-value">{{ stage.encadrant_professionnel || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Académique</span>
                <span class="detail-value">{{ stage.encadrant_academique || '—' }}</span>
              </div>
              <div class="detail-field" v-if="validateur">
                <span class="detail-label">Validateur</span>
                <span class="detail-value">{{ validateur }}</span>
              </div>
            </div>

          </div>

          <!-- Missions -->
          <div class="detail-section detail-section--full">
            <h4 class="detail-section-title"><AppIcon name="file-text" /> Missions</h4>
            <p class="detail-missions-text">{{ stage.missions || '—' }}</p>
          </div>

          <!-- Technologies -->
          <div v-if="technologies.length" class="detail-section detail-section--full">
            <h4 class="detail-section-title"><AppIcon name="wrench" /> Technologies</h4>
            <div class="detail-techs">
              <div v-for="tech in technologies" :key="tech.id_technologie" class="detail-tech-item">
                <AppIcon class="detail-tech-emoji" :name="techEmoji(tech)" />
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

          <!-- Rapport -->
          <div class="detail-section detail-section--full">
            <h4 class="detail-section-title"><AppIcon name="file-text" /> Rapport</h4>
            <div v-if="rapportUrl" class="detail-rapport">
              <span class="detail-rapport-icon"><AppIcon name="file-text" /></span>
              <span class="detail-rapport-label">Rapport de stage</span>
              <a :href="rapportUrl" target="_blank" class="detail-rapport-link"><AppIcon name="eye" /> Voir le rapport</a>
            </div>
            <p v-else class="detail-empty">Aucun rapport déposé.</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="detail-footer">
          <button class="btn-cancel" @click="close">Fermer</button>
          <button class="btn-new" @click="goToEdit"><AppIcon name="pencil" /> Modifier ce stage</button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import { fetchStageById } from '@/services/stageService'
import { initiales, logoColor, formatDate, badgeClass, labelStatut } from '@/stores/stageStore'
import { niveauLabel, niveauClass } from './stageHelpers'

export default {
  name: 'StageDetailModal',

  props: {
    modelValue: { type: Boolean, default: false },
    stageId:    { type: [String, Number], default: null },
  },

  emits: ['update:modelValue', 'edit'],

  data() {
    return {
      loading: false,
      error: null,
      stage: null,
      technologies: [],
      rapportUrl: null,
      validateur: null,
    }
  },

  watch: {
    modelValue(val) {
      if (val && this.stageId) {
        this.fetchStage()
      }
    },
    stageId() {
      if (this.modelValue && this.stageId) {
        this.fetchStage()
      }
    },
  },

  methods: {
    async fetchStage() {
      this.loading = true
      this.error = null
      this.stage = null
      this.technologies = []
      this.rapportUrl = null
      this.validateur = null

      try {
        const data = await fetchStageById(this.stageId)
        const s = data?.data ?? data
        this.stage = s

        this.technologies = (s.technologies ?? []).map(t => ({
          id_technologie:     t.id_technologie,
          nom:                t.nom ?? t.technologie?.nom ?? '',
          categorie:          t.categorie ?? t.technologie?.categorie ?? '',
          version:            t.version ?? '',
          niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
        }))

        this.rapportUrl = s.rapport?.url ?? s.rapport_url ?? null

        if (s.validateur?.utilisateur) {
          this.validateur = `${s.validateur.utilisateur.prenom} ${s.validateur.utilisateur.nom}`
        } else if (s.validateur) {
          this.validateur = s.validateur.nom || s.validateur.prenom || null
        }
      } catch (e) {
        this.error = e?.response?.data?.message || 'Impossible de charger les détails du stage.'
      } finally {
        this.loading = false
      }
    },

    close() {
      this.$emit('update:modelValue', false)
    },

    goToEdit() {
      this.close()
      if (this.stage) {
        this.$emit('edit', this.stage)
      }
    },

    initiales,
    logoColor,
    formatDate,
    badgeClass,
    labelStatut,
    techNiveauLabel: niveauLabel,
    techNiveauClass: niveauClass,

    techEmoji(tech) {
      const map = {
        FRONTEND: 'palette', BACKEND: 'code', DATABASE: 'database',
        DEVOPS: 'rocket', MOBILE: 'smartphone', IA: 'sparkles', AI: 'sparkles',
        SECURITE: 'lock', CLOUD: 'cloud', TESTING: 'test',
        DESIGN: 'pencil', AUTRE: 'wrench',
      }
      return map[(tech.categorie || '').toUpperCase()] ?? 'wrench'
    },
  },
}
</script>

<style scoped>
@import '@/assets/StageList.css';

/* ── Override modal vars ── */
.detail-modal {
  --modal-bg: var(--color-surface);

  background: var(--modal-bg);
  border: 1px solid var(--border-md);
  border-radius: 16px;
  width: 680px;
  max-width: 94vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  animation: fadeUp 0.25s ease;
  color: var(--text);
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
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
  color: var(--text);
  margin: 0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-dim);
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}
.modal-close:hover {
  background: var(--color-surface-hover);
  color: var(--text);
}

/* ── Loading / Error ── */
.detail-loading,
.detail-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--text-dim);
  font-size: 14px;
}
.detail-error {
  color: var(--danger);
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
  border-bottom: 1px solid var(--border);
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
  color: #fff;
  flex-shrink: 0;
}
.detail-hero-info {
  flex: 1;
  min-width: 0;
}
.detail-hero-company {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detail-hero-poste {
  font-size: 14px;
  color: var(--text-dim);
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
  color: var(--text-dim);
  border-color: var(--border);
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
  border-bottom: 1px solid var(--border);
}
.detail-section:nth-child(odd) {
  padding-right: 20px;
}
.detail-section:nth-child(even) {
  padding-left: 20px;
  border-left: 1px solid var(--border);
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
  color: var(--text-muted);
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
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.detail-value {
  font-size: 14px;
  color: var(--text);
}

/* ── Missions ── */
.detail-missions-text {
  font-size: 14px;
  color: var(--text);
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
  border: 1px solid var(--border);
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
  color: var(--text);
}
.detail-tech-version {
  font-size: 11px;
  color: var(--text-dim);
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

/* ── Rapport ── */
.detail-rapport {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--color-surface-alt);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.detail-rapport-icon {
  font-size: 22px;
}
.detail-rapport-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}
.detail-rapport-link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s;
}
.detail-rapport-link:hover {
  background: var(--color-accent-hover);
}
.detail-empty {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ── Footer ── */
.detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
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

@media (max-width: 640px) {
  .detail-modal { max-width: 100%; margin: 0; border-radius: 0; max-height: 100vh; height: 100vh; }
  .detail-header { padding: 16px 18px; flex-wrap: wrap; gap: 8px; }
  .detail-body { padding: 0; }
  .detail-scroll { padding: 16px 18px; }
  .detail-grid { grid-template-columns: 1fr; padding: 8px 18px; }
  .detail-section { padding: 12px 0; }
  .detail-hero-badges { flex-direction: column; }
  .detail-footer { padding: 14px 18px; }
  .detail-footer .btn { flex: 1; justify-content: center; }
}
</style>
