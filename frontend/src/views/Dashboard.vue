<template>
  <div class="dashboard-page">

    <!-- ────────────────── Header ────────────────── -->
    <header class="page-header">
      <div class="page-header__left">
        <div class="page-header__title">
          <h1 class="page-title">Tableau de Bord Étudiant</h1>
          <img
            src="@/assets/icons/trusty.svg"
            class="icon icon--md"
            alt=""
          />
        </div>
        <p class="page-subtitle">
          Gérez vos réalisations et contrôlez votre présence professionnelle.
        </p>
      </div>
    </header>

    <!-- ────────────────── Stats ────────────────── -->
    <div class="stats-grid">
      <div
        v-for="item in statItems"
        :key="item.key"
        class="stat-card"
      >
        <img :src="item.icon" class="icon icon--md" alt="" />
        <div class="stat-card__content">
          <p class="stat-card__label">{{ item.label }}</p>
          <p v-if="stats" class="stat-card__value">
            {{ stats[item.key] }}{{ item.suffix }}
          </p>
          <div v-else class="skeleton skeleton--value" />
        </div>
      </div>
    </div>

    <!-- ────────────────── Portfolio ────────────────── -->
    <section class="section">
      <div class="section__header">
        <h2 class="section__title">Mon Portfolio Numérique</h2>
        <div class="section__actions">
          <button class="btn btn--ghost">Filtres</button>
          <button class="btn btn--ghost btn--ghost-accent">Trier par date</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingProjects" class="project-grid">
        <div v-for="n in 6" :key="n" class="project-card">
          <div class="skeleton skeleton--short" />
          <div class="skeleton skeleton--full" />
          <div class="skeleton skeleton--short" />
          <div class="skeleton skeleton--full" />
          <div class="skeleton skeleton--full" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="projects.length === 0" class="empty-state">
        <img src="@/assets/icons/projets.svg" class="icon icon--lg" alt="" />
        <p class="empty-state__title">Aucun projet pour le moment</p>
        <p class="empty-state__sub">
          Ajoutez votre premier projet pour commencer à construire votre portfolio.
        </p>
        <button
          class="btn btn--primary"
          @click="$router.push('/projets')"
        >
          + Ajouter un projet
        </button>
      </div>

      <!-- Project grid -->
      <div v-else class="project-grid">
        <div
          v-for="project in projects"
          :key="project.id_projet"
          class="project-card"
          :class="getProjectCardClass(project.status_validation)"
          @click="$router.push(`/projets/${project.id_projet}`)"
        >
          <div class="project-card__header">
            <span class="badge badge--type">{{ project.type_projet }}</span>
            <span
              class="badge badge--status"
              :class="getStatusBadgeClass(project.status_validation)"
            >
              <img
                v-if="project.status_validation === 'VALIDE'"
                src="@/assets/icons/trusty.svg"
                class="icon icon--xs"
                alt=""
              />
              <span v-else class="badge__dot" />
              {{ formatStatut(project.status_validation) }}
            </span>
          </div>

          <h3 class="project-card__title">{{ project.titre }}</h3>
          <p class="project-card__date">{{ formatDate(project.date_debut) }}</p>
          <p class="project-card__description">{{ project.description }}</p>

          <div class="project-card__footer">
            <div class="project-card__icons">
              <img src="@/assets/icons/profile.svg"  class="icon icon--xs" alt="visibilité" />
              <img src="@/assets/icons/reseaux.svg"  class="icon icon--xs" alt="partage" />
              <img src="@/assets/icons/settings.svg" class="icon icon--xs" alt="accès" />
              <span
                v-for="tech in project.technologies"
                :key="tech.id_technologie"
                class="tag"
              >
                {{ tech.technologie.nom }}
              </span>
            </div>
            <button
              class="btn btn--link"
              @click.stop="$router.push(`/projets/${project.id_projet}`)"
            >
              Détails ↗
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ────────────────── Recommandations ────────────────── -->
    <section class="section section--spaced">
      <div class="section__header">
        <div class="section__title-row">
          <img src="@/assets/icons/recommandations.svg" class="icon icon--md" alt="" />
          <h2 class="section__title">Flux de Recommandations</h2>
        </div>
        <button
          class="btn btn--ghost"
          @click="$router.push('/recommendations')"
        >
          Tout voir
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingRecos" class="reco-featured">
        <div class="reco-featured__bar" />
        <div class="reco-featured__body">
          <div class="skeleton skeleton--full" />
          <div class="skeleton skeleton--full" />
          <div class="skeleton skeleton--short" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="recommandations.length === 0" class="empty-state empty-state--compact">
        <img src="@/assets/icons/recommandations.svg" class="icon icon--lg" alt="" />
        <p class="empty-state__title">Aucune recommandation pour le moment</p>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Featured -->
        <div class="reco-featured">
          <div class="reco-featured__bar" />
          <div class="reco-featured__body">
            <p class="reco-featured__quote-icon">❝❝</p>
            <p class="reco-featured__text">
              {{ recommandations[0].message }}
            </p>
            <div class="author">
              <div class="author__avatar">
                {{ getInitials(recommandations[0].auteur?.nom, recommandations[0].auteur?.prenom) }}
              </div>
              <div class="author__info">
                <p class="author__name">
                  {{ recommandations[0].auteur?.prenom }} {{ recommandations[0].auteur?.nom }}
                </p>
                <p class="author__role">{{ recommandations[0].auteur?.poste }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini cards -->
        <div v-if="recommandations.length > 1" class="reco-grid">
          <div
            v-for="reco in recommandations.slice(1, 3)"
            :key="reco.id_recommandation"
            class="reco-card"
          >
            <div class="reco-card__header">
              <div class="author">
                <div class="author__avatar author__avatar--sm">
                  {{ getInitials(reco.auteur?.nom, reco.auteur?.prenom) }}
                </div>
                <div class="author__info">
                  <p class="author__name">
                    {{ reco.auteur?.prenom }} {{ reco.auteur?.nom }}
                    <span class="text-muted"> • {{ reco.auteur?.poste }}</span>
                  </p>
                </div>
              </div>
              <span class="reco-card__repost">Repost</span>
            </div>
            <p class="reco-card__text">{{ reco.message }}</p>
          </div>
        </div>
      </template>
    </section>

    <!-- ────────────────── CTA ────────────────── -->
    <div class="cta-banner">
      <div class="cta-banner__content">
        <p class="cta-banner__title">Prêt à partager ?</p>
        <p class="cta-banner__subtitle">
          Générez un lien unique vers votre portfolio complet certifié TRUSTY
          pour vos candidatures. Choisissez quels éléments montrer en un clic.
        </p>
      </div>
      <div class="cta-banner__actions">
        <button
          class="btn btn--outline-accent"
          @click="$router.push('/portfolio/apercu')"
        >
          Aperçu Public
        </button>
        <button class="btn btn--outline-accent" @click="generateUrl">
          Générer mon URL Certifiée
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

import iconProjets         from '@/assets/icons/trusty.svg'
import iconDashboard       from '@/assets/icons/certifie.svg'
import iconProfile         from '@/assets/icons/eye.svg'
import iconRecommandations from '@/assets/icons/share.svg'

// ── State ───────────────────────────────────────────────────────────
const stats           = ref(null)
const projects        = ref([])
const recommandations = ref([])
const loadingProjects = ref(true)
const loadingRecos    = ref(true)

// ── Config stats ────────────────────────────────────────────────────
const statItems = [
  { key: 'projetsCertifies',  label: 'PROJETS CERTIFIÉS',     suffix: '',     icon: iconProjets         },
  { key: 'score_credibilite', label: 'CRÉDIBILITÉ PORTFOLIO',  suffix: '/100', icon: iconDashboard       },
  { key: 'nombre_vues',       label: 'VUES PROFIL (30J)',      suffix: '',     icon: iconProfile         },
  { key: 'nombre_recommandations', label: 'RECOMMANDATIONS',  suffix: '',     icon: iconRecommandations },
]

// ── API calls ───────────────────────────────────────────────────────
async function fetchStats() {
  try {
    const response = await api.get('/dashboard/stats')
    stats.value = response.data
  } catch {
    // skeleton reste affiché
  }
}

async function fetchProjects() {
  try {
    const response = await api.get('/projets')
    projects.value = Array.isArray(response.data) ? response.data : []
  } catch {
    projects.value = []
  } finally {
    loadingProjects.value = false
  }
}

async function fetchRecos() {
  try {
    const response = await api.get('/recommandations')
    recommandations.value = Array.isArray(response.data) ? response.data : []
  } catch {
    recommandations.value = []
  } finally {
    loadingRecos.value = false
  }
}

async function generateUrl() {
  try {
    const response = await api.post('/portfolio/generer-url')
    await navigator.clipboard.writeText(response.data.url_publique)
    alert('URL copiée dans le presse-papiers !')
  } catch {
    alert("Impossible de générer l'URL pour le moment.")
  }
}

// ── Helpers ─────────────────────────────────────────────────────────
function getStatusBadgeClass(statut) {
  const map = {
    'VALIDE':     'badge--status-ok',
    'EN_ATTENTE': 'badge--status-wait',
  }
  return map[statut] ?? ''
}

function getProjectCardClass(statut) {
  const map = {
    'EN_ATTENTE': 'project-card--pending',
  }
  return map[statut] ?? ''
}

function formatStatut(statut) {
  const map = {
    'VALIDE':     'Certifié',
    'EN_ATTENTE': 'En attente',
    'REJETE':     'Rejeté',
  }
  return map[statut] ?? statut
}

function getInitials(nom = '', prenom = '') {
  const first  = prenom?.[0] ?? ''
  const second = nom?.[0]    ?? ''
  return (first + second).toUpperCase()
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    month: 'long',
    year:  'numeric',
  })
}

// ── Init ─────────────────────────────────────────────────────────────
onMounted(() => {
  fetchStats()
  fetchProjects()
  fetchRecos()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Design tokens ──────────────────────────────────────────────── */
:root {
  --color-background: #EDEADE;
  --color-surface:    #F4F2EC;
  --color-mint:       #D6EDE8;
  --color-olive:      #5C8C6A;
  --color-olive-dark: #4a7358;
  --color-text:       #D6EDE8;
  --color-text-muted: #D6EDE8;
  --color-text-body:  #D6EDE8;
  --color-border:     rgba(0, 0, 0, 0.08);
  --shadow-card:      0 1px 8px rgba(0, 0, 0, 0.06);
  --radius-card:      10px;
  --radius-btn:       8px;
  --color: #D6EDE8;
}

/* ── Base ───────────────────────────────────────────────────────── */
/* Dans votre style scoped */
.dashboard-page {
  font-family: 'Inter', sans-serif;
  color: #D6EDE8;
  
  /* MODIFICATIONS ICI */
  padding: 24px 20px 60px; /* Réduit le padding de 32px 40px à 24px 20px */
  max-width: 100%;         /* Supprime la limite de 1080px */
  margin: 0;               /* Supprime le "auto" qui centre le bloc */
  
  min-height: 100vh;
  background-color: #0D2B2B;
}

/* ── Icons ──────────────────────────────────────────────────────── */
.icon { opacity: 0.65; flex-shrink: 0; }
.icon--xs { width: 14px; height: 14px; }
.icon--md { width: 22px; height: 22px;  }
.icon--lg { width: 44px; height: 44px; opacity: 0.35; }

/* ── Buttons ────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-btn);
  padding: 9px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.15s, transform 0.15s;
}

.btn--primary {
  top: 68px;
  left: 968px;
  width: 176px;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Roboto;
  font-size: 14px;
  line-height: 22px;
  font-weight: 700;
  color: #FFFFFFFF;
  background: #5C8C6A;
  opacity: 1;
  border-radius: 10px;
  border-width: 0px;
  border-color: #000000FF;
  border-style: solid;
  box-shadow: 0px 2px 4px #0000000F, 0px 0px 0px #171a1f00;
  gap: 8px;
}

.btn--primary:hover {
  background-color: #D6EDE8;
  color: #3D3D3D;
}

.btn--ghost {
  background-color: #1A3838;
  color: #D6EDE8;
  border-color:#1A3838;
  top: 247px; 
  left: 977px; 
   
  height: 36px; 
  padding: 0 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-family: Roboto; 
  font-size: 12px; 
  line-height: 20px; 
  font-weight: 500; 
  opacity: 1; 
  border-radius: 10px; 
  border-width: 1px;  
  border-style: solid;
}
.btn--ghost:hover {
  background-color: var(--color-mint);
}
.btn--ghost-accent {
  top: 247px; 
  left: 1045px; 
  width: 99px; 
  height: 36px; 
  padding: 0 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-family: Roboto; 
  font-size: 12px; 
  line-height: 20px; 
  font-weight: 700; 
  color: #D6EDE8; 
  background: #1A3838;
  opacity: 1; 
  border-radius: 10px; 
  border-width: 1px; 
  border-color:#1A3838; 
  border-style: solid;
}

.btn--outline-accent {
  top: 51px; 
  left: 735px; 
  height: 40px; 
  padding: 0 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-family: Roboto; 
  font-size: 14px; 
  line-height: 22px; 
  font-weight: 500; 
  color: #3D3D3D; 
  background: transparent; 
  opacity: 1; 
  border-radius: 10px; 
  border-width: 2px; 
  border-color: #3D3D3D; 
  border-style: solid; 
}

.btn--outline-accent:hover {
  background-color: #5c5b5b;
}

.btn--link {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-olive);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* ── Page header ────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  /* Optionnel : ajoutez un léger padding-left si c'est trop collé au bord */
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

/* ── Stats ──────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
  
}

.stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  background-color: #3D3D3D;
  border-radius: 4px;
}

.stat-card__label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin: 0 0 4px;
}

.stat-card__value {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

/* ── Sections ───────────────────────────────────────────────────── */
.section { margin: 0; }
.section--spaced { margin-top: 36px; }

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section__title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}

.section__actions {
  display: flex;
  gap: 8px;
}

/* ── Project grid ───────────────────────────────────────────────── */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

/* ── Project card ───────────────────────────────────────────────── */
.project-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 18px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.18s, box-shadow 0.18s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.project-card--pending  { border-color: rgba(214, 179, 100, 0.35); }
.project-card--progress { border-color: rgba(92, 140, 106, 0.35); }

.project-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 4px 0 0;
  line-height: 1.3;
}

.project-card__date {
  font-size: 0.73rem;
  color: var(--color-text-muted);
  margin: 0;
}

.project-card__description {
  font-size: 0.8rem;
  color: var(--color-text-body);
  line-height: 1.55;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}

.project-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.project-card__icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Badges ─────────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.badge--type {
  color: var(--color-olive);
  background-color: rgba(92, 140, 106, 0.1);
}

.badge--status { font-size: 0.72rem; }
.badge--status-ok       { background-color: rgba(214, 237, 232, 0.9); color: #3a6e54; }
.badge--status-wait     { background-color: rgba(245, 220, 130, 0.3); color: #8a6a10; }
.badge--status-progress { background-color: rgba(92, 140, 106, 0.15); color: var(--color-olive); }

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  display: inline-block;
}

/* ── Tag ────────────────────────────────────────────────────────── */
.tag {
  font-size: 0.68rem;
  font-weight: 600;
  background-color: var(--color-mint);
  color: #D6EDE8;
  border-radius: 5px;
  padding: 1px 7px;
}

/* ── Skeleton ───────────────────────────────────────────────────── */
.skeleton {
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    var(--color-mint) 25%,
    #e8f5f1 50%,
    var(--color-mint) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  margin-bottom: 8px;
  height: 14px;
}
.skeleton--value { width: 60px; height: 28px; }
.skeleton--short { width: 50%; }
.skeleton--full  { width: 100%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty state ────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 44px;
  background-color: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
  text-align: center;
}

.empty-state--compact { padding: 24px; }

.empty-state__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.empty-state__sub {
  font-size: 0.83rem;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 340px;
}

/* ── Recommandations ────────────────────────────────────────────── */
.reco-featured {
  display: flex;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: 14px;
}

.reco-featured__bar {
  width: 4px;
  background-color: var(--color-olive);
  flex-shrink: 0;
}

.reco-featured__body {
  padding: 24px 28px;
  flex: 1;
}

.reco-featured__quote-icon {
  font-size: 2rem;
  color: var(--color-mint);
  margin: 0 0 8px;
  line-height: 1;
}

.reco-featured__text {
  font-style: italic;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0 0 18px;
}

.reco-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.reco-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 14px 18px;
  box-shadow: var(--shadow-card);
}

.reco-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reco-card__text {
  font-size: 0.8rem;
  color: var(--color-text-body);
  line-height: 1.5;
  margin: 0;
}

.reco-card__repost {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 2px 7px;
  cursor: pointer;
}

/* ── Author ─────────────────────────────────────────────────────── */
.author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-olive);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author__avatar--sm {
  width: 34px;
  height: 34px;
  font-size: 0.75rem;
}

.author__name {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}

.author__role {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

.text-muted {
  font-weight: 400;
  color: var(--color-text-muted);
}

/* ── CTA Banner ─────────────────────────────────────────────────── */
.cta-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background-color: #5C8C6A;
  border-radius: 4px;
  padding: 24px 32px;
  margin-top: 36px;
}

.cta-banner__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-olive);
  margin: 0 0 6px;
}

.cta-banner__subtitle {
  font-size: 0.8rem;
  color: #4a7a6a;
  margin: 0;
  line-height: 1.5;
  max-width: 480px;
}

.cta-banner__actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .project-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-grid   { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 580px) {
  .dashboard-page { padding: 20px 16px 40px; }
  .project-grid   { grid-template-columns: 1fr; }
  .reco-grid      { grid-template-columns: 1fr; }
  .stats-grid     { grid-template-columns: repeat(2, 1fr); }
  .cta-banner     { flex-direction: column; }
  .cta-banner__actions { width: 100%; flex-direction: column; }
  .page-header    { flex-direction: column; gap: 12px; }
}
</style>