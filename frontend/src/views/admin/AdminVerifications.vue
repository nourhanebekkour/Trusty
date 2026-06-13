<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Vérifications</h1>
        <p class="page__subtitle">
          <template v-if="authStore.isSuperAdmin">Activités étudiantes et professionnels en attente de validation (vue globale).</template>
          <template v-else>Activités étudiantes en attente de validation — {{ authStore.user?.ecole || '' }}.</template>
        </p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary" @click="load"><AppIcon name="refresh" /> Rafraîchir</button>
      </div>
    </div>

    <div v-if="admin.error" class="error-banner">{{ admin.error }}</div>

    <div class="stats-row">
      <StatCard label="En attente" :value="admin.loading ? '…' : String(totalPending)">
        <template #icon><AppIcon name="clock" /></template>
      </StatCard>
      <StatCard label="Activités" :value="admin.loading ? '…' : String(activitiesCount)">
        <template #icon><AppIcon name="activity" /></template>
      </StatCard>
      <StatCard v-if="authStore.isSuperAdmin" label="Professionnels" :value="admin.loading ? '…' : String(prosCount)">
        <template #icon><AppIcon name="building" /></template>
      </StatCard>
    </div>

    <!-- Activités en attente -->
    <div class="section-label">ACTIVITÉS EN ATTENTE</div>

    <div v-if="admin.loading" class="state-msg">Chargement…</div>

    <template v-else>
      <div v-if="admin.verificationQueue.length === 0" class="state-msg">Aucune activité en attente de vérification.</div>

      <div class="verif-list">
        <div v-for="item in admin.verificationQueue" :key="item.id" class="verif-card">
          <div class="verif-card__badge">
            <span class="badge badge--activity">Activité</span>
          </div>

          <div class="verif-card__body">
            <div class="verif-card__header">
              <h3 class="verif-card__title">{{ item.title }}</h3>
              <span class="text-muted">{{ item.author }}</span>
            </div>
            <p class="verif-card__desc">{{ item.description || 'Aucune description' }}</p>
            <div class="verif-card__actions">
              <button class="btn btn--primary btn--sm" :disabled="admin.validatingId === item.id" @click="approve(item)"><AppIcon name="check" /> Approuver</button>
              <button class="btn btn--ghost btn--sm" :disabled="admin.validatingId === item.id" @click="reject(item)"><AppIcon name="x" /> Rejeter</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Professionnels en attente (Super Admin uniquement) -->
    <template v-if="authStore.isSuperAdmin">
      <div class="section-label" style="margin-top: 32px;">PROFESSIONNELS EN ATTENTE DE VALIDATION</div>

      <div v-if="admin.loading" class="state-msg">Chargement…</div>

      <template v-else>
        <div v-if="admin.professionalQueue.length === 0" class="state-msg">Aucun professionnel en attente de validation.</div>

        <div class="verif-list">
          <div v-for="item in admin.professionalQueue" :key="item.id" class="verif-card">
            <div class="verif-card__badge">
              <span class="badge badge--pro">Professionnel</span>
            </div>

            <div class="verif-card__body">
              <div class="verif-card__header">
                <h3 class="verif-card__title">{{ item.prenom }} {{ item.nom }}</h3>
                <span class="text-muted">{{ item.email }}</span>
              </div>
              <p class="verif-card__desc">
                <span v-if="item.entreprise">Entreprise : {{ item.entreprise }}</span>
                <span v-if="item.siret"> — SIRET : {{ item.siret }}</span>
                <span v-if="!item.entreprise && !item.siret">Aucune information professionnelle</span>
              </p>
              <div class="verif-card__actions">
                <button class="btn btn--primary btn--sm" :disabled="admin.validatingId === item.id" @click="approvePro(item)"><AppIcon name="check" /> Approuver</button>
                <button class="btn btn--ghost btn--sm" :disabled="admin.validatingId === item.id" @click="rejectPro(item)"><AppIcon name="x" /> Rejeter</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '../../components/ui/StatCard.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authstore'

const admin = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

const totalPending = computed(() =>
  admin.verificationQueue.length + (authStore.isSuperAdmin ? admin.professionalQueue.length : 0)
)

const activitiesCount = computed(() =>
  admin.verificationQueue.length
)

const prosCount = computed(() =>
  admin.professionalQueue.length
)

async function approve(item) {
  await admin.validateEntity(item.type, item.id, 'APPROUVE')
}

async function reject(item) {
  await admin.validateEntity(item.type, item.id, 'REJETE')
}

async function approvePro(item) {
  await admin.validateProfessional(item.id, 'VALIDE')
}

async function rejectPro(item) {
  await admin.validateProfessional(item.id, 'REJETE')
}

async function load() {
  await Promise.all([
    admin.fetchVerificationQueue(),
    ...(authStore.isSuperAdmin ? [admin.fetchProfessionalQueue()] : []),
  ])
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

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .page__header { flex-direction: column; gap: 12px; }
  .page__title { font-size: 20px; }
  .page__actions { width: 100%; }
  .page__actions .btn { flex: 1; justify-content: center; }
  .stats-row { flex-wrap: wrap; }
}
@media (max-width: 480px) {
  .stats-row { flex-direction: column; }
  .verif-card { flex-direction: column; }
  .verif-card__header { flex-direction: column; align-items: flex-start; gap: 6px; }
  .verif-card__actions { flex-wrap: wrap; }
}
</style>