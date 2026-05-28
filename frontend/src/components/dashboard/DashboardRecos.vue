<template>
  <section class="section section--spaced">
    <div class="section__header">
      <div class="section__title-row">
        <img src="@/assets/icons/recommandations.svg" class="icon icon--md" alt="" />
        <h2 class="section__title">Flux de Recommandations</h2>
      </div>
      <button class="btn btn--ghost" @click="$router.push('/recommendations')">Tout voir</button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="reco-featured">
      <div class="reco-featured__bar" />
      <div class="reco-featured__body">
        <div class="skeleton skeleton--full" />
        <div class="skeleton skeleton--full" />
        <div class="skeleton skeleton--short" />
      </div>
    </div>

    <!-- Vide -->
    <div v-else-if="!recos || recos.length === 0" class="empty-state empty-state--compact">
      <img src="@/assets/icons/recommandations.svg" class="icon icon--lg" alt="" />
      <p class="empty-state__title">Aucune recommandation pour le moment</p>
    </div>

    <template v-else>
      <!-- ── Recommandation principale (première VALIDE ou première dispo) ── -->
      <div class="reco-featured" :class="{ 'reco-featured--pending': featured.status === 'EN_ATTENTE' }">
        <div class="reco-featured__bar" />
        <div class="reco-featured__body">
          <!-- Badge statut -->
          <span class="status-badge" :class="statusClass(featured.status)">
            {{ statusLabel(featured.status) }}
          </span>

          <p class="reco-featured__quote-icon">❝❝</p>
          <p class="reco-featured__text">{{ featured.message }}</p>

          <div class="author">
            <div class="author__avatar" :style="avatarStyle(featured.auteur)">
              <img
                v-if="featured.auteur?.photo"
                :src="featured.auteur.photo"
                :alt="`${featured.auteur.prenom} ${featured.auteur.nom}`"
              />
              <span v-else>{{ getInitials(featured.auteur?.prenom, featured.auteur?.nom) }}</span>
            </div>
            <div class="author__info">
              <p class="author__name">
                {{ featured.auteur?.prenom }} {{ featured.auteur?.nom }}
              </p>
              <p class="author__role" v-if="getAuteurLabel(featured.auteur)">
                {{ getAuteurLabel(featured.auteur) }}
              </p>
              <p class="author__date" v-if="featured.date_creation">
                {{ formatDate(featured.date_creation) }}
              </p>
            </div>
          </div>

          <!-- Actions si EN_ATTENTE -->
          <div class="reco-actions" v-if="featured.status === 'EN_ATTENTE'">
            <button class="btn-accept" @click="$emit('valider', featured.id_recommandation, 'VALIDE')">
              ✓ Accepter
            </button>
            <button class="btn-reject" @click="$emit('valider', featured.id_recommandation, 'REJETE')">
              ✕ Rejeter
            </button>
          </div>
        </div>
      </div>

      <!-- ── Autres recommandations ──────────────────────────────────────── -->
      <div v-if="recos.length > 1" class="reco-grid">
        <div
          v-for="reco in recos.slice(1, 4)"
          :key="reco.id_recommandation"
          class="reco-card"
          :class="{ 'reco-card--pending': reco.status === 'EN_ATTENTE' }"
        >
          <div class="reco-card__header">
            <div class="author">
              <div class="author__avatar author__avatar--sm" :style="avatarStyle(reco.auteur)">
                <img
                  v-if="reco.auteur?.photo"
                  :src="reco.auteur.photo"
                  :alt="`${reco.auteur.prenom} ${reco.auteur.nom}`"
                />
                <span v-else>{{ getInitials(reco.auteur?.prenom, reco.auteur?.nom) }}</span>
              </div>
              <div class="author__info">
                <p class="author__name">
                  {{ reco.auteur?.prenom }} {{ reco.auteur?.nom }}
                  <span v-if="getAuteurLabel(reco.auteur)" class="text-muted">
                    · {{ getAuteurLabel(reco.auteur) }}
                  </span>
                </p>
              </div>
            </div>
            <span class="status-badge status-badge--sm" :class="statusClass(reco.status)">
              {{ statusLabel(reco.status) }}
            </span>
          </div>

          <p class="reco-card__text">{{ reco.message }}</p>

          <!-- Actions inline si EN_ATTENTE -->
          <div class="reco-actions reco-actions--sm" v-if="reco.status === 'EN_ATTENTE'">
            <button class="btn-accept btn-accept--sm" @click="$emit('valider', reco.id_recommandation, 'VALIDE')">✓</button>
            <button class="btn-reject btn-reject--sm" @click="$emit('valider', reco.id_recommandation, 'REJETE')">✕</button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getAuteurLabel } from '@/services/dashboardservices'

const props = defineProps({
  recos:   { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['valider'])

// Première recommandation à mettre en avant (VALIDE d'abord, sinon la première)
const featured = computed(() =>
  props.recos.find(r => r.status === 'VALIDE') ?? props.recos[0]
)

const getInitials = (prenom = '', nom = '') =>
  ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase()

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const statusLabel = (status) => ({
  VALIDE:     '✓ Validé',
  EN_ATTENTE: '⏳ En attente',
  REJETE:     '✕ Rejeté',
}[status] ?? status)

const statusClass = (status) => ({
  'badge--valide':     status === 'VALIDE',
  'badge--pending':    status === 'EN_ATTENTE',
  'badge--rejected':   status === 'REJETE',
})

// Couleur d'avatar selon le rôle
const ROLE_COLORS = {
  PROFESSIONNEL: '#0077b5',
  PROFESSEUR:    '#7c3aed',
  ETUDIANT:      '#059669',
  default:       '#6b7280',
}
const avatarStyle = (auteur) => ({
  background: ROLE_COLORS[auteur?.role] ?? ROLE_COLORS.default,
})
</script>

<style scoped>
@import '@/assets/dashboard.css';

/* ── Status badges ─────────────────────────────────────────────────────────── */
.status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.status-badge--sm { font-size: 9px; padding: 2px 7px; margin-bottom: 0; }

.badge--valide   { background: #d1fae5; color: #065f46; }
.badge--pending  { background: #fef3c7; color: #92400e; }
.badge--rejected { background: #fee2e2; color: #991b1b; }

/* ── Featured card états ───────────────────────────────────────────────────── */
.reco-featured--pending {
  border-left: 3px solid #f59e0b;
  opacity: .92;
}

/* ── Actions valider / rejeter ─────────────────────────────────────────────── */
.reco-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.reco-actions--sm { margin-top: 8px; }

.btn-accept, .btn-reject {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: opacity .15s;
}
.btn-accept       { background: #d1fae5; color: #065f46; }
.btn-accept:hover { background: #a7f3d0; }
.btn-reject       { background: #fee2e2; color: #991b1b; }
.btn-reject:hover { background: #fecaca; }

.btn-accept--sm, .btn-reject--sm {
  padding: 4px 10px;
  font-size: 11px;
}

/* ── Carte EN_ATTENTE ──────────────────────────────────────────────────────── */
.reco-card--pending {
  border: 1.5px dashed #f59e0b;
  background: #fffbeb;
}

/* ── Avatar avec photo ─────────────────────────────────────────────────────── */
.author__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  font-weight: 700;
}
.author__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author__date {
  font-size: 10px;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}
</style>