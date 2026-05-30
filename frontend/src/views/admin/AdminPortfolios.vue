<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1 class="admin-page__title">Registre global des portfolios</h1>
        <p class="admin-page__subtitle">
          Ecran pret pour la gestion des portfolios. Les endpoints backend necessaires sont documentes dans le contrat API.
        </p>
      </div>
      <button class="admin-btn admin-btn--secondary" type="button" @click="admin.fetchPortfolios">
        <RefreshCw :size="16" />
        Actualiser
      </button>
    </header>

    <section class="admin-stats">
      <article class="admin-stat admin-stat--accent">
        <span class="admin-stat__label">Portfolios exposes</span>
        <strong class="admin-stat__value">{{ admin.portfolios.length }}</strong>
        <span class="admin-stat__sub">Endpoint backend manquant</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">En attente</span>
        <strong class="admin-stat__value">{{ admin.verificationQueue.length }}</strong>
        <span class="admin-stat__sub">File administrative disponible</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Modele Prisma</span>
        <strong class="admin-stat__value">Portfolio</strong>
        <span class="admin-stat__sub">id_portfolio, id_etudiant, est_publie</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Contrat</span>
        <strong class="admin-stat__value">API</strong>
        <span class="admin-stat__sub">Voir API_CONTRACT_ADMIN_PROFESSIONAL.md</span>
      </article>
    </section>

    <div v-if="admin.error" class="admin-error">{{ admin.error }}</div>

    <section class="admin-grid">
      <article class="admin-card">
        <div class="admin-card__header">
          <div>
            <h2 class="admin-card__title">Liste des portfolios</h2>
            <p class="admin-card__subtitle">
              Aucun endpoint backend ne permet actuellement a l'administrateur de lister ou certifier les portfolios.
            </p>
          </div>
          <span class="admin-badge admin-badge--warning">API manquante</span>
        </div>

        <div class="admin-state">
          Les donnees du modele Portfolio existent dans Prisma, mais aucune route Express publique/protegee ne les expose
          pour l'espace administrateur. Le frontend n'appelle donc pas de route inexistante.
        </div>
      </article>

      <aside class="admin-card">
        <div class="admin-card__header">
          <div>
            <h2 class="admin-card__title">Contrat attendu</h2>
            <p class="admin-card__subtitle">Synthese des APIs necessaires pour activer cette page.</p>
          </div>
          <FileText :size="18" />
        </div>

        <div class="admin-timeline">
          <div v-for="item in missingApis" :key="item.title" class="admin-timeline__item">
            <span class="admin-timeline__dot"></span>
            <div class="admin-timeline__body">
              <strong>{{ item.title }}</strong>
              <div class="admin-muted">{{ item.endpoint }}</div>
              <p class="admin-page__subtitle">{{ item.reason }}</p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { FileText, RefreshCw } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const admin = useAdminStore()

const missingApis = [
  {
    title: 'Lister les portfolios',
    endpoint: 'GET /api/portfolios?scope=admin',
    reason: 'Alimenter le registre avec id_portfolio, titre_personnalise, est_publie et etudiant.utilisateur.',
  },
  {
    title: 'Certifier un portfolio',
    endpoint: 'POST /api/portfolios/:id_portfolio/certifier',
    reason: 'Enregistrer une decision admin sans modifier les endpoints existants de projet ou stage.',
  },
  {
    title: 'Demander corrections',
    endpoint: 'POST /api/portfolios/:id_portfolio/corrections',
    reason: 'Notifier un etudiant avec un commentaire de correction trace.',
  },
]

onMounted(async () => {
  await Promise.all([
    admin.fetchPortfolios(),
    admin.fetchVerificationQueue(),
  ])
})
</script>
