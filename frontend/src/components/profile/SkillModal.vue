<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="skill-modal">

      <div class="skill-modal-header">
        <div class="skill-modal-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l1.9 5.8h6.1l-4.9 3.6 1.9 5.8-4.9-3.6-4.9 3.6 1.9-5.8-4.9-3.6h6.1z"/>
          </svg>
        </div>
        <button class="skill-modal-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="skill-modal-body">
        <h2 class="skill-modal-title">Ajouter une compétence</h2>
        <p class="skill-modal-subtitle">Choisissez une compétence à ajouter à votre profil.</p>

        <label class="skill-input-label">Rechercher une compétence</label>
        <div class="skill-input-wrapper">
          <svg class="skill-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Filtrer les compétences…"
            class="skill-input"
            v-model="searchQuery"
          />
        </div>

        <div v-if="selectedSkill" class="skill-selected-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Sélectionnée : <strong>{{ selectedSkill.nom }}</strong></span>
          <button @click="selectedSkill = null" class="skill-deselect">✕</button>
        </div>

        <!-- Sélecteur niveau de maîtrise -->
        <div v-if="selectedSkill" class="skill-niveau-wrapper">
          <label class="skill-input-label">Niveau de maîtrise</label>
          <div class="skill-niveau-options">
            <button
              v-for="n in niveaux"
              :key="n.value"
              class="skill-niveau-btn"
              :class="{ active: niveauMaitrise === n.value }"
              @click="niveauMaitrise = n.value"
            >
              <span class="skill-niveau-stars">{{ '★'.repeat(n.stars) }}{{ '☆'.repeat(3 - n.stars) }}</span>
              <span>{{ n.label }}</span>
            </button>
          </div>
        </div>

        <div class="skill-suggestions">
          <span class="skill-suggestions-label">
            {{ filteredCompetences.length }} compétence(s) disponible(s)
          </span>
          <div v-if="loading" class="skill-loading">Chargement…</div>
          <div v-else-if="error" class="skill-error">{{ error }}</div>
          <div v-else class="skill-suggestions-tags">
            <button
              v-for="tag in filteredCompetences"
              :key="tag.id_competence"
              class="skill-tag-btn"
              :class="{ active: selectedSkill?.id_competence === tag.id_competence }"
              @click="selectedSkill = tag"
            >{{ tag.nom }}</button>
            <span v-if="filteredCompetences.length === 0" class="skill-no-result">
              Aucune compétence trouvée.
            </span>
          </div>
        </div>
      </div>

      <div class="skill-modal-footer">
        <button class="skill-btn-cancel" @click="$emit('close')">Annuler</button>
        <button
          class="skill-btn-submit"
          :disabled="!selectedSkill || adding"
          @click="submit"
        >
          {{ adding ? 'Ajout en cours...' : '+ Ajouter au profil' }}
        </button>
      </div>

      <transition name="skill-fade">
        <div v-if="showSuccess" class="skill-success">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>✅ "{{ lastAdded }}" ajoutée avec succès !</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { getCompetence } from '@/services/competence.service'
import { onMounted, ref, computed } from 'vue'

const props = defineProps({ user: Object })
const emit  = defineEmits(['close', 'added'])

const competences    = ref([])
const selectedSkill  = ref(null)
const searchQuery    = ref('')
const showSuccess    = ref(false)
const lastAdded      = ref('')
const adding         = ref(false)
const loading        = ref(true)
const error          = ref(null)

const niveauMaitrise = ref('DEBUTANT')

const niveaux = [
  {
    value: 'DEBUTANT',
    label: 'Débutant',
    stars: 1
  },
  {
    value: 'INTERMEDIAIRE',
    label: 'Intermédiaire',
    stars: 2
  },
  {
    value: 'AVANCE',
    label: 'Avancé',
    stars: 3
  },
]
const filteredCompetences = computed(() => {
  const already = props.user?.etudiant?.competences?.map(
    ec => ec.competence.id_competence
  ) ?? []

  return competences.value.filter(c => {
    const notOwned    = !already.includes(c.id_competence)
    const matchSearch = c.nom.toLowerCase().includes(searchQuery.value.toLowerCase())
    return notOwned && matchSearch
  })
})

onMounted(async () => {
  loading.value = true
  error.value   = null
  try {
    const data = await getCompetence()
    competences.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Erreur chargement compétences :', e)
    error.value = 'Impossible de charger les compétences.'
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (!selectedSkill.value) return
  adding.value = true
  try {
    emit('added', {
      competence:      selectedSkill.value,
      niveau_maitrise: niveauMaitrise.value,   // ← on transmet le niveau
    })
    lastAdded.value      = selectedSkill.value.nom
    selectedSkill.value  = null
    niveauMaitrise.value = 'DEBUTANT'
    searchQuery.value = ''
    showSuccess.value    = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
@import '@/assets/profile.css';

.skill-selected-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f0;
  border: 1px solid #D95F1E;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #D95F1E;
}
.skill-deselect {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #D95F1E;
  font-size: 12px;
}
.skill-niveau-wrapper { margin-bottom: 14px; }
.skill-niveau-options {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}
.skill-niveau-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.skill-niveau-btn.active {
  border-color: #D95F1E;
  background: #fff7f0;
  color: #D95F1E;
}
.skill-niveau-stars { font-size: 14px; letter-spacing: 1px; }
.skill-loading, .skill-error { font-size: 13px; padding: 8px 0; }
.skill-loading { color: #888; }
.skill-error   { color: #c0392b; }
.skill-no-result { font-size: 13px; color: #aaa; font-style: italic; }
</style>