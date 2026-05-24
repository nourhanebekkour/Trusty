<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Modifier le profil</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <p class="modal-section-label">Informations générales</p>
        <label>Prénom</label>
        <input v-model="form.prenom"    type="text" placeholder="Prénom"       maxlength="50" />
        <label>Nom</label>
        <input v-model="form.nom"       type="text" placeholder="Nom"          maxlength="50" />
        <label>Téléphone</label>
        <input v-model="form.telephone" type="text" placeholder="+212 6 ..."   maxlength="20" />

        <p class="modal-section-label" style="margin-top:1rem">Profil étudiant</p>
        <label>Ville</label>
        <input v-model="form.ville" type="text" placeholder="Fès, Maroc"       maxlength="100" />
        <label>Biographie</label>
        <textarea v-model="form.biographie" rows="3" placeholder="Quelques mots sur vous..." maxlength="500"></textarea>
        <label>LinkedIn</label>
        <input v-model="form.linkedin_url" type="url" placeholder="https://linkedin.com/in/..." maxlength="200" />
        <label>GitHub</label>
        <input v-model="form.github_username" type="text" placeholder="votre-username"          maxlength="39" />
        <label>Objectif professionnel</label>
        <input v-model="form.objectif_professionnel" type="text" placeholder="Développeur fullstack, Data scientist..." maxlength="200" />
      </div>

      <div class="modal-footer">
        <button class="btn-outline" @click="$emit('close')">Annuler</button>
        <button class="btn-primary" @click="handleSave" :disabled="saving || !isFormValid">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

const props = defineProps({ user: Object, saving: Boolean })
const emit  = defineEmits(['close', 'save'])

// ── Helpers de sanitisation ───────────────────────────────────────────────────

const sanitizeStr = (val, maxLen = 500) =>
  typeof val === 'string'
    ? val.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLen)
    : ''

const sanitizeUrl = (val, allowedHost) => {
  const cleaned = sanitizeStr(val, 200)
  if (!cleaned) return ''
  try {
    const url = new URL(cleaned)
    if (url.protocol !== 'https:') return ''
    if (allowedHost && !url.hostname.endsWith(allowedHost)) return ''
    return cleaned
  } catch {
    return ''
  }
}

/** Retourne uniquement les caractères autorisés dans un pseudo GitHub. */
const sanitizeGithubUsername = (val) =>
  sanitizeStr(val, 39).replace(/[^a-zA-Z0-9-]/g, '')

// ── Initialisation du formulaire depuis les deux sources (Utilisateur + Etudiant)
const form = reactive({
  prenom:                 props.user.prenom                         ?? '',
  nom:                    props.user.nom                            ?? '',
  telephone:              props.user.telephone                      ?? '',
  ville:                  props.user.etudiant?.ville                ?? '',
  biographie:             props.user.etudiant?.biographie           ?? '',
  linkedin_url:           props.user.etudiant?.linkedin_url         ?? '',
  github_username:        props.user.etudiant?.github_username      ?? '',
  objectif_professionnel: props.user.etudiant?.objectif_professionnel ?? '',
})

// Resynchroniser si l'objet user change 
watch(() => props.user, (u) => {
  form.prenom                 = u.prenom                            ?? ''
  form.nom                    = u.nom                               ?? ''
  form.telephone              = u.telephone                         ?? ''
  form.ville                  = u.etudiant?.ville                   ?? ''
  form.biographie             = u.etudiant?.biographie              ?? ''
  form.linkedin_url           = u.etudiant?.linkedin_url            ?? ''
  form.github_username        = u.etudiant?.github_username         ?? ''
  form.objectif_professionnel = u.etudiant?.objectif_professionnel  ?? ''
}, { deep: true })

// ── Validation légère côté client ─────────
const isFormValid = computed(() =>
  form.prenom.trim().length > 0 &&
  form.nom.trim().length > 0
)

function handleSave() {
  if (!isFormValid.value) return

  const safePayload = {
    prenom:                 sanitizeStr(form.prenom, 50),
    nom:                    sanitizeStr(form.nom, 50),
    telephone:              sanitizeStr(form.telephone, 20),
    ville:                  sanitizeStr(form.ville, 100),
    biographie:             sanitizeStr(form.biographie, 500),
    linkedin_url:           sanitizeUrl(form.linkedin_url, 'linkedin.com'),
    github_username:        sanitizeGithubUsername(form.github_username),
    objectif_professionnel: sanitizeStr(form.objectif_professionnel, 200),
  }

  emit('save', safePayload)
}
</script>

<style scoped>
@import '@/assets/profile.css';
.modal-section-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--color-text-secondary, #888);
  margin-bottom: .4rem;
}
</style>