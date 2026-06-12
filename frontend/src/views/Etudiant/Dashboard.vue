<template>
  <div class="dashboard-page">
    <header class="page-header">
      <div class="page-header__left">
        <div class="page-header__title">
          <h1 class="page-title">Tableau de Bord Étudiant</h1>
          <img src="@/assets/icons/trusty.svg" class="icon icon--md" alt="" />
        </div>
        <p class="page-subtitle">Gérez vos réalisations et contrôlez votre présence professionnelle.</p>
      </div>
    </header>

    <DashboardStats    :stats="stats" />
    <DashboardProjects :projects="projects"     :loading="loadingProjects" />
    <DashboardRecos    :recos="recommandations" :loading="loadingRecos" />

    <div class="cta-banner">
      <div class="cta-banner__content">
        <p class="cta-banner__title">Prêt à partager ?</p>
        <p class="cta-banner__subtitle">
          Générez un lien unique vers votre portfolio complet certifié TRUSTY.
        </p>
      </div>
      <div class="cta-banner__actions">
        <button class="btn btn--outline-accent" @click="openPublicPreview">Aperçu Public</button>
        <button class="btn btn--outline-accent" @click="$router.push('/portfolio')">Générer mon URL Certifiée</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }  from '@/stores/authstore'
import api from '@/services/api'
import DashboardStats    from '@/components/dashboard/DashboardStats.vue'
import DashboardProjects from '@/components/dashboard/DashboardProjects.vue'
import DashboardRecos    from '@/components/dashboard/DashboardRecos.vue'
import { fetchStats, fetchProjects, fetchRecos, recalculerScore } from '@/services/dashboardservices'

const authStore  = useAuthStore()
const router = useRouter()
const idEtudiant = authStore.user?.id_utilisateur ?? null

const stats           = ref(null)
const projects        = ref([])
const recommandations = ref([])
const loadingProjects = ref(true)
const loadingRecos    = ref(true)

async function openPublicPreview() {
  try {
    const response = await api.get('/portfolio/me')
    const body = response.data?.data ?? response.data
    const portfolios = Array.isArray(body) ? body : body ? [body] : []
    const portfolio = portfolios.find(item => item.est_publie && item.url_publique)
      ?? portfolios.find(item => item.url_publique)

    if (portfolio?.url_publique) {
      await router.push({
        name: 'portfolio-template1',
        params: { url_publique: portfolio.url_publique },
      })
      return
    }
  } catch (error) {
    console.error('[Dashboard] Impossible de charger le portfolio public :', error)
  }

  await router.push('/portfolio')
}

onMounted(async () => {
  if (!idEtudiant) {
    console.warn('[Dashboard] id_utilisateur introuvable dans le store auth')
    loadingProjects.value = false
    loadingRecos.value    = false
    return
  }

  // 1. Recalculer le score de crédibilité avant d'afficher les stats
  await recalculerScore(idEtudiant)

  // 2. Charger les données en parallèle
  const [statsData, projectsData, recosData] = await Promise.all([
    fetchStats(idEtudiant),
    fetchProjects(idEtudiant),
    fetchRecos(idEtudiant),
  ])

  stats.value           = statsData
  projects.value        = projectsData
  loadingProjects.value = false
  recommandations.value = recosData
  loadingRecos.value    = false
})


</script>

<style scoped>
@import '@/assets/dashboard.css';
</style>
