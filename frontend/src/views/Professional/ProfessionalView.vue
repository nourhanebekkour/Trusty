<template>
  <div class="prof-page">

    <!-- Page Header -->
    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </h1>
        <p>Vue d'ensemble de votre activité sur la plateforme.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement du tableau de bord...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ sanitizedError }}</span>
      <button class="btn-ghost" style="margin-left: auto;" @click="loadDashboard">Réessayer</button>
    </div>

    <template v-else>
      <!-- Stats Row -->
      <div class="prof-stats-row">
        <div class="prof-stat-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div>
            <div class="stat-label">Notifications</div>
            <div class="stat-value">{{ stats.notifications }}</div>
          </div>
        </div>
        <div class="prof-stat-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div>
            <div class="stat-label">Recommandations</div>
            <div class="stat-value">{{ stats.recommandations }}</div>
          </div>
        </div>
        <div class="prof-stat-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <div class="stat-label">Stages</div>
            <div class="stat-value">{{ stats.stages }}</div>
          </div>
        </div>
        <div class="prof-stat-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <div>
            <div class="stat-label">Projets</div>
            <div class="stat-value">{{ stats.projets }}</div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">
        <!-- Left: Timeline -->
        <div class="dashboard-main">
          <div class="prof-info-card">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 6px; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Actions récentes
            </h3>
            <div v-if="actions.length === 0" class="prof-panel-empty" style="padding: 20px;">
              <p class="prof-panel-empty__sub">Aucune action récente.</p>
            </div>
            <div v-else class="prof-timeline" style="margin-top: 8px;">
              <div v-for="(a, i) in actions.slice(0, 8)" :key="a.id" class="prof-timeline-item" :style="{ animationDelay: i * 30 + 'ms' }">
                <div class="prof-timeline-dot" :class="dotClass(a)"></div>
                <div class="prof-timeline-card">
                  <div class="prof-timeline-header">
                    <span class="prof-timeline-type" :class="typeClass(a)">{{ typeLabel(a) }}</span>
                    <span class="prof-timeline-date">{{ formatDate(a.createdAt) }}</span>
                  </div>
                  <p class="prof-timeline-desc">{{ sanitizeText(a.description) }}</p>
                  <div class="prof-timeline-meta" v-if="a.entity">
                    <span class="meta-badge">{{ sanitizeText(a.entity) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Quick Recommend + Recent Notifications -->
        <div class="dashboard-side">
          <div class="prof-info-card" style="margin-bottom: 14px;">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 6px; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Recommandation rapide
            </h3>
            <div class="quick-rec-form">
              <input
                v-model="recForm.studentName"
                class="form-input"
                placeholder="Nom de l'étudiant"
                style="margin-bottom: 8px; width: 100%; box-sizing: border-box;"
                maxlength="100"
                autocomplete="off"
                @input="recForm.studentName = recForm.studentName.slice(0, 100)"
              />
              <textarea
                v-model="recForm.message"
                class="form-textarea"
                placeholder="Message de recommandation..."
                rows="3"
                style="margin-bottom: 8px; width: 100%; box-sizing: border-box;"
                maxlength="2000"
                @input="recForm.message = recForm.message.slice(0, 2000)"
              ></textarea>
              <!-- Compteur de caractères -->
              <div class="rec-char-count">{{ recForm.message.length }} / 2000</div>
              <button
                class="btn-primary"
                @click="submitQuickRec"
                :disabled="sendingRec || !isRecFormValid"
                style="width: 100%; justify-content: center;"
              >
                <span v-if="sendingRec" class="spinner-sm"></span>
                <template v-else>Envoyer</template>
              </button>
              <!-- Message de validation en ligne -->
              <p v-if="recFormError" class="rec-form-error">{{ recFormError }}</p>
            </div>
          </div>

          <div class="prof-info-card">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 6px; vertical-align: middle;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              Notifications récentes
            </h3>
            <div v-if="notifications.length === 0" class="prof-panel-empty" style="padding: 16px;">
              <p class="prof-panel-empty__sub">Aucune notification.</p>
            </div>
            <div v-else class="notif-mini-list">
              <div v-for="n in notifications.slice(0, 4)" :key="n.id" class="notif-mini-item">
                <div class="notif-mini-dot" :class="'dot-' + sanitizeType(n.type)"></div>
                <div class="notif-mini-content">
                  <div class="notif-mini-title">{{ sanitizeText(n.title) }}</div>
                  <div class="notif-mini-date">{{ formatDate(n.createdAt) }}</div>
                </div>
              </div>
              <router-link to="/professional/notifications" class="notif-mini-link">Voir toutes les notifications</router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Toast avec message sanitisé -->
    <div v-if="toast.show" class="prof-toast">{{ sanitizeText(toast.message) }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'
import {
  getProfessionalNotifications,
  getProfessionalActionHistory,
  getProfessionalInternships,
  getProfessionalProjects,
  createProfessionalRecommendation,
} from '@/services/professionalApi'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const toast = ref({ show: false, message: '' })
const sendingRec = ref(false)
const recFormError = ref('')

const stats = reactive({ notifications: 0, recommandations: 0, stages: 0, projets: 0 })
const actions = ref([])
const notifications = ref([])

const recForm = reactive({ studentName: '', message: '' })

//  Guard de rôle ──
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await router.replace('/login')
    return
  }
  const role = authStore.user?.role || authStore.role
  if (role !== 'PROFESSIONAL') {
    await router.replace('/')
    return
  }
  loadDashboard()
})

// Sanitisation XSS ─
function sanitizeText(value) {
  if (!value || typeof value !== 'string') return ''
  if (value.length > 2000) return value.slice(0, 2000) + '…'
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(value))
  return div.innerHTML
}

// Sanitisation du type de notification ──
const ALLOWED_TYPES = new Set([
  'validation', 'valide', 'rejet', 'rejete',
  'commentaire', 'recommandation', 'creation',
  'en_attente', 'pending', 'default',
])
function sanitizeType(type) {
  if (!type || typeof type !== 'string') return 'default'
  const t = type.toLowerCase().replace(/[^a-z_]/g, '')
  return ALLOWED_TYPES.has(t) ? t : 'default'
}

// Message d'erreur générique ──
const sanitizedError = computed(() => {
  if (!error.value) return ''
  return 'Impossible de charger le tableau de bord.'
})

// Validation du formulaire de recommandation ──
const STUDENT_NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-]{2,100}$/

const isRecFormValid = computed(() => {
  const name = recForm.studentName.trim()
  const msg  = recForm.message.trim()
  return (
    name.length >= 2 &&
    name.length <= 100 &&
    STUDENT_NAME_REGEX.test(name) &&
    msg.length >= 10 &&
    msg.length <= 2000
  )
})

// Anti double-soumission ──
let submitting = false

function dotClass(a) {
  const t = (a.type || '').toUpperCase()
  if (t === 'VALIDATION' || t === 'VALIDE')                                  return 'dot-valid'
  if (t === 'REJET'      || t === 'REJETE')                                  return 'dot-reject'
  if (t === 'COMMENTAIRE'|| t === 'RECOMMANDATION' || t === 'CREATION')      return 'dot-info'
  if (t === 'EN_ATTENTE' || t === 'PENDING')                                 return 'dot-pending'
  return 'dot-default'
}
function typeClass(a) {
  const t = (a.type || '').toUpperCase()
  if (t === 'VALIDATION' || t === 'VALIDE')                                  return 'type-valid'
  if (t === 'REJET'      || t === 'REJETE')                                  return 'type-reject'
  if (t === 'COMMENTAIRE'|| t === 'RECOMMANDATION' || t === 'CREATION')      return 'type-info'
  if (t === 'EN_ATTENTE' || t === 'PENDING')                                 return 'type-pending'
  return 'type-default'
}
function typeLabel(a) {
  const map = {
    VALIDATION: 'Validation', VALIDE: 'Validé', REJET: 'Rejet', REJETE: 'Rejeté',
    COMMENTAIRE: 'Commentaire', RECOMMANDATION: 'Recommandation', CREATION: 'Création',
    EN_ATTENTE: 'En attente', PENDING: 'En attente',
  }
  return map[(a.type || '').toUpperCase()] || 'Action'
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const now  = new Date()
  const diff = now - date
  if (diff < 0) return 'À l\'instant'   // 10. Date future : pas de valeur négative
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7)   return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ── 11. Normalisation des données backend ──
function normalizeAction(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id:          raw.id          ?? null,
    type:        typeof raw.type        === 'string' ? raw.type.slice(0, 50)        : '',
    description: typeof raw.description === 'string' ? raw.description.slice(0, 500): '',
    entity:      typeof raw.entity      === 'string' ? raw.entity.slice(0, 200)     : '',
    createdAt:   raw.createdAt   ?? null,
  }
}
function normalizeNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id:        raw.id    ?? null,
    title:     typeof raw.title === 'string' ? raw.title.slice(0, 200) : '',
    type:      typeof raw.type  === 'string' ? raw.type.slice(0, 50)  : '',
    createdAt: raw.createdAt ?? null,
  }
}

async function loadDashboard() {
  loading.value = true
  error.value = null
  try {
    const [notifRes, histRes, stagesRes, projetsRes] = await Promise.allSettled([
      getProfessionalNotifications(),
      getProfessionalActionHistory(),
      getProfessionalInternships(),
      getProfessionalProjects(),
    ])

    // Redirection sur 401/403 dans chaque résultat
    for (const res of [notifRes, histRes, stagesRes, projetsRes]) {
      if (res.status === 'rejected') {
        const status = res.reason?.response?.status
        if (status === 401 || status === 403) {
          await router.replace('/login')
          return
        }
      }
    }

    const notifData  = notifRes.status  === 'fulfilled' ? notifRes.value  : { notifications: [] }
    const histData   = histRes.status   === 'fulfilled' ? histRes.value   : { actions: [] }
    const stagesData = stagesRes.status === 'fulfilled' ? stagesRes.value : []
    const projetsData= projetsRes.status=== 'fulfilled' ? projetsRes.value: []

    // Normaliser avant stockage
    notifications.value = (notifData.notifications || [])
      .map(normalizeNotification)
      .filter(Boolean)

    actions.value = (histData.actions || [])
      .map(normalizeAction)
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    stats.notifications  = notifications.value.length
    stats.stages         = Array.isArray(stagesData)  ? stagesData.length  : 0
    stats.projets        = Array.isArray(projetsData) ? projetsData.length : 0
    stats.recommandations= 0
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProfessionalView] loadDashboard:', err)
    error.value = 'Impossible de charger le tableau de bord.'
  } finally {
    loading.value = false
  }
}

async function submitQuickRec() {
  recFormError.value = ''

  // Validation avant envoi
  if (!isRecFormValid.value) {
    const name = recForm.studentName.trim()
    if (name.length < 2)                    recFormError.value = 'Le nom doit contenir au moins 2 caractères.'
    else if (!STUDENT_NAME_REGEX.test(name)) recFormError.value = 'Le nom contient des caractères non autorisés.'
    else if (recForm.message.trim().length < 10) recFormError.value = 'Le message doit contenir au moins 10 caractères.'
    return
  }

  // Anti double-soumission
  if (submitting) return
  submitting = true
  sendingRec.value = true

  try {
    await createProfessionalRecommendation({
      studentId: recForm.studentName.trim(),
      message:   recForm.message.trim(),
    })
    showToast('Recommandation envoyée.')
    stats.recommandations++
    recForm.studentName = ''
    recForm.message     = ''
  } catch (err) {
    if (import.meta.env.DEV) console.error('[ProfessionalView] submitQuickRec:', err)
    // Redirection sur 401/403, message générique sinon
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      await router.replace('/login')
      return
    }
    showToast('Erreur lors de l\'envoi de la recommandation.')
  } finally {
    sendingRec.value = false
    submitting = false
  }
}
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 18px;
  align-items: start;
}
.dashboard-side {
  display: flex;
  flex-direction: column;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent, #3D6B5E);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover { background: var(--color-accent-hover, #2E5449); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary, #6B7280);
  font-size: 11px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover { color: var(--color-accent, #3D6B5E); border-color: var(--color-accent, #3D6B5E); }

.notif-mini-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.notif-mini-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border, #D6D0C4);
}
.notif-mini-item:last-child { border-bottom: none; }
.notif-mini-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
.notif-mini-dot.dot-validation, .notif-mini-dot.dot-valide { background: var(--color-valid-text, #358C2C); }
.notif-mini-dot.dot-recommandation { background: var(--color-waiting-text, #A96F00); }
.notif-mini-dot.dot-commentaire { background: var(--color-purple-text, #2086A3); }
.notif-mini-dot.dot-default { background: var(--color-text-tertiary, #9CA3AF); }
.notif-mini-content { flex: 1; min-width: 0; }
.notif-mini-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary, #0F1B2D);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notif-mini-date {
  font-size: 10px;
  color: var(--color-text-tertiary, #9CA3AF);
}
.notif-mini-link {
  display: block;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-accent, #3D6B5E);
  text-decoration: none;
  padding: 6px 0;
}
.notif-mini-link:hover { text-decoration: underline; }

.quick-rec-form .form-input,
.quick-rec-form .form-textarea {
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 8px;
  background: var(--color-surface, #FFFFFF);
  color: var(--color-text-primary, #0F1B2D);
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  outline: none;
  padding: 8px 10px;
}
.quick-rec-form .form-input:focus,
.quick-rec-form .form-textarea:focus {
  border-color: var(--color-accent, #3D6B5E);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #3D6B5E) 16%, transparent);
}

/* 17. Styles sécurité ajoutés */
.rec-char-count {
  font-size: 11px;
  color: var(--color-text-tertiary, #9CA3AF);
  text-align: right;
  margin-bottom: 6px;
}
.rec-form-error {
  font-size: 11px;
  color: var(--color-danger, #DC2626);
  margin: 6px 0 0;
  padding: 0;
}

@media (max-width: 960px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>