<template>
  <div class="prof-modal-backdrop" @click.self="$emit('close')">
    <div class="prof-modal prof-modal-detail">
      <div class="prof-modal-head">
        <div>
          <h2>{{ studentName }}</h2>
          <p>Compétences et badges</p>
        </div>
        <button class="prof-modal-close" @click="$emit('close')">&times;</button>
      </div>

      <div v-if="loading" class="prof-state">Chargement...</div>
      <div v-else-if="error" class="prof-error">{{ error }}</div>

      <template v-else>
        <section style="margin-bottom: 24px">
          <h3 class="detail-section-title">Compétences</h3>
          <div v-if="competences.length === 0" class="prof-muted" style="padding: 8px 0">
            Aucune compétence renseignée.
          </div>
          <div v-else class="tags-list">
            <span
              v-for="c in competences"
              :key="c.id_competence"
              class="tag"
            >
              {{ c.competence?.nom || c.nom }}
            </span>
          </div>
        </section>

        <section>
          <h3 class="detail-section-title">Badges ({{ badges.length }})</h3>
          <div v-if="badges.length === 0" class="prof-muted" style="padding: 8px 0">
            Aucun badge obtenu.
          </div>
          <div v-else class="badges-grid">
            <div v-for="b in badges" :key="b.id_badge" class="badge-card">
              <div
                v-if="b.badge?.icone_url"
                class="badge-icon"
                :style="{ backgroundImage: `url(${b.badge.icone_url})` }"
              />
              <div v-else class="badge-icon badge-icon--empty">B</div>
              <div class="badge-info">
                <strong>{{ b.badge?.nom || b.nom }}</strong>
                <span class="prof-muted">{{ b.badge?.description || '' }}</span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import '@/assets/professor-pages.css'
import { getStudentDetails } from '@/services/professorApi'

const props = defineProps({
  studentId: { type: String, required: true },
  studentName: { type: String, default: 'Étudiant' },
})

defineEmits(['close'])

const loading = ref(false)
const error = ref(null)
const competences = ref([])
const badges = ref([])

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await getStudentDetails(props.studentId)
    competences.value = data.competences
    badges.value = data.badges
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les détails.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.prof-modal-detail {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-section-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text-primary, #263534);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  background: var(--color-surface-alt, #F4F2EC);
  color: var(--color-text-primary, #263534);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.badge-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border-light, #E5E0D6);
  border-radius: 10px;
}

.badge-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}

.badge-icon--empty {
  background: var(--color-accent, #D6EDE8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: var(--color-accent, #5C8C6A);
}

.badge-info {
  min-width: 0;
}

.badge-info strong {
  display: block;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-info .prof-muted {
  display: block;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
