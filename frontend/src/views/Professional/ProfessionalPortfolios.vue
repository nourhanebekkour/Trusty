<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Portfolios</h2>
        <p>Consult student portfolios linked to your company supervision.</p>
      </div>
    </div>

    <div v-if="loading" class="professional-loading">
      Loading portfolios...
    </div>

    <div v-else-if="error" class="professional-error">
      {{ error }}
    </div>

    <div v-else-if="portfolios.length === 0" class="professional-empty">
      No portfolios found for your assigned students.
    </div>

    <div v-else class="professional-grid-3">
      <article
        v-for="portfolio in portfolios"
        :key="portfolio.id"
        class="professional-panel portfolio-card"
      >
        <div class="portfolio-card__top">
          <h3>{{ portfolio.title }}</h3>

          <span class="professional-badge">
            {{ portfolio.isPublished ? 'Published' : 'Not published' }}
          </span>
        </div>

        <p class="portfolio-subtitle">
          {{ portfolio.subtitle }}
        </p>

        <div class="portfolio-info">
          <div>
            <span>Student</span>
            <strong>{{ portfolio.student.fullName }}</strong>
          </div>

          <div>
            <span>Views</span>
            <strong>{{ portfolio.views }}</strong>
          </div>

          <div>
            <span>Recommendations</span>
            <strong>{{ portfolio.recommendationsCount }}</strong>
          </div>

          <div>
            <span>Published at</span>
            <strong>{{ portfolio.publishedAt }}</strong>
          </div>
        </div>

        <div class="professional-actions">
          <a
            v-if="portfolio.publicUrl"
            :href="portfolio.publicUrl"
            target="_blank"
            class="professional-btn"
          >
            Open portfolio
          </a>

          <button
            v-else
            class="professional-btn-light"
            disabled
          >
            No public link
          </button>
        </div>
      </article>
    </div>

    <p class="professional-warning">
      Professional users can consult portfolios, but they cannot edit or validate them.
    </p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const portfolios = ref([])
const loading = ref(false)
const error = ref(null)

const loadPortfolios = async () => {
  try {
    loading.value = true
    error.value = null
    portfolios.value = await professionalApi.getPortfolios()
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load portfolios. Check your API endpoints.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPortfolios)
</script>

<style scoped>
.portfolio-card {
  padding: 20px;
}

.portfolio-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.portfolio-card__top h3 {
  margin: 0;
  color: #2d2a26;
  font-size: 18px;
}

.portfolio-subtitle {
  color: #7b7164;
  line-height: 1.6;
}

.portfolio-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 18px 0;
}

.portfolio-info div {
  background: #f8f6f1;
  padding: 12px;
  border-radius: 12px;
}

.portfolio-info span {
  display: block;
  color: #7b7164;
  font-size: 12px;
  margin-bottom: 5px;
}

.portfolio-info strong {
  color: #2d2a26;
  font-size: 14px;
}

a.professional-btn {
  text-decoration: none;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>