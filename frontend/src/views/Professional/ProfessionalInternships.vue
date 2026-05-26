<template>
  <section class="professional-page">
    <div class="professional-page__header">
      <div>
        <h2>Internships</h2>
        <p>Follow internships assigned to your company.</p>
      </div>
    </div>

    <div v-if="loading" class="professional-loading">
      Loading internships...
    </div>

    <div v-else-if="error" class="professional-error">
      {{ error }}
    </div>

    <div v-else-if="internships.length === 0" class="professional-empty">
      No internships found.
    </div>

    <div v-else class="professional-table-card">
      <table class="professional-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Student</th>
            <th>Company</th>
            <th>Period</th>
            <th>Status</th>
            <th>Professional Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="internship in internships" :key="internship.id">
            <td>
              <strong>{{ internship.title }}</strong>
              <br>
              <small>{{ internship.missions }}</small>
            </td>

            <td>
              {{ internship.student.fullName }}
              <br>
              <small>{{ internship.student.email }}</small>
            </td>

            <td>{{ internship.company }}</td>

            <td>{{ internship.period }}</td>

            <td>
              <span class="professional-badge">{{ internship.status }}</span>
            </td>

            <td>
              <div class="professional-actions">
                <button class="professional-btn-light" @click="selectedInternship = internship">
                  View details
                </button>

                <button class="professional-btn" @click="addRemark(internship)">
                  Add remark
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedInternship" class="professional-panel details-panel">
      <h3>{{ selectedInternship.title }}</h3>

      <p><strong>Student:</strong> {{ selectedInternship.student.fullName }}</p>
      <p><strong>Company:</strong> {{ selectedInternship.company }}</p>
      <p><strong>Professional Supervisor:</strong> {{ selectedInternship.professionalSupervisor }}</p>
      <p><strong>Academic Supervisor:</strong> {{ selectedInternship.academicSupervisor }}</p>
      <p><strong>Missions:</strong> {{ selectedInternship.missions }}</p>

      <button class="professional-btn-light" @click="selectedInternship = null">
        Close
      </button>
    </div>

    <p class="professional-warning">
      Professional users can add remarks and follow progress, but they cannot officially validate internships.
    </p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { professionalApi } from '@/services/professionalApi'

const internships = ref([])
const loading = ref(false)
const error = ref(null)
const selectedInternship = ref(null)

const loadInternships = async () => {
  try {
    loading.value = true
    error.value = null
    internships.value = await professionalApi.getInternships()
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load internships. Check your API endpoints.'
  } finally {
    loading.value = false
  }
}

const addRemark = async (internship) => {
  const content = window.prompt(`Add a remark for: ${internship.title}`)

  if (!content || !content.trim()) return

  await professionalApi.addInternshipRemark(internship.id, content.trim())

  alert('Remark saved locally in frontend.')
}

onMounted(loadInternships)
</script>

<style scoped>
.details-panel {
  margin-top: 18px;
}
</style>