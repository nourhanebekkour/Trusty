<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Commentaires
        </h1>
        <p>Consultez et échangez des commentaires avec les étudiants.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement...</span>
    </div>

    <div v-else-if="fetchError" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ fetchError }}</span>
      <button class="btn-ghost" @click="init">Réessayer</button>
    </div>

    <section v-else class="prof-comments-layout">
      <aside class="prof-students-panel">
        <div class="prof-search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" class="prof-search-input" placeholder="Rechercher un étudiant" />
        </div>
        <div class="prof-students-list">
          <button v-for="conv in filteredConversations" :key="conv.id" class="prof-student-item" :class="{ 'prof-student-item--active': selectedConv?.id === conv.id }" @click="selectConv(conv)">
            <div class="prof-student-item__avatar">{{ initials(conv.name) }}</div>
            <div class="prof-student-item__info">
              <div class="prof-student-item__name">{{ conv.name }}</div>
              <div class="prof-student-item__count">{{ conv.count }} commentaire{{ conv.count > 1 ? 's' : '' }}</div>
            </div>
          </button>
          <div v-if="filteredConversations.length === 0" class="prof-panel-empty" style="padding: 16px;">
            <p class="prof-panel-empty__sub">Aucun étudiant trouvé.</p>
          </div>
        </div>
      </aside>

      <main class="prof-comments-panel">
        <div v-if="!selectedConv" class="prof-panel-empty prof-panel-empty--center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="prof-panel-empty__icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p class="prof-panel-empty__title">Sélectionnez un étudiant</p>
          <p class="prof-panel-empty__sub">Choisissez un étudiant pour voir ses commentaires.</p>
        </div>

        <template v-else>
          <div class="prof-comment-header">
            <div class="prof-comment-header__info">
              <div class="prof-comment-header__avatar">{{ initials(selectedConv.name) }}</div>
              <div>
                <div class="prof-comment-header__name">{{ selectedConv.name }}</div>
              </div>
            </div>
          </div>

          <div class="prof-comments-timeline">
            <div v-if="commentsLoading" class="prof-panel-empty prof-panel-empty--center" style="padding: 1.5rem;">
              <div class="spinner"></div>
            </div>
            <div v-else-if="currentComments.length === 0" class="prof-panel-empty prof-panel-empty--center" style="padding: 2rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="prof-panel-empty__icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p class="prof-panel-empty__title">Aucun commentaire</p>
              <p class="prof-panel-empty__sub">Aucun commentaire pour {{ selectedConv.name }}.</p>
            </div>
            <div v-else>
              <div v-for="(msg, i) in currentComments" :key="msg.id" class="prof-comment-card" :style="{ animationDelay: i * 30 + 'ms' }">
                <div class="prof-comment-card__avatar">{{ initials(msg.senderName) }}</div>
                <div class="prof-comment-card__body">
                  <div class="prof-comment-card__top">
                    <span class="prof-comment-card__author">{{ msg.senderName || 'Inconnu' }}</span>
                    <span class="prof-comment-card__role" :class="roleClass(msg.senderRole)">{{ roleLabel(msg.senderRole) }}</span>
                    <span class="prof-comment-card__date">{{ formatDate(msg.createdAt) }}</span>
                  </div>
                  <p class="prof-comment-card__text">{{ msg.content }}</p>
                  <div class="prof-comment-card__actions" v-if="msg.senderRole === 'PROFESSIONAL'">
                    <button class="btn-delete" @click="deleteComment(msg)">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="prof-comment-input-bar">
            <textarea v-model="newMessage" class="prof-comment-input" placeholder="Écrire un commentaire..." rows="1" @keydown.enter.exact.prevent="sendComment"></textarea>
            <button class="btn-send" @click="sendComment" :disabled="sending || !newMessage.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </template>
      </main>
    </section>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { getProfessionalComments, createProfessionalComment, deleteProfessionalComment } from '@/services/professionalApi'

const loading = ref(true)
const fetchError = ref(null)
const search = ref('')
const selectedConv = ref(null)
const commentsMap = reactive({})
const commentsLoading = ref(false)
const toast = ref({ show: false, message: '' })
const newMessage = ref('')
const sending = ref(false)

const conversations = ref([
  { id: 'etudiant-1', name: 'Alice Martin', count: 0 },
  { id: 'etudiant-2', name: 'Bob Dupont', count: 0 },
  { id: 'etudiant-3', name: 'Claire Dubois', count: 0 },
  { id: 'etudiant-4', name: 'David Leroy', count: 0 },
  { id: 'etudiant-5', name: 'Emma Petit', count: 0 },
])

const filteredConversations = computed(() => {
  if (!search.value.trim()) return conversations.value
  const q = search.value.toLowerCase()
  return conversations.value.filter(c => c.name.toLowerCase().includes(q))
})

const currentComments = computed(() => {
  if (!selectedConv.value) return []
  return commentsMap[selectedConv.value.id] || []
})

function initials(name) {
  return String(name || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}
function roleLabel(role) {
  return role === 'PROFESSIONAL' ? 'Professionnel' : role === 'PROFESSOR' ? 'Professeur' : 'Étudiant'
}
function roleClass(role) {
  return role === 'PROFESSIONAL' ? 'role-professional' : 'role-student'
}
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 3000)
}

async function init() {
  loading.value = true
  fetchError.value = null
  try {
    const results = await Promise.allSettled(
      conversations.value.map(conv =>
        getProfessionalComments(conv.id).then(data => {
          const comments = data.comments || []
          conv.count = comments.length
          commentsMap[conv.id] = comments
        })
      )
    )
    results.forEach(r => {
      if (r.status === 'rejected') console.warn('Failed to load comments for a student:', r.reason)
    })
  } catch (err) {
    fetchError.value = 'Impossible de charger les commentaires.'
  } finally {
    loading.value = false
  }
}

async function selectConv(conv) {
  selectedConv.value = conv
  commentsLoading.value = true
  try {
    const data = await getProfessionalComments(conv.id)
    const comments = data.comments || []
    conv.count = comments.length
    commentsMap[conv.id] = comments
  } catch {
    commentsMap[conv.id] = []
  } finally {
    commentsLoading.value = false
  }
}

async function sendComment() {
  if (!selectedConv.value || !newMessage.value.trim()) return
  sending.value = true
  try {
    const res = await createProfessionalComment({
      studentId: selectedConv.value.id,
      content: newMessage.value.trim(),
    })
    if (res.comment) {
      commentsMap[selectedConv.value.id] = [...(commentsMap[selectedConv.value.id] || []), res.comment]
    }
    newMessage.value = ''
    selectedConv.value.count++
  } catch {
    showToast('Impossible d\'envoyer le commentaire.')
  } finally {
    sending.value = false
  }
}

async function deleteComment(msg) {
  if (!selectedConv.value) return
  try {
    await deleteProfessionalComment(msg.id)
    commentsMap[selectedConv.value.id] = (commentsMap[selectedConv.value.id] || []).filter(c => c.id !== msg.id)
    selectedConv.value.count = Math.max(0, selectedConv.value.count - 1)
  } catch {
    showToast('Impossible de supprimer le commentaire.')
  }
}

onMounted(init)
</script>
