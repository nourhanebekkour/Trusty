<template>
  <div class="section">

    <!-- Section header -->
    <div class="section-header">
      <span class="section-title">Liste des expériences</span>
      <div class="section-actions">
        <button class="filter-btn" @click="store.showFilter = !store.showFilter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <line x1="4" y1="6" x2="11" y2="6"/>
            <line x1="4" y1="12" x2="17" y2="12"/>
            <line x1="4" y1="18" x2="23" y2="18"/>
          </svg>
          Filtrer
        </button>
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
      <button class="filter-btn" @click="store.chargerStages">Réessayer</button>
    </div>

    <!-- Cards -->
    <div v-else class="cards-grid">
      <div
        v-for="stage in store.stagesPagines"
        :key="stage.id_stage"
        class="stage-card"
      >
        <!-- Card header: badges + actions -->
        <div class="card-header-top">
          <div class="badges">
            <span class="badge badge-type">
              <span class="badge-dot"></span>
              Stage
            </span>
            <span class="badge" :class="badgeClass(stage.status_validation)">
              <span class="badge-dot"></span>
              {{ labelStatut(stage.status_validation) }}
            </span>
          </div>
          <div class="card-actions">
            <button class="action-btn" title="Modifier" @click.stop="$emit('edit', stage)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn danger" title="Supprimer" @click.stop="$emit('delete', stage)">
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
        <div class="card-body" @click="$emit('voir', stage)">

          <!-- Hero row: avatar + name + company + status -->
          <div class="card-hero">
            <div class="card-avatar" :style="{ background: logoColor(stage.entreprise) }">
              {{ initiales(stage.entreprise) }}
            </div>
            <div class="card-hero-info">
              <h3 class="card-company">{{ stage.entreprise }}</h3>
              <p class="card-poste">{{ stage.poste }}</p>
            </div>
          </div>

          <div class="card-separator"></div>

          <!-- Fields -->
          <div class="card-fields">

            <div class="field-row">
              <span class="field-label">📅 Du</span>
              <span class="field-value">{{ formatDate(stage.date_debut) }}</span>
              <span class="field-label">au</span>
              <span class="field-value">{{ stage.date_fin ? formatDate(stage.date_fin) : '—' }}</span>
              <span v-if="stage.duree_semaines" class="field-duree">{{ stage.duree_semaines }} sem.</span>
            </div>

            <div v-if="stage.adresse_entreprise" class="field-row">
              <span class="field-label">📍 Lieu</span>
              <span class="field-value">{{ stage.adresse_entreprise }}</span>
            </div>

            <div class="field-row">
              <span class="field-label">👤 Tuteur professionnel</span>
              <span class="field-value">{{ stage.encadrant_professionnel || '—' }}</span>
            </div>

            <div class="field-row">
              <span class="field-label">👤 Tuteur académique</span>
              <span class="field-value">{{ stage.encadrant_academique || '—' }}</span>
            </div>

            <!-- Missions expandable -->
            <div class="field-row field-row--col">
              <div class="field-label-row">
                <span class="field-label">📋 Missions</span>
                <button
                  v-if="stage.missions && stage.missions.length > 100"
                  class="expand-btn"
                  @click.stop="toggleMissions(stage.id_stage)"
                >
                  {{ expandedMissions.has(stage.id_stage) ? 'Réduire' : 'Développer' }}
                </button>
              </div>
              <p class="field-text">
                {{ expandedMissions.has(stage.id_stage) || !stage.missions || stage.missions.length <= 100
                  ? stage.missions || '—'
                  : stage.missions.slice(0, 100) + '…'
                }}
              </p>
            </div>

            <!-- Technologies -->
            <div v-if="getTechnologies(stage).length" class="field-row field-row--col">
              <span class="field-label">🛠️ Technologies</span>
              <div class="tech-tags">
                <span v-for="tech in getTechnologies(stage)" :key="tech.id_technologie" class="tech-tag">
                  <span>{{ techEmoji(tech) }}</span>
                  <span>{{ tech.nom }}</span>
                  <span v-if="tech.version" class="tech-version">v{{ tech.version }}</span>
                  <span class="tech-lvl" :class="techNiveauClass(tech.niveau_utilisation)">
                    {{ techNiveauLabel(tech.niveau_utilisation) }}
                  </span>
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Card footer -->
        <div class="card-footer">
          <label class="footer-btn upload-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Joindre une attestation
            <input type="file" hidden accept=".pdf,image/*" />
          </label>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!store.loading && store.stagesFiltres.length === 0" class="empty-card">
        Aucun stage trouvé.
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
      <span class="pagination-info">
        Affichage de {{ store.stagesPagines.length }} stages sur {{ store.stagesFiltres.length }} au total
      </span>
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
import { ref } from 'vue'
import { useStageStore, initiales, logoColor, formatDate, badgeClass, labelStatut } from '@/stores/stageStore'

const store = useStageStore()

defineEmits(['voir', 'edit', 'delete'])

const expandedMissions = ref(new Set())

function toggleMissions(id) {
  const s = new Set(expandedMissions.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expandedMissions.value = s
}

function getTechnologies(stage) {
  const techs = stage.technologies ?? []
  return techs.map(t => ({
    id_technologie:     t.id_technologie,
    nom:                t.nom ?? t.technologie?.nom ?? '',
    categorie:          t.categorie ?? t.technologie?.categorie ?? '',
    version:            t.version ?? '',
    niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
  }))
}

function techEmoji(tech) {
  const map = {
    FRONTEND: '🎨', BACKEND: '⚙️', DATABASE: '🗄️',
    DEVOPS: '🚀', MOBILE: '📱', IA: '🤖', AI: '🤖',
    SECURITE: '🔒', CLOUD: '☁️', TESTING: '🧪',
    DESIGN: '✏️', AUTRE: '🔧',
  }
  return map[(tech.categorie || '').toUpperCase()] ?? '🔧'
}

function techNiveauClass(n) {
  return { DEBUTANT: 'lvl-green', INTERMEDIAIRE: 'lvl-yellow', AVANCE: 'lvl-orange', EXPERT: 'lvl-red' }[n] ?? ''
}

function techNiveauLabel(n) {
  return { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé', EXPERT: 'Expert' }[n] ?? n
}
</script>

<style scoped>
/* ── Section ── */
.section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #D6EDE8;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  background: transparent;
  border: 1px solid rgba(214, 237, 232, 0.2);
  border-radius: 8px;
  color: #D6EDE8;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: rgba(214, 237, 232, 0.35);
  background: rgba(214, 237, 232, 0.05);
}

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 12px;
}

.filter-select,
.filter-input {
  background: rgba(13, 43, 43, 0.6);
  border: 1px solid rgba(214, 237, 232, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: #D6EDE8;
  font-family: inherit;
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  border-color: rgba(92, 140, 106, 0.5);
}

.filter-select option { background: #1A3838; }
.filter-input { flex: 1; }

/* ── Loading / Error ── */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
  color: rgba(214, 237, 232, 0.4);
  font-size: 0.85rem;
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 14px;
}

.spinner {
  width: 36px; height: 36px;
  border: 2px solid rgba(214, 237, 232, 0.1);
  border-top-color: #5C8C6A;
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

/* ── Stage Card ── */
.stage-card {
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: border-color 0.25s, transform 0.25s;
  position: relative;
  overflow: hidden;
}

.stage-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #5C8C6A;
  border-radius: 4px 0 0 4px;
}

.stage-card:hover {
  border-color: rgba(214, 237, 232, 0.2);
  transform: translateY(-2px);
}

/* ── Card Header (badges + actions) ── */
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
  background: rgba(92, 140, 106, 0.2);
  color: #7dc494;
}
.badge-type .badge-dot { background: #7dc494; }

/* statut badges (reuse classes from Activités style) */
.badge--valide {
  background: rgba(92, 140, 106, 0.18);
  color: #5C8C6A;
}
.badge--valide .badge-dot { background: #5C8C6A; }

.badge--attente {
  background: rgba(232, 160, 74, 0.15);
  color: #e8a04a;
}
.badge--attente .badge-dot {
  background: #e8a04a;
  animation: pulseDot 1.8s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.75); }
}

.badge--cours {
  background: rgba(74, 158, 196, 0.15);
  color: #4a9ec4;
}
.badge--cours .badge-dot { background: #4a9ec4; }

.badge--rejete {
  background: rgba(196, 90, 90, 0.15);
  color: #c45a5a;
}
.badge--rejete .badge-dot { background: #c45a5a; }

.card-actions {
  display: flex;
  gap: 0.4rem;
}

.action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: rgba(214, 237, 232, 0.05);
  border: 1px solid rgba(214, 237, 232, 0.1);
  color: rgba(214, 237, 232, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(214, 237, 232, 0.1);
  color: #D6EDE8;
}

.action-btn.danger:hover {
  background: rgba(196, 90, 90, 0.15);
  border-color: rgba(196, 90, 90, 0.3);
  color: #c45a5a;
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
  color: #fff;
  flex-shrink: 0;
}

.card-hero-info {
  flex: 1;
  min-width: 0;
}

.card-company {
  font-size: 1.1rem;
  font-weight: 700;
  color: #D6EDE8;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-poste {
  font-size: 0.82rem;
  color: rgba(214, 237, 232, 0.5);
  margin: 0.1rem 0 0;
}

.card-separator {
  height: 1px;
  background: rgba(214, 237, 232, 0.08);
  margin-bottom: 0.85rem;
}

/* ── Fields ── */
.card-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: rgba(214, 237, 232, 0.75);
}

.field-row--col {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}

.field-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(214, 237, 232, 0.35);
  text-transform: uppercase;
  flex-shrink: 0;
}

.field-value {
  color: #D6EDE8;
}

.field-duree {
  font-size: 0.7rem;
  font-weight: 600;
  color: #5C8C6A;
  background: rgba(92, 140, 106, 0.12);
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  margin-left: 0.25rem;
}

.field-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.expand-btn {
  background: none;
  border: none;
  color: #5C8C6A;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  transition: background 0.15s;
  margin-left: auto;
}

.expand-btn:hover {
  background: rgba(92, 140, 106, 0.1);
}

.field-text {
  font-size: 0.82rem;
  color: rgba(214, 237, 232, 0.55);
  line-height: 1.55;
  margin: 0;
  padding: 0;
}

/* ── Tech tags ── */
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tech-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  background: rgba(214, 237, 232, 0.05);
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 12px;
  font-size: 0.72rem;
  color: rgba(214, 237, 232, 0.6);
}

.tech-version {
  font-size: 0.6rem;
  color: rgba(214, 237, 232, 0.3);
}

.tech-lvl {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.05rem 0.35rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.lvl-green  { background: rgba(92, 140, 106, 0.15); color: #7dc494; }
.lvl-yellow { background: rgba(232, 160, 74, 0.15); color: #e8a04a; }
.lvl-orange { background: rgba(217, 72, 31, 0.15);  color: #f07a4a; }
.lvl-red    { background: rgba(196, 90, 90, 0.12);  color: #c45a5a; }

/* ── Card Footer ── */
.card-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.75rem;
  margin-top: 0.85rem;
  border-top: 1px solid rgba(214, 237, 232, 0.06);
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  border: 1px solid rgba(214, 237, 232, 0.12);
  background: rgba(214, 237, 232, 0.05);
  color: rgba(214, 237, 232, 0.6);
}

.footer-btn:hover {
  background: rgba(214, 237, 232, 0.1);
  color: #D6EDE8;
}

.upload-btn { cursor: pointer; }

/* ── Empty card ── */
.empty-card {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: rgba(214, 237, 232, 0.25);
  font-size: 0.9rem;
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 14px;
}

/* ── Pagination ── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 12px;
}

.pagination-info {
  font-size: 0.78rem;
  color: rgba(214, 237, 232, 0.4);
}

.pagination {
  display: flex;
  gap: 0.3rem;
}

.page-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(214, 237, 232, 0.1);
  background: transparent;
  color: rgba(214, 237, 232, 0.5);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-family: inherit;
}
.page-btn:hover {
  background: rgba(214, 237, 232, 0.08);
  color: #D6EDE8;
}
.page-btn.active {
  background: rgba(92, 140, 106, 0.25);
  border-color: #5C8C6A;
  color: #D6EDE8;
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
