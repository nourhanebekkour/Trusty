<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Vérifications</h1>
        <p class="page__subtitle">Activités étudiantes et professionnels en attente de validation.</p>
      </div>
      <div class="page__actions">
        <button
          class="btn btn--secondary"
          @click="load"
          :disabled="isRefreshLimited"
          :title="isRefreshLimited ? `Attendez ${refreshCountdown}s` : ''"
        >
          {{ isRefreshLimited ? `🔄 (${refreshCountdown}s)` : '🔄 Rafraîchir' }}
        </button>
      </div>
    </div>

    <div v-if="admin.error" class="error-banner" role="alert">
      Une erreur est survenue. Veuillez réessayer.
    </div>

    <div class="stats-row">
      <StatCard label="En attente" :value="admin.loading ? '…' : String(admin.verificationQueue.length)">
        <template #icon>🕐</template>
      </StatCard>
      <StatCard label="Activités" :value="admin.loading ? '…' : String(activitiesCount)">
        <template #icon>📋</template>
      </StatCard>
      <StatCard label="Professionnels" :value="admin.loading ? '…' : String(prosCount)">
        <template #icon>🏢</template>
      </StatCard>
    </div>

    <div v-if="admin.loading" class="state-msg">Chargement…</div>

    <template v-else>
      <div v-if="admin.verificationQueue.length === 0" class="state-msg">Aucun élément en attente de vérification.</div>

      <div class="verif-list">
        <div v-for="item in admin.verificationQueue" :key="item.id + '-' + item.type" class="verif-card">
          <div class="verif-card__badge">
            <span :class="['badge', item.type === 'ACTIVITE' ? 'badge--activity' : 'badge--pro']">
              {{ item.type === 'ACTIVITE' ? 'Activité' : 'Professionnel' }}
            </span>
          </div>

          <div class="verif-card__body">
            <div class="verif-card__header">
              <h3 class="verif-card__title">{{ sanitizeText(item.title) }}</h3>
              <span class="text-muted">{{ sanitizeText(item.author) }}</span>
            </div>
            <p class="verif-card__desc">{{ sanitizeText(item.description) || 'Aucune description' }}</p>
            <div class="verif-card__actions">
              <button
                class="btn btn--primary btn--sm"
                :disabled="admin.validatingId === item.id || isActionLimited"
                @click="approve(item)"
              >
                ✓ Approuver
              </button>
              <button
                class="btn btn--ghost btn--sm"
                :disabled="admin.validatingId === item.id || isActionLimited"
                @click="reject(item)"
              >
                ✕ Rejeter
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '../../components/ui/StatCard.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authstore'

const admin     = useAdminStore()
const authStore = useAuthStore()
const router    = useRouter()

// --- XSS : encodage des données affichées depuis l'API ---
const sanitizeText = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// --- Rate limiting : bouton Rafraîchir (cooldown 5s) ---
const REFRESH_COOLDOWN_MS = 5_000
const lastRefreshAt       = ref(0)
const refreshCountdown    = ref(0)
let   refreshInterval     = null

const isRefreshLimited = computed(() =>
  Date.now() - lastRefreshAt.value < REFRESH_COOLDOWN_MS
)

const startRefreshCountdown = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    const remaining = Math.ceil((lastRefreshAt.value + REFRESH_COOLDOWN_MS - Date.now()) / 1000)
    refreshCountdown.value = remaining > 0 ? remaining : 0
    if (refreshCountdown.value === 0) clearInterval(refreshInterval)
  }, 200)
}

// --- Rate limiting : actions Approuver / Rejeter (max 20 / 60s) ---
const ACTION_LIMIT     = 20
const ACTION_WINDOW_MS = 60_000
const actionTimestamps = ref([])

const isActionLimited = computed(() => {
  const now = Date.now()
  return actionTimestamps.value.filter(ts => now - ts < ACTION_WINDOW_MS).length >= ACTION_LIMIT
})

const recordAction = () => {
  const now = Date.now()
  actionTimestamps.value = [
    ...actionTimestamps.value.filter(ts => now - ts < ACTION_WINDOW_MS),
    now,
  ]
}

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// --- Validation de l'id et du type avant tout appel API ---
const ALLOWED_TYPES    = ['ACTIVITE', 'PROFESSIONNEL']
const ALLOWED_STATUSES = ['APPROUVE', 'REJETE']

const isValidItem = (item) => {
  if (!item || typeof item !== 'object') return false
  const idOk   = item.id !== null && item.id !== undefined
  const typeOk = ALLOWED_TYPES.includes(item.type)
  return idOk && typeOk
}

const activitiesCount = computed(() =>
  admin.verificationQueue.filter(v => v.type === 'ACTIVITE').length
)

const prosCount = computed(() =>
  admin.verificationQueue.filter(v => v.type === 'PROFESSIONNEL').length
)

async function approve(item) {
  if (!isValidItem(item) || isActionLimited.value) return
  recordAction()
  await admin.validateEntity(item.type, item.id, 'APPROUVE')
}

async function reject(item) {
  if (!isValidItem(item) || isActionLimited.value) return
  recordAction()
  await admin.validateEntity(item.type, item.id, 'REJETE')
}

async function load() {
  if (isRefreshLimited.value) return
  lastRefreshAt.value = Date.now()
  startRefreshCountdown()
  await admin.fetchVerificationQueue()
}

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }
  await load()
})
</script>

<style scoped>
.page           { padding: 32px; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.page__subtitle { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }

.error-banner {
  background: #fef2f2; border: 1px solid #fecaca;
  color: var(--color-danger); padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.state-msg { text-align: center; padding: 40px 24px; color: var(--color-text-tertiary); font-size: 14px; }

.verif-list { display: flex; flex-direction: column; gap: 12px; }

.verif-card {
  display: flex; gap: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 12px; padding: 20px;
  align-items: flex-start;
}
.verif-card__badge { flex-shrink: 0; }
.badge {
  display: inline-block; font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;
}
.badge--activity { background: var(--color-accent-light); color: var(--color-accent); }
.badge--pro      { background: var(--color-waiting-bg); color: var(--color-waiting-text); }

.verif-card__body { flex: 1; min-width: 0; }
.verif-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.verif-card__title  { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.verif-card__desc   { font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 12px; }
.verif-card__actions { display: flex; gap: 8px; }

.text-muted { color: var(--color-text-tertiary); font-size: 13px; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary   { background: var(--color-accent); color: #fff; }
.btn--primary:hover { background: var(--color-accent-hover); }
.btn--primary:disabled { background: var(--color-accent-border); cursor: not-allowed; }
.btn--secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn--secondary:hover { background: var(--color-surface-hover); }
.btn--ghost     { background: transparent; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
.btn--ghost:hover { background: var(--color-surface-hover); }
.btn--ghost:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--sm  { padding: 6px 12px; font-size: 12px; }
</style>