<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authstore'

const router    = useRouter()
const authStore = useAuthStore()

// ── State ─────────────────────────────────────────────────
const form = ref({
  email:    '',
  password: '',
  nom:      '',
  prenom:   '',
})

const isSubmitting = ref(false)
const errors       = ref({})

//  tentatives limitées ───────────────────────
const attempts     = ref(0)
const MAX_ATTEMPTS = 5
const blocked      = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  const e = {}

  // prenom — min(2)
  const prenom = form.value.prenom.trim()
  if (!prenom)                 e.prenom = 'Le prénom est requis'
  else if (prenom.length < 2)  e.prenom = 'Le prénom doit contenir au moins 2 caractères'
  else if (prenom.length > 50) e.prenom = 'Le prénom est trop long'

  // nom — min(2)
  const nom = form.value.nom.trim()
  if (!nom)                  e.nom = 'Le nom est requis'
  else if (nom.length < 2)   e.nom = 'Le nom doit contenir au moins 2 caractères'
  else if (nom.length > 50)  e.nom = 'Le nom est trop long'

  // email — z.string().email()
  const email = form.value.email.trim()
  if (!email)                       e.email = "L'email est requis"
  else if (!emailRegex.test(email)) e.email = 'Email invalide'
  else if (email.length > 254)      e.email = 'Email trop long'

  // password — min(8) uniquement — 
  const pwd = form.value.password
  if (!pwd)              e.password = 'Le mot de passe est requis'
  else if (pwd.length < 8)   e.password = 'Le mot de passe doit contenir au moins 8 caractères'
  else if (pwd.length > 128) e.password = 'Mot de passe trop long'

  errors.value = e
  return Object.keys(e).length === 0
}

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p || p.length < 8) return null
  const hasUpper  = /[A-Z]/.test(p)
  const hasNumber = /[0-9]/.test(p)
  const hasSymbol = /[\W_]/.test(p)
  const score = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length
  if (score === 3) return { label: 'Fort',  color: '#4ade80' }
  if (score === 2) return { label: 'Moyen', color: '#fbbf24' }
  return                  { label: 'Faible', color: '#f87171' }
})

const isDisabled = computed(() =>
  isSubmitting.value || authStore.loading || blocked.value
)

// ── Submit ────────────────────────────────────────────────
async function handleRegister() {
  if (isDisabled.value) return

  // Comptage des tentatives
  attempts.value++
  if (attempts.value > MAX_ATTEMPTS) {
    blocked.value = true
    errors.value  = { global: 'Trop de tentatives. Veuillez patienter.' }
    return
  }

  if (!validate()) return

  isSubmitting.value = true

  try {
    const payload = {
      prenom:   form.value.prenom.trim(),
      nom:      form.value.nom.trim(),
      email:    form.value.email.trim().toLowerCase(),
      password: form.value.password,  
    }

    const success = await authStore.register(payload)

    if (success) {
      form.value.password = '' 
      router.push('/login?registered=true')
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[Register]', err)
  } finally {
    isSubmitting.value  = false
    form.value.password = '' 
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister" autocomplete="on" novalidate>

    <!-- Erreur globale (trop de tentatives) -->
    <div v-if="errors.global" class="error" role="alert">
      {{ errors.global }}
    </div>

    <!-- Erreur générique store -->
    <div v-else-if="authStore.error" class="error" role="alert">
      Une erreur est survenue. Veuillez réessayer.
    </div>

    <!-- Prénom -->
    <div class="field">
      <input
        v-model="form.prenom"
        placeholder="Prénom"
        required
        maxlength="50"
        autocomplete="given-name"
        :aria-invalid="!!errors.prenom"
        aria-describedby="prenom-error"
        :class="{ 'input--error': errors.prenom }"
      />
      <span v-if="errors.prenom" id="prenom-error" class="field-error" role="alert">
        {{ errors.prenom }}
      </span>
    </div>

    <!-- Nom -->
    <div class="field">
      <input
        v-model="form.nom"
        placeholder="Nom"
        required
        maxlength="50"
        autocomplete="family-name"
        :aria-invalid="!!errors.nom"
        aria-describedby="nom-error"
        :class="{ 'input--error': errors.nom }"
      />
      <span v-if="errors.nom" id="nom-error" class="field-error" role="alert">
        {{ errors.nom }}
      </span>
    </div>

    <!-- Email -->
    <div class="field">
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        required
        maxlength="254"
        autocomplete="email"
        :aria-invalid="!!errors.email"
        aria-describedby="email-error"
        :class="{ 'input--error': errors.email }"
      />
      <span v-if="errors.email" id="email-error" class="field-error" role="alert">
        {{ errors.email }}
      </span>
    </div>

    <!-- Mot de passe -->
    <div class="field">
      <input
        v-model="form.password"
        type="password"
        placeholder="Mot de passe (min. 8 caractères)"
        required
        minlength="8"
        maxlength="128"
        autocomplete="new-password"
        :aria-invalid="!!errors.password"
        aria-describedby="password-error"
        :class="{ 'input--error': errors.password }"
      />

      <!-- Indicateur de force (UX seulement) -->
      <span v-if="passwordStrength" :style="{ color: passwordStrength.color, fontSize: '12px' }">
        Force : {{ passwordStrength.label }}
      </span>

      <span v-if="errors.password" id="password-error" class="field-error" role="alert">
        {{ errors.password }}
      </span>
    </div>

    <button type="submit" :disabled="isDisabled">
      {{ (isSubmitting || authStore.loading) ? 'Inscription...' : "S'inscrire" }}
    </button>

  </form>
</template>