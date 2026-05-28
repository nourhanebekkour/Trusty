<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Messages</h1>
        <p>Échangez avec les étudiants suivis et partagez vos retours.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state">Chargement des conversations...</div>
    <div v-else-if="error" class="prof-error">{{ error }}</div>

    <section v-else class="messages-layout">
      <aside class="messages-list">
        <div class="messages-search">
          <input
            v-model="search"
            class="prof-input"
            placeholder="Rechercher un étudiant"
          />
        </div>

        <button
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          class="conversation-btn"
          :class="{ active: selectedConversation?.id === conversation.id }"
          @click="selectConversation(conversation)"
        >
          <strong>{{ conversation.studentName }}</strong>
          <span>{{ conversation.lastMessage || 'Aucun message récent' }}</span>
        </button>

        <div v-if="filteredConversations.length === 0" class="prof-empty">
          Aucune conversation.
        </div>
      </aside>

      <main class="chat-box">
        <div v-if="!selectedConversation" class="prof-empty">
          Sélectionnez une conversation.
        </div>

        <template v-else>
          <div class="chat-head">
            <strong>{{ selectedConversation.studentName }}</strong>
            <span>{{ selectedConversation.studentLevel || 'Étudiant' }}</span>
          </div>

          <div class="chat-body">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="message.senderRole === 'PROFESSOR' ? 'message-me' : 'message-other'"
            >
              <p>{{ message.content }}</p>
              <span>{{ formatDateTime(message.createdAt) }}</span>
            </div>
          </div>

          <div class="chat-actions">
            <button class="prof-btn prof-btn-secondary" @click="prepareRecommendation">
              Préparer recommandation
            </button>
          </div>

          <form class="chat-compose" @submit.prevent="sendMessage">
            <input
              v-model="messageText"
              class="prof-input"
              placeholder="Écrire votre message"
            />

            <button class="prof-btn prof-btn-primary" type="submit">
              Envoyer
            </button>
          </form>
        </template>
      </main>
    </section>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import '@/assets/professor-pages.css'
import {
  getProfessorConversations,
  getProfessorConversationMessages,
  sendProfessorConversationMessage,
} from '@/services/professorApi'

const loading = ref(false)
const error = ref(null)
const conversations = ref([])
const messages = ref([])
const selectedConversation = ref(null)
const search = ref('')
const messageText = ref('')
const toast = ref({ show: false, message: '' })

const filteredConversations = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return conversations.value

  return conversations.value.filter(item =>
    item.studentName?.toLowerCase().includes(query)
  )
})

async function loadConversations() {
  loading.value = true
  error.value = null

  try {
    const data = await getProfessorConversations()
    conversations.value = Array.isArray(data.conversations) ? data.conversations : []

    if (conversations.value.length > 0) {
      await selectConversation(conversations.value[0])
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les conversations.'
  } finally {
    loading.value = false
  }
}

async function selectConversation(conversation) {
  selectedConversation.value = conversation

  try {
    const data = await getProfessorConversationMessages(conversation.id)
    messages.value = Array.isArray(data.messages) ? data.messages : []
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de charger les messages.')
  }
}

async function sendMessage() {
  const content = messageText.value.trim()

  if (!content || !selectedConversation.value) {
    showToast('Veuillez écrire un message.')
    return
  }

  try {
    const data = await sendProfessorConversationMessage(selectedConversation.value.id, {
      content,
    })

    messages.value.push(data.message || {
      id: Date.now(),
      content,
      senderRole: 'PROFESSOR',
      createdAt: new Date().toISOString(),
    })

    messageText.value = ''
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible d’envoyer le message.')
  }
}

function prepareRecommendation() {
  messageText.value =
    'Je recommande cet étudiant pour son sérieux, son autonomie et la qualité de son travail.'
}

function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2800)
}

onMounted(loadConversations)
</script>

<style scoped>
.messages-layout {
  display: grid;
  grid-template-columns: 310px 1fr;
  height: calc(100vh - 150px);
  background: #FFFFFF;
  border: 1px solid #E5E0D6;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(13, 43, 43, 0.04);
}

.messages-list {
  background: #FAF8F2;
  border-right: 1px solid #E5E0D6;
  overflow-y: auto;
}

.messages-search {
  padding: 14px;
}

.messages-search .prof-input {
  width: 100%;
}

.conversation-btn {
  width: 100%;
  border: none;
  background: transparent;
  border-bottom: 1px solid #E5E0D6;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.conversation-btn strong {
  display: block;
  color: #263534;
  font-size: 13px;
}

.conversation-btn span {
  display: block;
  color: #6F7F7C;
  font-size: 12px;
  margin-top: 4px;
}

.conversation-btn:hover,
.conversation-btn.active {
  background: #D6EDE8;
}

.chat-box {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-head {
  padding: 14px 18px;
  border-bottom: 1px solid #E5E0D6;
}

.chat-head strong {
  display: block;
  font-size: 15px;
}

.chat-head span {
  color: #6F7F7C;
  font-size: 12px;
}

.chat-body {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  background: #FBFAF6;
}

.message {
  max-width: 68%;
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
}

.message p {
  margin: 0;
  line-height: 1.5;
}

.message span {
  display: block;
  margin-top: 6px;
  font-size: 10px;
  opacity: 0.7;
}

.message-me {
  margin-left: auto;
  background: #42A8C7;
  color: #FFFFFF;
}

.message-other {
  background: #FFFFFF;
  border: 1px solid #E5E0D6;
  color: #263534;
}

.chat-actions {
  padding: 10px 14px;
  border-top: 1px solid #E5E0D6;
}

.chat-compose {
  padding: 14px;
  border-top: 1px solid #E5E0D6;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.chat-compose .prof-input {
  width: 100%;
}

@media (max-width: 900px) {
  .messages-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .messages-list {
    border-right: none;
    max-height: 260px;
  }
}
</style>