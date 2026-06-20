<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Recommendations</h2>
        <p>View and create backend recommendations for assigned students.</p>
      </div>

      <button
        class="professional-btn"
        @click="openRecommendationPrompt"
        :disabled="isRateLimited"
        :title="isRateLimited ? `Please wait ${rateLimitCountdown}s before submitting again` : ''"
      >
        {{ isRateLimited ? `Wait ${rateLimitCountdown}s` : 'Add recommendation' }}
      </button>
    </div>

    <!-- Rate limit warning -->
    <div v-if="isRateLimited" class="professional-warning" role="alert" aria-live="polite">
      Too many submissions. Please wait {{ rateLimitCountdown }} seconds before trying again.
    </div>

    <div v-if="loading" class="professional-loading">
      Loading recommendations...
    </div>

    <div v-else-if="error" class="professional-error" role="alert">
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
            <!-- XSS: toutes les données API sont sanitizées avant affichage -->
            <h3>{{ sanitizeText(recommendation.student?.fullName) }}</h3>
            <p>
              By {{ sanitizeText(recommendation.author?.fullName) }}
            </p>
          </div>

          <span class="professional-badge">
            {{ sanitizeText(recommendation.status) }}
          </span>
        </div>

        <p class="recommendation-message">
          {{ sanitizeText(recommendation.message) }}
        </p>

        <div class="recommendation-meta">
          <span>Created at: {{ sanitizeText(recommendation.createdAt) }}</span>
          <span>Validation date: {{ sanitizeText(recommendation.validationDate) }}</span>
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
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const recommendations = ref([])
const students = ref([])
const loading = ref(false)
const error = ref(null)

//  sanitisation des données affichées ───────────
const sanitizeText = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Validation des inputs (prompt utilisateur) ────────
const MAX_MESSAGE_LENGTH = 1000
const validateMessage = (message) => {
  if (!message || typeof message !== 'string') return false
  const trimmed = message.trim()
  if (trimmed.length === 0) return false
  if (trimmed.length > MAX_MESSAGE_LENGTH) return false
  // Rejette les tentatives d'injection de balises HTML
  if (/<[^>]*>/.test(trimmed)) return false
  return true
}

const validateStudentChoice = (choice, maxIndex) => {
  const num = Number(choice)
  if (!Number.isInteger(num)) return false
  if (num < 1 || num > maxIndex) return false
  return true
}

// Rate limiting côté client ───────────
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60_000

const submissionTimestamps = ref([])
const rateLimitCountdown = ref(0)
let countdownInterval = null

const isRateLimited = computed(() => {
  const now = Date.now()
  const recent = submissionTimestamps.value.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  )
  return recent.length >= RATE_LIMIT_MAX
})

const recordSubmission = () => {
  const now = Date.now()
  submissionTimestamps.value = [
    ...submissionTimestamps.value.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS),
    now,
  ]

  if (isRateLimited.value) {
    startCountdown()
  }
}

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)

  const updateCountdown = () => {
    const now = Date.now()
    const oldest = submissionTimestamps.value
      .filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)
      .sort((a, b) => a - b)[0]

    if (!oldest) {
      rateLimitCountdown.value = 0
      clearInterval(countdownInterval)
      return
    }

    const remaining = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000)
    rateLimitCountdown.value = remaining > 0 ? remaining : 0

    if (rateLimitCountdown.value === 0) {
      clearInterval(countdownInterval)
    }
  }

  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
}

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

// ─── Logique métier originale (inchangée) ─────

const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    students.value = await professionalApi.getStudents()
    recommendations.value = await professionalApi.getRecommendations()
  } catch (err) {
    // message d'erreur neutre 
    console.error('[ProfessionalRecommendations] loadData error:', err)
    error.value = 'Unable to load recommendations. Please try again later.'
  } finally {
    loading.value = false
  }
}

const openRecommendationPrompt = async () => {
  // Bloquer si rate limit atteint
  if (isRateLimited.value) return

  if (students.value.length === 0) {
    alert('No assigned students found.')
    return
  }

  const studentList = students.value
    .map((student, index) => `${index + 1}. ${student.fullName}`)
    .join('\n')

  const choice = window.prompt(`Choose a student number:\n\n${studentList}`)

  if (!choice) return

  // validation du choix étudiant
  if (!validateStudentChoice(choice, students.value.length)) {
    alert('Invalid student number.')
    return
  }

  const index = Number(choice) - 1
  const student = students.value[index]

  if (!student) {
    alert('Invalid student number.')
    return
  }

  const message = window.prompt(`Write recommendation for ${student.fullName}`)

  if (!message || !message.trim()) return

  // validation du message
  if (!validateMessage(message)) {
    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      alert(`Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`)
    } else {
      alert('Invalid message content.')
    }
    return
  }

  // enregistrer la tentative avant l'appel API
  recordSubmission()

  try {
    loading.value = true

    await professionalApi.addRecommendation(student, message.trim())

    await loadData()

    alert('Recommendation added successfully to backend.')
  } catch (err) {
    // message d'erreur neutre côté utilisateur
    console.error('[ProfessionalRecommendations] addRecommendation error:', err)

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