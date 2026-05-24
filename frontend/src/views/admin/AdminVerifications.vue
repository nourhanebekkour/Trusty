<template>
  <div class="page">

    <div class="page__header">
      <div>
        <h1 class="page__title">Vérifications</h1>
        <p class="page__subtitle">Gestion de la file d'attente des portfolios soumis pour certification officielle.</p>
      </div>
      <span class="last-update">Dernière mise à jour : {{ lastUpdate }}</span>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <StatCard label="En attente"      value="12">
        <template #icon>🕐</template>
      </StatCard>
      <StatCard label="Certifiés ce jour" value="45" trend="↑ +8% vs hier" trend-color="green">
        <template #icon>✅</template>
      </StatCard>
      <StatCard label="Qualité moyenne"  value="4.8/5">
        <template #icon>⭐</template>
      </StatCard>
    </div>

    <!-- Queue header -->
    <div class="queue-header">
      <div class="queue-header__left">
        <span class="queue-header__icon">📋</span>
        <strong>File d'attente prioritaire</strong>
      </div>
      <div class="queue-header__right">
        <div class="filter-tabs">
          <button
            v-for="tab in ['Tout', 'Priorité', 'Urgent']"
            :key="tab"
            :class="['tab', { 'tab--active': activeTab === tab }]"
            @click="activeTab = tab"
          >{{ tab }}</button>
        </div>
        <span class="text-muted">Affichage de {{ displayedItems.length }} sur {{ portfolios.length }} portfolios</span>
      </div>
    </div>

    <!-- Portfolio cards -->
    <div class="portfolio-list">
      <div v-for="portfolio in displayedItems" :key="portfolio.id" class="portfolio-card">
        <div class="portfolio-card__thumbnail">
          <div class="thumbnail-placeholder">📄</div>
          <span class="status-pill">En attente</span>
        </div>

        <div class="portfolio-card__body">
          <div class="portfolio-card__header">
            <div>
              <h3 class="portfolio-card__title">{{ portfolio.title }}</h3>
              <div class="portfolio-card__meta">
                <div class="avatar-sm">{{ initials(portfolio.author) }}</div>
                <span>Soumis par <strong>{{ portfolio.author }}</strong></span>
                <span class="text-muted">• {{ portfolio.timeAgo }}</span>
              </div>
            </div>
            <button class="btn btn--icon">•••</button>
          </div>

          <p class="portfolio-card__desc">{{ portfolio.description }}</p>

          <div class="portfolio-card__notes">
            <label class="notes-label">📝 NOTES INTERNES (OPTIONNEL)</label>
            <textarea
              v-model="portfolio.internalNote"
              placeholder="Rédiger une remarque pour l'étudiant ou l'équipe admin..."
              maxlength="1000"
            />
            <span class="char-counter">{{ (portfolio.internalNote || '').length }} / 1000</span>
          </div>

          <div class="portfolio-card__actions">
            <button class="btn btn--secondary btn--sm">👁 Consulter</button>
            <button class="btn btn--secondary btn--sm">↗ Ouvrir</button>
            <button class="btn btn--ghost btn--sm">↩ Demander corrections</button>
            <button class="btn btn--primary btn--sm" @click="certify(portfolio.id)">✓ Certifier le Portfolio</button>
          </div>
        </div>
      </div>
    </div>

    <div class="load-more">
      <button class="btn btn--secondary">Charger plus de demandes 🔄</button>
    </div>

    <!-- Info bottom -->
    <div class="info-grid">
      <div class="info-card">
        <strong>✅ Critères de Certification</strong>
        <ul>
          <li>Minimum de 3 projets validés par un professeur référent.</li>
          <li>Description complète de chaque compétence listée.</li>
          <li>Identité vérifiée (Profil étudiant complet).</li>
          <li>Liens externes fonctionnels (GitHub, LinkedIn, Prototypes).</li>
        </ul>
      </div>
      <div class="info-card">
        <strong>🔒 Impact du Sceau Admin</strong>
        <p>Une fois certifié, le portfolio apparaît avec un badge officiel "Vérifié par CertiFolio" dans la consultation publique, augmentant la visibilité de l'étudiant auprès des recruteurs de 85%.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '../../components/ui/StatCard.vue'
import { useAuthStore } from '../../stores/authstore'

const authStore = useAuthStore()
const router    = useRouter()

const activeTab  = ref('Tout')
const lastUpdate = ref('14:32')

const portfolios = ref([
  {
    id: 1,
    title: 'Portfolio Master Architecture Cloud',
    author: 'Lucas Bernard',
    timeAgo: 'Il y a 2 heures',
    priority: 'Tout',
    internalNote: '',
    description: "Ce portfolio présente des projets d'infrastructure scalables réalisés durant mon alternance chez AWS. Il inclut des diagrammes d'architecture complexes, des scripts Terraform et une étude de cas sur la migration d'un monolithe vers les microservices.",
  },
  {
    id: 2,
    title: 'Showcase Design UI/UX - Mobile First',
    author: 'Emma Lefebvre',
    timeAgo: 'Il y a 5 heures',
    priority: 'Priorité',
    internalNote: '',
    description: "Sélection de 4 prototypes d'applications mobiles centrées sur l'accessibilité. Focus particulier sur le design system 'Harmony' créé pour une startup de fintech. Utilisation poussée de Figma et tests utilisateurs documentés.",
  },
  {
    id: 3,
    title: 'Développeur Fullstack React & Node.js',
    author: 'Thomas Morel',
    timeAgo: 'Hier',
    priority: 'Tout',
    internalNote: '',
    description: "Regroupe mes contributions Open Source et 3 projets majeurs : un CRM pour PME, une application de gestion de stock en temps réel et un moteur de recherche indexé. Technologies : React, Tailwind, PostgreSQL.",
  },
  {
    id: 4,
    title: 'Analyse de Données et IA Appliquée',
    author: 'Julie Dubois',
    timeAgo: 'Il y a 2 jours',
    priority: 'Urgent',
    internalNote: '',
    description: "Projets de Data Science utilisant Python (Pandas, Scikit-learn). Un projet notable sur la prédiction des flux logistiques pour un transporteur local utilisant des modèles de séries temporelles.",
  },
])

const displayedItems = computed(() => {
  if (activeTab.value === 'Tout') return portfolios.value
  return portfolios.value.filter(p => p.priority === activeTab.value)
})

//sanitisation de la note interne ───────────
function sanitizeNote(note) {
  return (note || '').trim().replace(/[<>"'`]/g, '').slice(0, 1000)
}

//confirmation avant certification ───────────
function certify(id) {
  if (!confirm('Confirmer la certification de ce portfolio ? Cette action est visible publiquement.')) return
  const portfolio = portfolios.value.find(p => p.id === id)
  if (!portfolio) return
  // Note sanitisée prête pour l'envoi API
  const noteClean = sanitizeNote(portfolio.internalNote)
  // Prêt pour : await admin.certifyPortfolio(id, { internalNote: noteClean })
  portfolios.value = portfolios.value.filter(p => p.id !== id)
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── Guard de rôle ─────────────────────────────────────────
onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'ADMIN') {
    router.replace('/login')
  }
})
</script>

<style scoped>
.page          { padding: 32px; }
.page__header  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title   { font-size: 24px; font-weight: 700; color: #D6EDE8; }
.page__subtitle{ font-size: 14px; color: #8aada9; margin-top: 4px; }
.last-update   { font-size: 13px; color: #4a6e6a; align-self: flex-end; }

.stats-row { display: flex; gap: 16px; margin-bottom: 24px; }

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.queue-header__left { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; color: #D6EDE8; }
.queue-header__right { display: flex; align-items: center; gap: 16px; }

.filter-tabs { display: flex; gap: 4px; }
.tab { padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid #2a4a48; background: #1A3838; color: #8aada9; transition: all 0.15s; }
.tab--active { background: #5C8C6A; color: #fff; border-color: #5C8C6A; }
.tab:hover:not(.tab--active) { background: #162e2e; }

.portfolio-list { display: flex; flex-direction: column; gap: 16px; }

.portfolio-card {
  display: flex;
  background: #1A3838;
  border: 1px solid #2a4a48;
  border-radius: 12px;
  overflow: hidden;
}
.portfolio-card__thumbnail {
  width: 180px;
  min-width: 180px;
  background: #1a2e2a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.thumbnail-placeholder { font-size: 40px; opacity: 0.4; }
.status-pill {
  position: absolute;
  top: 10px; left: 10px;
  background: #fef9c3;
  color: #ca8a04;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 9999px;
}

.portfolio-card__body { flex: 1; padding: 20px; }
.portfolio-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.portfolio-card__title  { font-size: 16px; font-weight: 600; color: #D6EDE8; margin-bottom: 6px; }
.portfolio-card__meta   { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #c8deda; }
.portfolio-card__desc   { font-size: 13px; color: #8aada9; line-height: 1.5; margin-bottom: 14px; }

.portfolio-card__notes  { margin-bottom: 14px; }
.notes-label { font-size: 11px; font-weight: 700; color: #4a6e6a; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #2a4a48;
  border-radius: 8px;
  font-size: 13px;
  color: #c8deda;
  resize: vertical;
  min-height: 60px;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
textarea:focus { border-color: #5C8C6A; }
textarea::placeholder { color: #4a6e6a; }

/* compteur de caractères */
.char-counter {
  font-size: 11px;
  color: #4a6e6a;
  display: block;
  text-align: right;
  margin-top: 4px;
}

.portfolio-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }

.avatar-sm { width: 20px; height: 20px; border-radius: 50%; background: #5C8C6A; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

.load-more { text-align: center; margin: 24px 0; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
.info-card { background: #1A3838; border: 1px solid #2a4a48; border-radius: 12px; padding: 20px; }
.info-card strong { font-size: 14px; color: #D6EDE8; display: block; margin-bottom: 10px; }
.info-card ul { padding-left: 16px; font-size: 13px; color: #8aada9; line-height: 1.8; }
.info-card p  { font-size: 13px; color: #8aada9; line-height: 1.5; }

.text-muted { color: #4a6e6a; font-size: 13px; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary   { background: #5C8C6A; color: #fff; }
.btn--primary:hover { background: #4a7058; }
.btn--secondary { background: #1A3838; border: 1px solid #2a4a48; color: #c8deda; }
.btn--secondary:hover { background: #162e2e; }
.btn--ghost     { background: transparent; color: #c8deda; border: 1px solid #2a4a48; }
.btn--ghost:hover { background: #162e2e; }
.btn--sm  { padding: 6px 12px; font-size: 12px; }
.btn--icon { background: transparent; border: 1px solid #2a4a48; color: #8aada9; padding: 5px 9px; }
</style>