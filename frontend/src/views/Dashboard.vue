<template>
  <section class="dashboard-page">
    <header class="page-header">
      <h1 class="page-title">Tableau de Bord Étudiant</h1>
      <p class="page-subtitle">Suivez vos réalisations, recommandations et éléments de portfolio.</p>
    </header>

    <DashboardStats :stats="stats" />
    <DashboardProjects :projects="projects" :loading="loadingProjects" />
    <DashboardRecos :recos="recos" :loading="loadingRecos" />

    <section class="cta-banner">
      <h2 class="cta-banner__title">Prêt à partager ?</h2>
      <button class="btn btn--outline-accent" @click="router.push('/portfolio/apercu')">Aperçu Public</button>
      <button class="btn btn--outline-accent">Générer mon URL Certifiée</button>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import DashboardProjects from '@/components/dashboard/DashboardProjects.vue'
import DashboardRecos from '@/components/dashboard/DashboardRecos.vue'
import { fetchProjects, fetchRecos, fetchStats } from '@/services/dashboardservices'

const router = useRouter()

const stats = ref(null)
const projects = ref([])
const recos = ref([])
const loadingProjects = ref(true)
const loadingRecos = ref(true)

onMounted(async () => {
  stats.value = await fetchStats()
  projects.value = await fetchProjects()
  loadingProjects.value = false
  recos.value = await fetchRecos()
  loadingRecos.value = false
})
</script>
