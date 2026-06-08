<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Dashboard</h2>
        <p>Overview of internships, projects and students linked to your company.</p>
      </div>
    </div>

    <div v-if="loading" class="professional-loading">
      Loading dashboard...
    </div>

    <div v-else-if="error" class="professional-error">
      {{ error }}
    </div>

    <template v-else>
      <div class="professional-grid-4">
        <div class="professional-card">
          <span>Total Internships</span>
          <strong>{{ dashboard.stats.totalInternships }}</strong>
        </div>

        <div class="professional-card">
          <span>Pending Internships</span>
          <strong>{{ dashboard.stats.pendingInternships }}</strong>
        </div>

        <div class="professional-card">
          <span>Projects</span>
          <strong>{{ dashboard.stats.totalProjects }}</strong>
        </div>

        <div class="professional-card">
          <span>Students</span>
          <strong>{{ dashboard.stats.assignedStudents }}</strong>
        </div>
      </div>

      <br>

      <div class="professional-grid-2">
        <div class="professional-panel">
          <h3>Recent Internships</h3>

          <div v-if="dashboard.recentInternships.length === 0" class="professional-empty">
            No internships found.
          </div>

          <div v-else class="professional-list">
            <div
              v-for="internship in dashboard.recentInternships"
              :key="internship.id"
              class="professional-list__item"
            >
              <div>
                <strong>{{ internship.title }}</strong>
                <span>{{ internship.student.fullName }} — {{ internship.company }}</span>
              </div>

              <em class="professional-badge">{{ internship.status }}</em>
            </div>
          </div>
        </div>

        <div class="professional-panel">
          <h3>Recent Projects</h3>

          <div v-if="dashboard.recentProjects.length === 0" class="professional-empty">
            No projects found.
          </div>

          <div v-else class="professional-list">
            <div
              v-for="project in dashboard.recentProjects"
              :key="project.id"
              class="professional-list__item"
            >
              <div>
                <strong>{{ project.title }}</strong>
                <span>{{ project.mainStudent?.fullName || 'No student' }}</span>
              </div>

              <em class="professional-badge">{{ project.status }}</em>
            </div>
          </div>
        </div>
      </div>

      <p class="professional-warning">
        This space is for supervision only. Official validation is reserved for academic users.
      </p>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const loading = ref(false)
const error = ref(null)

const dashboard = ref({
  stats: {
    totalInternships: 0,
    pendingInternships: 0,
    totalProjects: 0,
    assignedStudents: 0,
    documents: 0
  },
  recentInternships: [],
  recentProjects: []
})

const loadDashboard = async () => {
  try {
    loading.value = true
    error.value = null
    dashboard.value = await professionalApi.getDashboard()
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load professional dashboard. Check your API endpoints.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>
