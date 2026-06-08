<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Projects</h2>
        <p>Consult and supervise projects related to your company students.</p>
      </div>
    </div>

    <div v-if="loading" class="professional-loading">
      Loading projects...
    </div>

    <div v-else-if="error" class="professional-error">
      {{ error }}
    </div>

    <div v-else-if="projects.length === 0" class="professional-empty">
      No projects found.
    </div>

    <div v-else class="professional-grid-3">
      <article v-for="project in projects" :key="project.id" class="professional-panel">
        <h3>{{ project.title }}</h3>

        <span class="professional-badge">
          {{ project.status }}
        </span>

        <p class="project-description">
          {{ project.description }}
        </p>

        <p>
          <strong>Type:</strong> {{ project.type }}
        </p>

        <p>
          <strong>Student:</strong>
          {{ project.mainStudent?.fullName || 'No student' }}
        </p>

        <p>
          <strong>Period:</strong>
          {{ project.startDate }} - {{ project.endDate }}
        </p>

        <p>
          <strong>Technologies:</strong>
          {{ project.technologies.map((tech) => tech.name).join(', ') || '-' }}
        </p>

        <div class="professional-actions">
          <button class="professional-btn-light" @click="selectedProject = project">
            View details
          </button>

          <button class="professional-btn" @click="addFeedback(project)">
            Add feedback
          </button>
        </div>
      </article>
    </div>

    <div v-if="selectedProject" class="professional-panel details-panel">
      <h3>{{ selectedProject.title }}</h3>

      <p><strong>Description:</strong> {{ selectedProject.description }}</p>
      <p><strong>Results:</strong> {{ selectedProject.results }}</p>
      <p><strong>Validation comment:</strong> {{ selectedProject.validationComment }}</p>

      <div v-if="selectedProject.githubLink || selectedProject.demoLink || selectedProject.youtubeLink">
        <p v-if="selectedProject.githubLink">
          <strong>GitHub:</strong>
          <a :href="selectedProject.githubLink" target="_blank">
            {{ selectedProject.githubLink }}
          </a>
        </p>

        <p v-if="selectedProject.demoLink">
          <strong>Demo:</strong>
          <a :href="selectedProject.demoLink" target="_blank">
            {{ selectedProject.demoLink }}
          </a>
        </p>

        <p v-if="selectedProject.youtubeLink">
          <strong>YouTube:</strong>
          <a :href="selectedProject.youtubeLink" target="_blank">
            {{ selectedProject.youtubeLink }}
          </a>
        </p>
      </div>

      <button class="professional-btn-light" @click="selectedProject = null">
        Close
      </button>
    </div>

    <p class="professional-warning">
      The professional space does not include project validation permissions.
      Validation is handled by the academic side.
    </p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const projects = ref([])
const loading = ref(false)
const error = ref(null)
const selectedProject = ref(null)

const loadProjects = async () => {
  try {
    loading.value = true
    error.value = null
    projects.value = await professionalApi.getProjects()
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load projects. Check your API endpoints.'
  } finally {
    loading.value = false
  }
}

const addFeedback = async (project) => {
  const content = window.prompt(`Add feedback for: ${project.title}`)

  if (!content || !content.trim()) return

  await professionalApi.addProjectFeedback(project.id, content.trim())

  alert('Feedback saved locally in frontend.')
}

onMounted(loadProjects)
</script>

<style scoped>
.project-description {
  color: #6f665b;
  line-height: 1.6;
}

.details-panel {
  margin-top: 18px;
}

a {
  color: #1f3f38;
  font-weight: 600;
}
</style>