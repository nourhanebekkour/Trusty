<template>
  <div class="comments-page">

    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Commentaires
        </h1>
        <p class="page-subtitle">Consultez les commentaires et échanges avec vos étudiants.</p>
      </div>
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Chargement des étudiants...</span>
    </div>

    <div v-else-if="error" class="state-box state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadStudents">Réessayer</button>
    </div>

    <section v-else class="comments-layout">
      <aside class="students-panel">
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" class="search-input" placeholder="Rechercher un étudiant" />
        </div>
        <div class="students-list">
          <button
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="student-item"
            :class="{ 'student-item--active': selectedConversation?.id === conv.id }"
            @click="selectConversation(conv)"
          >
            <div class="student-item__avatar">{{ initials(conv.studentName) }}</div>
            <div class="student-item__info">
              <div class="student-item__name">{{ conv.studentName }}</div>
              <div class="student-item__count">{{ commentCounts[conv.id] || 0 }} commentaire{{ commentCounts[conv.id] > 1 ? 's' : '' }}</div>
            </div>
          </button>
          <div v-if="filteredConversations.length === 0" class="panel-empty">Aucun étudiant trouvé.</div>
        </div>
      </aside>

      <main class="comments-panel">
        <div v-if="!selectedConversation" class="panel-empty panel-empty--center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="panel-empty__icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p class="panel-empty__title">Sélectionnez un étudiant</p>
          <p class="panel-empty__sub">Choisissez un étudiant pour voir ses commentaires.</p>
        </div>

        <template v-else>
          <div class="comment-header">
            <div class="comment-header__info">
              <div class="comment-header__avatar">{{ initials(selectedConversation.studentName) }}</div>
              <div>
                <div class="comment-header__name">{{ selectedConversation.studentName }}</div>
              </div>
            </div>
          </div>

          <div class="comments-timeline">
            <div v-if="commentsLoading" class="state-box" style="padding: 1.5rem;">
              <div class="spinner"></div>
              <span>Chargement...</span>
            </div>

            <div v-else-if="currentComments.length === 0" class="panel-empty panel-empty--center" style="padding: 2rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="panel-empty__icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p class="panel-empty__title">Aucun commentaire</p>
              <p class="panel-empty__sub">Aucun commentaire pour {{ selectedConversation.studentName }}.</p>
            </div>

            <div v-else class="timeline">
              <div
                v-for="(msg, i) in currentComments"
                :key="msg.id"
                class="comment-card"
                :style="{ animationDelay: i * 30 + 'ms' }"
              >
                <div class="comment-card__avatar">{{ initials(msg.senderName) }}</div>
                <div class="comment-card__body">
                  <div class="comment-card__top">
                    <span class="comment-card__author">{{ msg.senderName || 'Inconnu' }}</span>
                    <span class="comment-card__role" :class="roleClass(msg.senderRole)">{{ roleLabel(msg.senderRole) }}</span>
                    <span class="comment-card__date">{{ formatDate(msg.createdAt) }}</span>
                  </div>
                  <p class="comment-card__text">{{ msg.content }}</p>
                  <div class="comment-card__actions" v-if="msg.senderRole === 'PROFESSOR'">
                    <button class="btn-delete" @click="deleteComment(msg)">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="comment-input-bar">
            <textarea
              v-model="newMessage"
              class="comment-input"
              placeholder="Écrire un commentaire..."
              rows="1"
              @keydown.enter.exact.prevent="sendComment"
            ></textarea>
            <button class="btn-send" @click="sendComment" :disabled="sending || !newMessage.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </template>
      </main>
    </section>

    <div v-if="toast.show" class="toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  getProfessorConversations,
  getProfessorComments,
  createProfessorComment,
  deleteProfessorMessage,
} from '@/services/professorApi'

const conversations = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const selectedConversation = ref(null)
const comments = reactive({})
const commentsLoading = ref(false)
const toast = ref({ show: false, message: '' })
const newMessage = ref('')
const sending = ref(false)

const filteredConversations = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter(c => c.studentName?.toLowerCase().includes(q))
})

const commentCounts = computed(() => {
  const counts = {}
  Object.keys(comments).forEach(id => { counts[id] = comments[id].length })
  return counts
})

const currentComments = computed(() => comments[selectedConversation.value?.id] || [])

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

function roleLabel(role) {
  return role === 'PROFESSOR' ? 'Professeur' : 'Étudiant'
}

function roleClass(role) {
  return role === 'PROFESSOR' ? 'role-prof' : 'role-student'
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} jours`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 2800)
}

async function loadStudents() {
  loading.value = true
  error.value = null
  try {
    const data = await getProfessorConversations()
    const list = Array.isArray(data.conversations) ? data.conversations : []
    conversations.value = list
    if (list.length > 0) await selectConversation(list[0])
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les étudiants.'
  } finally { loading.value = false }
}

async function selectConversation(conv) {
  selectedConversation.value = conv
  if (comments[conv.id]) return
  commentsLoading.value = true
  try {
    const data = await getProfessorComments(conv.id)
    comments[conv.id] = Array.isArray(data.comments) ? data.comments : []
  } catch {
    comments[conv.id] = []
  } finally { commentsLoading.value = false }
}

async function deleteComment(msg) {
  try {
    await deleteProfessorMessage(msg.id)
    const list = comments[selectedConversation.value.id]
    if (list) comments[selectedConversation.value.id] = list.filter(m => m.id !== msg.id)
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de supprimer le commentaire.')
  }
}

async function sendComment() {
  const text = newMessage.value.trim()
  if (!text || !selectedConversation.value) return
  sending.value = true
  try {
    await createProfessorComment({
      studentId: selectedConversation.value.id,
      content: text,
      typeCible: 'PROFIL',
    })
    newMessage.value = ''
    const data = await getProfessorComments(selectedConversation.value.id)
    comments[selectedConversation.value.id] = Array.isArray(data.comments) ? data.comments : []
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible d\'envoyer le commentaire.')
  } finally { sending.value = false }
}

onMounted(loadStudents)
</script>

<style scoped>
* { box-sizing: border-box; }

.comments-page {
  font-family: 'Inter', sans-serif;
  background: var(--color-page-bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--color-text-primary);
}

.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 1.5rem;
  gap: 1rem; flex-wrap: wrap;
}
.page-title {
  font-size: 1.65rem; font-weight: 700; color: var(--color-text-primary);
  margin: 0 0 0.3rem; display: flex; align-items: center;
  gap: 0.55rem; letter-spacing: -0.02em;
}
.title-icon { color: var(--color-accent); opacity: 0.85; flex-shrink: 0; }
.page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: transparent; border: 1px solid var(--color-border);
  color: var(--color-text-secondary); padding: 0.5rem 1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-text-primary); }

.btn-delete {
  display: inline-flex; align-items: center; gap: 0.3rem;
  background: transparent; color: var(--color-danger);
  border: 1px solid #fecaca;
  padding: 0.25rem 0.55rem; border-radius: 6px;
  font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.btn-delete:hover { background: #fef2f2; }

.state-box {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 12px; padding: 2.5rem 1.5rem;
  color: var(--color-text-secondary); font-size: 0.875rem; flex-wrap: wrap;
}
.state-error { color: var(--color-danger); }

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--color-border); border-top-color: var(--color-accent);
  border-radius: 50%; animation: spin 0.75s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.comments-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  height: calc(100vh - 170px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-panel);
}

.students-panel {
  border-right: 1px solid var(--color-border);
  display: flex; flex-direction: column;
  background: var(--color-surface-alt);
}

.search-box {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.8rem; border-bottom: 1px solid var(--color-border);
}
.search-icon { flex-shrink: 0; opacity: 0.4; color: var(--color-text-secondary); }
.search-input {
  flex: 1; border: none; background: transparent;
  font-family: 'Inter', sans-serif; font-size: 0.82rem;
  color: var(--color-text-primary); outline: none;
}
.search-input::placeholder { color: var(--color-text-tertiary); }

.students-list { flex: 1; overflow-y: auto; }

.student-item {
  display: flex; align-items: center; gap: 0.7rem;
  width: 100%; padding: 0.75rem 0.8rem;
  border: none; background: transparent; text-align: left;
  cursor: pointer; transition: background 0.15s;
  border-bottom: 1px solid var(--color-border);
}
.student-item:hover { background: var(--color-surface-hover); }
.student-item--active { background: var(--color-accent-light) !important; border-left: 3px solid var(--color-accent); }

.student-item__avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--color-accent-light); color: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.student-item__info { flex: 1; min-width: 0; }
.student-item__name { font-size: 0.82rem; font-weight: 600; color: var(--color-text-primary); }
.student-item__count { font-size: 0.7rem; color: var(--color-text-tertiary); margin-top: 2px; }

.panel-empty { padding: 1.5rem; text-align: center; color: var(--color-text-tertiary); font-size: 0.82rem; }
.panel-empty--center {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.5rem; height: 100%;
}
.panel-empty__icon { opacity: 0.35; color: var(--color-accent); }
.panel-empty__title { font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.panel-empty__sub { font-size: 0.8rem; color: var(--color-text-tertiary); margin: 0; max-width: 260px; }

.comments-panel { display: flex; flex-direction: column; min-width: 0; }

.comment-header {
  display: flex; align-items: center; padding: 0.9rem 1.2rem;
  border-bottom: 1px solid var(--color-border);
}
.comment-header__info { display: flex; align-items: center; gap: 0.7rem; }
.comment-header__avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--color-accent-light); color: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.comment-header__name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }

.comments-timeline {
  flex: 1; overflow-y: auto; padding: 1rem 1.2rem;
  background: var(--color-surface-alt);
}

.timeline { display: flex; flex-direction: column; gap: 0.75rem; }

.comment-card {
  display: flex; gap: 0.8rem;
  opacity: 0; animation: fadeUp 0.3s ease forwards;
}
.comment-card__avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-accent-light); color: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 4px;
}
.comment-card__body {
  flex: 1; background: var(--color-surface);
  border: 1px solid var(--color-border); border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.comment-card__body:hover {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-panel);
}
.comment-card__top {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.4rem; flex-wrap: wrap;
}
.comment-card__author { font-size: 0.82rem; font-weight: 600; color: var(--color-text-primary); }
.comment-card__role {
  font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.45rem;
  border-radius: 20px; letter-spacing: 0.04em;
}
.role-prof { background: var(--color-accent-light); color: var(--color-accent); }
.role-student { background: var(--color-surface-hover); color: var(--color-text-secondary); }
.comment-card__date { font-size: 0.68rem; color: var(--color-text-tertiary); margin-left: auto; }
.comment-card__text {
  font-size: 0.84rem; color: var(--color-text-secondary);
  line-height: 1.6; margin: 0; white-space: pre-wrap;
}
.comment-card__actions {
  margin-top: 0.5rem; padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: flex-end;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.comment-input-bar {
  display: flex; align-items: end; gap: 0.5rem;
  padding: 0.75rem 1.2rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}
.comment-input {
  flex: 1; resize: none;
  border: 1px solid var(--color-border);
  border-radius: 10px; padding: 0.55rem 0.75rem;
  font-family: 'Inter', sans-serif; font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
  outline: none; line-height: 1.4;
}
.comment-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
.comment-input::placeholder { color: var(--color-text-tertiary); }
.btn-send {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: 10px; border: none;
  background: var(--color-accent); color: var(--color-page-bg);
  cursor: pointer; transition: background 0.18s; flex-shrink: 0;
}
.btn-send:hover { background: var(--color-accent-hover); }
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }

.toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--color-text-primary); color: var(--color-page-bg);
  padding: 0.75rem 1.2rem; border-radius: 10px;
  font-size: 0.84rem; font-weight: 500; z-index: 300;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  animation: fadeUp 0.25s ease;
}

@media (max-width: 900px) {
  .comments-page { padding: 1.25rem 1rem 3rem; }
  .comments-layout { grid-template-columns: 1fr; height: auto; }
  .students-panel { max-height: 240px; border-right: none; border-bottom: 1px solid var(--color-border); }
  .comments-timeline { min-height: 300px; }
}
</style>
