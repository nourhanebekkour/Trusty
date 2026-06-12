<template>
  <div class="activite-card" :class="typeClass">
    <div class="card-header">
      <div class="badges">
        <span class="badge type-badge" :class="typeClass">
          <span class="badge-dot"></span>
          {{ labelType }}
        </span>
        <span class="badge statut-badge" :class="statutClass">
          <span class="badge-dot"></span>
          {{ labelStatut }}
        </span>
      </div>
      <div class="card-actions">
        <button class="action-btn" title="Modifier" @click="$emit('edit', activite)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn danger" title="Supprimer" @click="confirmDelete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="card-body">
      <h3 class="activite-title">{{ activite.nom_activite }}</h3>
      <p class="activite-org">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        {{ activite.organisation }}
        <strong>· {{ activite.role }}</strong>
      </p>
      <p class="activite-desc">{{ activite.description }}</p>
    </div>

    <div class="card-meta">
      <span class="meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {{ formatDate(activite.date_debut) }} – {{ formatDate(activite.date_fin) }}
      </span>
      <span class="meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ duree }}
      </span>
      <span class="meta-item" v-if="activite.est_public">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        Public
      </span>
    </div>

    <div class="card-footer">
      <template v-if="activite.has_attestation">
        <span class="attestation-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Attestation jointe
        </span>
        <button class="footer-btn danger-sm" @click="$emit('delete-attestation', activite.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          </svg>
          Supprimer
        </button>
      </template>
      <template v-else>
        <label class="footer-btn upload-btn" :class="{ 'is-uploading': uploading }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {{ uploading ? 'Upload en cours...' : 'Joindre une attestation' }}
          <input type="file" hidden :disabled="uploading" @change="onFileChange" accept=".pdf,image/*" />
        </label>
      </template>
      <span v-if="uploadError" class="upload-error">{{ uploadError }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useActivitesStore } from '../../stores/activitesStore.js';
import { getUploadErrorMessage, validateUploadFile } from '@/utils/fileUpload';

const props = defineProps({ activite: { type: Object, required: true } });
const emit = defineEmits(['edit', 'delete-attestation']);
const store = useActivitesStore();
const uploading = ref(false);
const uploadError = ref(null);

const typeLabels = {
  EVENEMENT: 'Événement', HACKATHON: 'Hackathon',
  COMPETITION: 'Compétition', CLUB: 'Club', ENGAGEMENT: 'Engagement',
};

const labelType = computed(() => typeLabels[props.activite.type_activite] || props.activite.type_activite);
const labelStatut = computed(() => props.activite.statut === 'VALIDE' ? 'Validée' : 'En attente');

const typeClass = computed(() => ({
  'EVENEMENT': 'type-evenement', 'HACKATHON': 'type-hackathon',
  'COMPETITION': 'type-competition', 'CLUB': 'type-club', 'ENGAGEMENT': 'type-engagement',
}[props.activite.type_activite] || ''));

const statutClass = computed(() => props.activite.statut === 'VALIDE' ? 'statut-validee' : 'statut-attente');

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const duree = computed(() => {
  if (!props.activite.date_debut || !props.activite.date_fin) return '—';
  const ms = new Date(props.activite.date_fin) - new Date(props.activite.date_debut);
  const months = Math.round(ms / (1000 * 60 * 60 * 24 * 30));
  return months < 1 ? '< 1 mois' : `${months} mois`;
});

function confirmDelete() {
  if (confirm(`Supprimer "${props.activite.nom_activite}" ?`)) {
    store.removeActivite(props.activite.id);
  }
}

async function onFileChange(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;

  const fileError = validateUploadFile(file);
  if (fileError) {
    uploadError.value = fileError;
    return;
  }

  uploading.value = true;
  uploadError.value = null;
  try {
    await store.uploadAttestation(props.activite.id, file);
  } catch (error) {
    uploadError.value = getUploadErrorMessage(error, "Erreur lors de l'upload de l'attestation.");
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.activite-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: border-color 0.25s, box-shadow 0.25s;
  position: relative;
  overflow: hidden;
}

.activite-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 4px 0 0 4px;
}

.type-evenement::before { background: #e8a04a; }
.type-hackathon::before { background: #9b8ec4; }
.type-competition::before { background: var(--color-accent); }
.type-club::before { background: #4a9ec4; }
.type-engagement::before { background: #c45a5a; }

.activite-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-panel);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badges { display: flex; gap: 0.5rem; align-items: center; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
}

.type-evenement { background: rgba(232,160,74,0.15); color: #e8a04a; }
.type-evenement .badge-dot { background: #e8a04a; }
.type-hackathon { background: rgba(155,142,196,0.15); color: #9b8ec4; }
.type-hackathon .badge-dot { background: #9b8ec4; }
.type-competition { background: var(--color-accent-light); color: var(--color-accent); }
.type-competition .badge-dot { background: var(--color-accent); }
.type-club { background: rgba(74,158,196,0.15); color: #4a9ec4; }
.type-club .badge-dot { background: #4a9ec4; }
.type-engagement { background: rgba(196,90,90,0.15); color: #c45a5a; }
.type-engagement .badge-dot { background: #c45a5a; }

.statut-validee { background: var(--color-accent-light); color: var(--color-accent); }
.statut-validee .badge-dot { background: var(--color-accent); }
.statut-attente { background: rgba(232,160,74,0.15); color: #e8a04a; }
.statut-attente .badge-dot { background: #e8a04a; }

.card-actions { display: flex; gap: 0.4rem; }

.action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.action-btn.danger:hover {
  background: rgba(196, 90, 90, 0.15);
  border-color: rgba(196, 90, 90, 0.3);
  color: #c45a5a;
}

.card-body { display: flex; flex-direction: column; gap: 0.4rem; }

.activite-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.activite-org {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
  margin: 0;
}

.activite-org strong { color: var(--color-text-secondary); }

.activite-desc {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
  padding: 0.6rem 0.8rem;
  border-left: 2px solid var(--color-border-light);
}

.card-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.73rem;
  color: var(--color-text-tertiary);
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
}

.attestation-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--color-accent);
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  border: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text-secondary);
}

.footer-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.upload-btn { cursor: pointer; }
.upload-btn.is-uploading {
  opacity: 0.65;
  pointer-events: none;
}

.upload-error {
  font-size: 0.72rem;
  color: #c45a5a;
}

.danger-sm:hover {
  background: rgba(196, 90, 90, 0.1);
  border-color: rgba(196, 90, 90, 0.25);
  color: #c45a5a;
}
</style>
