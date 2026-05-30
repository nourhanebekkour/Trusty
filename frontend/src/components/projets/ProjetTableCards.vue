<template>
  <div class="section">

    <!-- Cards -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Chargement des projets...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <span>⚠ {{ error }}</span>
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="projet in projets"
        :key="projet.id_projet"
        class="projet-card"
      >
        <!-- Card header: badges + actions -->
        <div class="card-header-top">
          <div class="badges">
            <span class="badge badge-type">
              <span class="badge-dot"></span>
              {{ formatType(projet.type_projet) }}
            </span>
            <span class="badge" :class="badgeClass(projet.status_validation)">
              <span class="badge-dot"></span>
              {{ formatStatut(projet.status_validation) }}
            </span>
          </div>
          <div class="card-actions">
            <button class="action-btn" title="Modifier" @click.stop="$emit('edit', projet)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn danger" title="Supprimer" @click.stop="$emit('delete', projet)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Card body -->
        <div class="card-body" @click="$emit('view', projet)">

          <div class="card-hero">
            <div class="card-avatar">
              {{ firstParticipantInitials(projet.participations) }}
            </div>
            <div class="card-hero-info">
              <h3 class="card-title">{{ projet.titre }}</h3>
              <p class="card-meta">{{ formatType(projet.type_projet) }} · {{ formatDate(projet.date_soumission) }}</p>
            </div>
          </div>

          <div class="card-separator"></div>

          <div class="card-fields">
            <!-- Participants -->
            <div v-if="projet.participations?.length" class="info-row">
              <span class="info-label">Participants</span>
              {{ participantsList(projet.participations) }}
            </div>

            <!-- Date -->
            <div class="info-row">
              <span class="info-label">Date</span>
              DU {{ formatDate(projet.date_debut) }}
              AU {{ projet.date_fin ? formatDate(projet.date_fin) : '—' }}
            </div>

            <!-- Description -->
            <div v-if="projet.description" class="info-row info-row--col">
              <span class="info-label">Description</span>
              <div class="info-text">
                <span v-if="!expandedDescs.has(projet.id_projet) && projet.description.length > 120">
                  {{ projet.description.slice(0, 120) }}…
                </span>
                <span v-else>{{ projet.description }}</span>
                <button
                  v-if="projet.description.length > 120"
                  class="expand-btn"
                  @click.stop="toggleDesc(projet.id_projet)"
                >
                  {{ expandedDescs.has(projet.id_projet) ? 'Réduire' : 'Voir plus' }}
                </button>
              </div>
            </div>

            <!-- Technologies -->
            <div v-if="getTechnologies(projet).length" class="info-row info-row--col">
              <span class="info-label">Technologies</span>
              <div class="tech-tags">
                <span
                  v-for="tech in getTechnologies(projet)"
                  :key="tech.id_technologie"
                  class="tech-badge"
                >
                  {{ tech.nom }}
                  <span class="tech-level">{{ formatNiveau(tech.niveau_utilisation) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Separator -->
        <div class="card-separator-footer"></div>

        <!-- Card footer -->
        <div class="card-footer">
          <div class="footer-left">
            <a
              v-if="projet.lien_github"
              :href="projet.lien_github"
              target="_blank"
              class="footer-link footer-link--github"
              @click.stop
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              v-if="projet.lien_youtube"
              :href="projet.lien_youtube"
              target="_blank"
              class="footer-link footer-link--youtube"
              @click.stop
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>
            <a
              v-if="projet.lien_demo"
              :href="projet.lien_demo"
              target="_blank"
              class="footer-link footer-link--demo"
              @click.stop
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Démo
            </a>
            <button
              v-if="!projet.rapport"
              class="footer-link"
              @click.stop="$emit('join-rapport', projet)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Joindre un rapport
            </button>
            <button
              v-else
              class="footer-link footer-link--rapport footer-link--has"
              @click.stop="$emit('view', projet)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Voir le rapport
            </button>
          </div>
          <div class="footer-right">
            <button class="footer-link footer-link--voir" @click.stop="$emit('view', projet)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Voir le projet
            </button>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!loading && projets.length === 0" class="empty-card">
        Aucun projet trouvé.
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
      <span class="pagination-info">
        Affichage de {{ projets.length }} sur {{ total }} projet(s)
      </span>
      <div class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="$emit('update:page', page - 1)">‹</button>
        <button
          v-for="p in totalPages" :key="p"
          class="page-btn" :class="{ active: p === page }"
          @click="$emit('update:page', p)"
        >{{ p }}</button>
        <button class="page-btn" :disabled="page === totalPages || totalPages === 0" @click="$emit('update:page', page + 1)">›</button>
      </div>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue'
import {
  formatType, formatStatut, formatNiveau, formatDate,
  badgeClass, participantsList, firstParticipantInitials,
} from './projetHelpers'

export default {
  name: 'ProjetTableCards',

  props: {
    projets:    { type: Array, default: () => [] },
    total:      { type: Number, default: 0 },
    page:       { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    loading:    { type: Boolean, default: false },
    error:      { type: String, default: null },
  },

  emits: ['view', 'edit', 'delete', 'update:page', 'join-rapport'],

  setup() {
    const expandedDescs = ref(new Set())
    function toggleDesc(id) {
      const s = new Set(expandedDescs.value)
      if (s.has(id)) s.delete(id); else s.add(id)
      expandedDescs.value = s
    }
    return { expandedDescs, toggleDesc }
  },

  methods: {
    formatType, formatStatut, formatNiveau, formatDate, badgeClass,
    participantsList, firstParticipantInitials,

    getTechnologies(projet) {
      const techs = projet.technologies ?? []
      return techs.map(t => ({
        id_technologie:     t.id_technologie,
        nom:                t.nom ?? t.technologie?.nom ?? '',
        niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
      }))
    },


  },
}
</script>

<style scoped>
.section {
  margin-bottom: 1.5rem;
}

/* ── Loading / Error ── */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

.spinner {
  width: 36px; height: 36px;
  border: 2px solid var(--color-accent-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Cards Grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 820px) {
  .cards-grid { grid-template-columns: 1fr; }
}

/* ── Card ── */
.projet-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: border-color 0.25s, transform 0.25s;
  position: relative;
  overflow: hidden;
}

.projet-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--color-accent);
  border-radius: 4px 0 0 4px;
}

.projet-card:hover {
  border-color: var(--color-accent-border);
  transform: translateY(-2px);
}

/* ── Card Header ── */
.card-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
}

.badge-type {
  background: var(--color-accent-light);
  color: var(--color-accent);
}
.badge-type .badge-dot { background: var(--color-accent); }

.badge--valide {
  background: var(--color-valid-bg);
  color: var(--color-valid-text);
}
.badge--valide .badge-dot { background: var(--color-valid-text); }

.badge--attente {
  background: var(--color-waiting-bg);
  color: var(--color-waiting-text);
}
.badge--attente .badge-dot {
  background: var(--color-waiting-text);
  animation: pulseDot 1.8s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.75); }
}

.badge--rejete {
  background: #FEF2F2;
  color: #DC2626;
}
.badge--rejete .badge-dot { background: #DC2626; }

.card-actions {
  display: flex;
  gap: 0.4rem;
}

.action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.action-btn.danger:hover {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #DC2626;
}

/* ── Card Body ── */
.card-body {
  cursor: pointer;
  flex: 1;
}

.card-hero {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.card-avatar {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
}

.card-hero-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin: 0.15rem 0 0;
}

.card-separator {
  height: 1px;
  background: var(--color-border-light);
  margin-bottom: 0.85rem;
}

/* ── Fields ── */
.card-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Info rows ── */
.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-primary);
}

.info-row--col {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.info-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-accent);
  flex-shrink: 0;
}

.info-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  transition: background 0.15s;
  margin-left: 2px;
}

.expand-btn:hover {
  background: var(--color-accent-light);
}

/* ── Tech tags ── */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  color: var(--color-text-primary);
}

.tech-level {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #e8a04a;
}

/* ── Separator before footer ── */
.card-separator-footer {
  height: 1px;
  background: var(--color-border-light);
  margin: 1rem 0 0.75rem;
}

/* ── Card Footer ── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
  white-space: nowrap;
  font-family: inherit;
  font-weight: 500;
}

.footer-link:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-accent-border);
}

.footer-link--github  { }
.footer-link--youtube { border-color: rgba(220, 50, 50, 0.35);  color: #dc3232; }
.footer-link--demo    { border-color: var(--color-accent-border); color: var(--color-accent); }
.footer-link--rapport { border-color: var(--color-purple-border); color: var(--color-purple-text); }
.footer-link--rapport.footer-link--has {
  background: var(--color-purple-bg);
}
.footer-link--voir {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.footer-link--voir:hover {
  background: var(--color-accent-hover);
}

/* ── Empty card ── */
.empty-card {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

/* ── Pagination ── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.pagination-info {
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
}

.pagination {
  display: flex;
  gap: 0.3rem;
}

.page-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-family: inherit;
}
.page-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}
.page-btn.active {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
