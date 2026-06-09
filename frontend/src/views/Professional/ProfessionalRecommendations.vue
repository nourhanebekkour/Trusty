<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Recommendations</h2>
        <p>View and create backend recommendations for assigned students.</p>
      </div>

      <button class="professional-btn" @click="openRecommendationPrompt">
        Add recommendation
      </button>
    </div>

    <div v-if="loading" class="professional-loading">
      Loading recommendations...
    </div>

    <div v-else-if="error" class="professional-error">
      {{ error }}
    </div>

    <div v-else-if="recommendations.length === 0" class="professional-empty">
      No recommendations found.
    </div>

    <div v-else class="recommendations-list">
      <article
        v-for="recommendation in recommendations"
        :key="recommendation.id"
        class="professional-panel recommendation-card"
      >
        <div class="recommendation-card__top">
          <div>
            <h3>{{ recommendation.student.fullName }}</h3>
            <p>
              By {{ recommendation.author.fullName }}
            </p>
          </div>

          <span class="professional-badge">
            {{ recommendation.status }}
          </span>
        </div>

        <p class="recommendation-message">
          {{ recommendation.message }}
        </p>

        <div class="recommendation-meta">
          <span>Created at: {{ recommendation.createdAt }}</span>
          <span>Validation date: {{ recommendation.validationDate }}</span>
        </div>
      </article>
    </div>

    <p class="professional-warning">
      This page is connected to the backend. If adding a recommendation fails,
      it means the backend route for creating recommendations does not exist yet
      or does not accept the expected payload.
    </p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const recommendations = ref([])
const students = ref([])
const loading = ref(false)
const error = ref(null)

const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    students.value = await professionalApi.getStudents()
    recommendations.value = await professionalApi.getRecommendations()
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load backend recommendations.'
  } finally {
    loading.value = false
  }
}

const openRecommendationPrompt = async () => {
  if (students.value.length === 0) {
    alert('No assigned students found.')
    return
  }

  const studentList = students.value
    .map((student, index) => `${index + 1}. ${student.fullName}`)
    .join('\n')

  const choice = window.prompt(`Choose a student number:\n\n${studentList}`)

  if (!choice) return

  const index = Number(choice) - 1
  const student = students.value[index]

  if (!student) {
    alert('Invalid student number.')
    return
  }

  const message = window.prompt(`Write recommendation for ${student.fullName}`)

  if (!message || !message.trim()) return

  try {
    loading.value = true

    await professionalApi.addRecommendation(student, message.trim())

    await loadData()

    alert('Recommendation added successfully to backend.')
  } catch (err) {
    console.error(err)

    alert(
      'Backend error: recommendation was not saved. Check if POST /recommandations or POST /recommendations exists.'
    )
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-card {
  padding: 20px;
}

.recommendation-card__top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.recommendation-card__top h3 {
  margin: 0;
  color: #2d2a26;
}

.recommendation-card__top p {
  margin: 5px 0 0;
  color: #7b7164;
}

.recommendation-message {
  margin: 18px 0;
  color: #3c3731;
  line-height: 1.7;
  background: #f8f6f1;
  padding: 16px;
  border-radius: 14px;
}

.recommendation-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #7b7164;
  font-size: 13px;
}
</style>