<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Students</h2>
        <p>Students assigned to your company through internships.</p>
      </div>
    </div>

    <div v-if="loading" class="professional-loading">
      Loading students...
    </div>

    <div v-else-if="error" class="professional-error">
      {{ error }}
    </div>

    <div v-else-if="students.length === 0" class="professional-empty">
      No students found.
    </div>

    <div v-else class="professional-grid-3">
      <article v-for="student in students" :key="student.id" class="professional-panel student-card">
        <div class="student-card__avatar">
          {{ getInitials(student.fullName) }}
        </div>

        <div class="student-card__content">
          <h3>{{ student.fullName }}</h3>
          <p>{{ student.email }}</p>

          <div class="student-card__info">
            <span>{{ student.field }}</span>
            <span>Year {{ student.year }}</span>
            <span>{{ student.city }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const students = ref([])
const loading = ref(false)
const error = ref(null)

const getInitials = (name) => {
  return String(name || 'Student')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const loadStudents = async () => {
  try {
    loading.value = true
    error.value = null
    students.value = await professionalApi.getStudents()
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load students. Check your API endpoints.'
  } finally {
    loading.value = false
  }
}

onMounted(loadStudents)
</script>

<style scoped>
.student-card {
  display: flex;
  gap: 16px;
}

.student-card__avatar {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: #1f3f38;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.student-card__content {
  flex: 1;
}

.student-card__content h3 {
  margin: 0;
  color: #2d2a26;
  font-size: 18px;
}

.student-card__content p {
  margin: 4px 0 14px;
  color: #7b7164;
  font-size: 14px;
}

.student-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.student-card__info span {
  background: #f8f6f1;
  color: #3c3731;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
}
</style>