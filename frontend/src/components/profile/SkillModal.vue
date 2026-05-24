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
        <p class="skill-modal-subtitle">Ajoutez une compétence à votre profil pour la mettre en avant.</p>

        <label class="skill-input-label">Nom de la compétence</label>
        <div class="skill-input-wrapper">
          <svg class="skill-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Ex: Vue.js, Design UI, Gestion de projet…"
            class="skill-input"
            v-model="newSkill"
            @keyup.enter="submit"
          />
        </div>

        <div class="skill-suggestions">
          <span class="skill-suggestions-label">Suggestions</span>
          <div class="skill-suggestions-tags">
            <button
              v-for="tag in suggestionTags" :key="tag"
              class="skill-tag-btn"
              :class="{ active: newSkill === tag }"
              @click="newSkill = tag"
            >{{ tag }}</button>
          </div>
        </div>
      </div>

      <div class="skill-modal-footer">
        <button class="skill-btn-cancel" @click="$emit('close')">Annuler</button>
        <button class="skill-btn-submit" :disabled="!newSkill.trim() || adding" @click="submit">
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
import { ref } from 'vue'

const props = defineProps({ user: Object })
// "added" émet l'objet { competence, niveau_maitrise } retourné par addSkill()
const emit  = defineEmits(['close', 'added'])

const newSkill    = ref('')
const showSuccess = ref(false)
const lastAdded   = ref('')
const adding      = ref(false)

const suggestionTags = ['Vue.js', 'JavaScript', 'PHP', 'Laravel', 'CSS', 'HTML', 'Python', 'Git', 'Machine Learning']

async function submit() {
  const skill = newSkill.value.trim()
  if (!skill) return

  // Vérification côté client : évite d'ajouter un doublon visible
  const exists = props.user.etudiant?.competences?.some(
    ec => ec.competence.nom.toLowerCase() === skill.toLowerCase()
  )
  if (exists) {
    alert('Cette compétence est déjà dans votre profil.')
    newSkill.value = ''
    return
  }

  adding.value = true
  try {
    // On émet le nom — le parent (ProfilePage) appelle addSkill(idEtudiant, nom)
    // et gère l'erreur API. Le modal reste ouvert en cas d'erreur.
    emit('added', skill)
    lastAdded.value   = skill
    newSkill.value    = ''
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
@import '@/assets/profile.css';
</style>