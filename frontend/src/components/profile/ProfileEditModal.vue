<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Modifier le profil</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">

        <!-- ── Section verrouillée ───────────────────────── -->
        <p class="section-label">
          <span>🔒</span> Informations officielles
          <span class="section-hint">Non modifiables — contacter l'administration</span>
        </p>

        <div class="locked-grid">
          <div class="locked-field">
            <span class="locked-icon">👤</span>
            <div>
              <p class="locked-label">Prénom</p>
              <p class="locked-value">{{ user.prenom }}</p>
            </div>
          </div>
          <div class="locked-field">
            <span class="locked-icon">👤</span>
            <div>
              <p class="locked-label">Nom</p>
              <p class="locked-value">{{ user.nom }}</p>
            </div>
          </div>
          <div class="locked-field">
            <span class="locked-icon">✉</span>
            <div>
              <p class="locked-label">Email</p>
              <p class="locked-value">{{ user.email }}</p>
            </div>
          </div>
          <div class="locked-field">
            <span class="locked-icon">📞</span>
            <div>
              <p class="locked-label">Téléphone</p>
              <p class="locked-value">{{ user.telephone || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- ── Section éditable : profil académique ─────── -->
        <p class="section-label" style="margin-top: 1.2rem">
          <span>🎓</span> Profil académique
        </p>

        <div class="form-row">
          <div class="form-group">
            <label>Filière</label>
            <select v-model="form.filiere">
              <option value="">— Choisir —</option>
              <option v-for="f in filieres" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Année d'études</label>
            <select v-model.number="form.annee">
              <option value="">—</option>
              <option v-for="a in [1,2,3,4,5]" :key="a" :value="a">Année {{ a }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Objectif professionnel</label>
          <input v-model="form.objectif_professionnel" type="text" placeholder="Ex : Développeur fullstack, Data scientist..." />
        </div>

        <div class="form-group">
          <label>Biographie</label>
          <textarea v-model="form.biographie" rows="3" placeholder="Quelques mots sur vous, vos passions, vos projets..."></textarea>
        </div>

        <!-- ── Section éditable : coordonnées ───────────── -->
        <p class="section-label" style="margin-top: 1.2rem">
          <span>📍</span> Coordonnées
        </p>

        <div class="form-row">
          <div class="form-group">
            <label>Ville</label>
            <input v-model="form.ville" type="text" placeholder="Tanger, Rabat..." />
          </div>
          <div class="form-group">
            <label>Pays</label>
            <input v-model="form.pays" type="text" placeholder="Maroc" />
          </div>
        </div>

        <div class="form-group">
          <label>Adresse</label>
          <input v-model="form.adresse" type="text" placeholder="Rue, quartier..." />
        </div>

        <!-- ── Section éditable : liens ─────────────────── -->
        <p class="section-label" style="margin-top: 1.2rem">
          <span>🔗</span> Liens & réseaux
        </p>

        <div class="form-group with-prefix">
          <label>LinkedIn</label>
          <div class="input-prefix-wrap">
            <span class="input-prefix">linkedin.com/in/</span>
            <input
              v-model="linkedinSlug"
              type="text"
              placeholder="votre-profil"
            />
          </div>
        </div>

        <div class="form-group with-prefix">
          <label>GitHub</label>
          <div class="input-prefix-wrap">
            <span class="input-prefix">github.com/</span>
            <input v-model="form.github_username" type="text" placeholder="votre-username" />
          </div>
        </div>

        <div class="form-group">
          <label>Site web</label>
          <input v-model="form.site_web" type="url" placeholder="https://monsite.com" />
        </div>

        <!-- ── Visibilité ─────────────────────────────────── -->
        <p class="section-label" style="margin-top: 1.2rem">
          <span>👁</span> Visibilité du profil
        </p>

        <div class="visibility-options">
          <label
            v-for="opt in visibiliteOptions"
            :key="opt.value"
            class="vis-option"
            :class="{ active: form.visibilite_profil === opt.value }"
          >
            <input type="radio" v-model="form.visibilite_profil" :value="opt.value" hidden />
            <span class="vis-icon">{{ opt.icon }}</span>
            <div>
              <p class="vis-label">{{ opt.label }}</p>
              <p class="vis-desc">{{ opt.desc }}</p>
            </div>
          </label>
        </div>

      </div><!-- modal-body -->

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
        <button class="btn-save" @click="submit" :disabled="saving">
          <span v-if="saving" class="spinner-sm"></span>
          {{ saving ? 'Enregistrement...' : '💾 Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({ user: Object, saving: Boolean })
const emit  = defineEmits(['close', 'save'])

const filieres = ['GINF', 'GSEA', 'GSR', 'GIND', 'G2EI', 'CSI']

const visibiliteOptions = [
  { value: 'PUBLIC',                 icon: '🌍', label: 'Public',               desc: 'Visible par tout le monde' },
  { value: 'ENSEIGNANTS_UNIQUEMENT', icon: '🏫', label: 'Enseignants',           desc: 'Visible uniquement par les profs' },
  { value: 'LIEN_PARTAGE',           icon: '🔗', label: 'Lien partagé',          desc: 'Accessible via un lien direct' },
  { value: 'PRIVE',                  icon: '🔒', label: 'Privé',                 desc: 'Visible uniquement par vous' },
]

// Slug LinkedIn extrait de l'URL complète
const linkedinSlug = computed({
  get: () => {
    const url = form.linkedin_url ?? ''
    return url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '').replace(/\/$/, '')
  },
  set: (val) => {
    form.linkedin_url = val
      ? `https://www.linkedin.com/in/${val.replace(/^.*linkedin\.com\/in\//, '')}`
      : ''
  },
})

const form = reactive({
  // Champs étudiant éditables
  filiere:                props.user.etudiant?.filiere                ?? '',
  annee:                  props.user.etudiant?.annee                  ?? '',
  ville:                  props.user.etudiant?.ville                  ?? '',
  pays:                   props.user.etudiant?.pays                   ?? 'Maroc',
  adresse:                props.user.etudiant?.adresse                ?? '',
  biographie:             props.user.etudiant?.biographie             ?? '',
  linkedin_url:           props.user.etudiant?.linkedin_url           ?? '',
  github_username:        props.user.etudiant?.github_username        ?? '',
  site_web:               props.user.etudiant?.site_web               ?? '',
  objectif_professionnel: props.user.etudiant?.objectif_professionnel ?? '',
  visibilite_profil:      props.user.etudiant?.visibilite_profil      ?? 'PUBLIC',
})

// Resync si user change après sauvegarde
watch(() => props.user, (u) => {
  Object.assign(form, {
    filiere:                u.etudiant?.filiere                ?? '',
    annee:                  u.etudiant?.annee                  ?? '',
    ville:                  u.etudiant?.ville                  ?? '',
    pays:                   u.etudiant?.pays                   ?? 'Maroc',
    adresse:                u.etudiant?.adresse                ?? '',
    biographie:             u.etudiant?.biographie             ?? '',
    linkedin_url:           u.etudiant?.linkedin_url           ?? '',
    github_username:        u.etudiant?.github_username        ?? '',
    site_web:               u.etudiant?.site_web               ?? '',
    objectif_professionnel: u.etudiant?.objectif_professionnel ?? '',
    visibilite_profil:      u.etudiant?.visibilite_profil      ?? 'PUBLIC',
  })
}, { deep: true })

const submit = () => emit('save', { ...form })
</script>

<style scoped>
@import '@/assets/profile.css';

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: var(--color-surface);
  border-radius: 14px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-panel);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--color-text-primary); }
.close-btn {
  background: none; border: none; font-size: 18px;
  cursor: pointer; color: var(--color-text-tertiary); line-height: 1;
}
.close-btn:hover { color: var(--color-text-secondary); }

.modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  flex: 1;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}
.section-hint {
  font-size: 10px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-tertiary);
  margin-left: auto;
}

.locked-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.locked-field {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 8px 10px;
}
.locked-icon { font-size: 14px; flex-shrink: 0; }
.locked-label {
  font-size: 10px;
  color: var(--color-text-tertiary);
  margin: 0 0 1px;
  font-weight: 500;
}
.locked-value {
  font-size: 12px;
  color: var(--color-text-primary);
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.form-group label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: .04em;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 10px;
  border: 1.5px solid var(--color-border-light);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color .15s;
  outline: none;
  font-family: inherit;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-accent);
}

.input-prefix-wrap {
  display: flex;
  border: 1.5px solid var(--color-border-light);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color .15s;
}
.input-prefix-wrap:focus-within { border-color: var(--color-accent); }

.input-prefix {
  background: var(--color-surface-alt);
  padding: 8px 8px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  border-right: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
}

.input-prefix-wrap input {
  border: none;
  border-radius: 0;
  flex: 1;
  padding: 8px 10px;
}
.input-prefix-wrap input:focus { border-color: transparent; }

.visibility-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.vis-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1.5px solid var(--color-border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s;
}
.vis-option.active {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}
.vis-icon { font-size: 18px; flex-shrink: 0; }
.vis-label { font-size: 12px; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.vis-desc  { font-size: 10px; color: var(--color-text-tertiary); margin: 0; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.btn-cancel {
  padding: 9px 18px;
  border: 1.5px solid var(--color-border-light);
  border-radius: 8px;
  background: var(--color-surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all .15s;
}
.btn-cancel:hover { background: var(--color-surface-hover); }

.btn-save {
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-save:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-save:disabled { opacity: .6; cursor: not-allowed; }

.spinner-sm {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>