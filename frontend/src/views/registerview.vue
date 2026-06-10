<template>
  <div class="register-landing" data-theme="landing">
    <AnimatedBackground />

    <div class="register-wrapper">
      <div class="register-form-col">
        <div class="register-card glass-card">
          <div class="register-header">
            <div class="register-header-top">
              <router-link to="/" class="register-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(92,140,106,0.3)" stroke="#5C8C6A" />
                </svg>
                <span>TRUSTY</span>
              </router-link>
              <button class="register-theme-toggle" @click="toggleTheme" :title="landingMode === 'dark' ? 'Mode clair' : 'Mode sombre'" type="button">
                <svg v-if="landingMode === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </button>
            </div>
            <h1 class="register-title">Créer un compte</h1>
            <p class="register-subtitle">Sélectionnez votre profil et remplissez vos informations.</p>
          </div>

          <form @submit.prevent="handleRegister" autocomplete="off">

            <div class="role-selector">
              <label class="role-option" :class="{ active: role === 'ETUDIANT' }">
                <input type="radio" v-model="role" value="ETUDIANT" />
                <span class="role-icon">🎓</span>
                <span class="role-label">Étudiant</span>
              </label>
              <label class="role-option" :class="{ active: role === 'PROFESSEUR' }">
                <input type="radio" v-model="role" value="PROFESSEUR" />
                <span class="role-icon">👨‍🏫</span>
                <span class="role-label">Professeur</span>
              </label>
              <label class="role-option" :class="{ active: role === 'PROFESSIONNEL' }">
                <input type="radio" v-model="role" value="PROFESSIONNEL" />
                <span class="role-icon">💼</span>
                <span class="role-label">Professionnel</span>
              </label>
            </div>

            <div class="row">
              <div class="field">
                <label>Prénom</label>
                <input v-model.trim="prenom" type="text" placeholder="John" required />
                <p v-if="fieldErrors.prenom" class="field-error">{{ fieldErrors.prenom }}</p>
              </div>
              <div class="field">
                <label>Nom</label>
                <input v-model.trim="nom" type="text" placeholder="Doe" required />
                <p v-if="fieldErrors.nom" class="field-error">{{ fieldErrors.nom }}</p>
              </div>
            </div>

            <div class="field">
              <label>Email</label>
              <input v-model.trim="email" type="email" placeholder="nom@ecole.fr" required />
              <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <input v-model.trim="password" type="password" placeholder="••••••••" required minlength="8" />
              <p class="field-hint">Min 8 caractères, majuscule, minuscule, nombre et symbole.</p>
              <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
            </div>

            <div class="field" v-if="role === 'ETUDIANT' || role === 'PROFESSEUR'">
              <label>École / Établissement</label>
              <div class="select-wrapper">
                <select v-model="ecole" required>
                  <option value="" disabled>Sélectionnez votre établissement</option>
                  <option v-for="e in ecoles" :key="e" :value="e">{{ e }}</option>
                </select>
              </div>
              <p v-if="fieldErrors.ecole" class="field-error">{{ fieldErrors.ecole }}</p>
            </div>

            <p v-if="authStore.error || error" class="form-message form-message--error">
              {{ safeError }}
            </p>

            <button type="submit" class="btn-submit" :disabled="isDisabled">
              <span v-if="isSubmitting || authStore.loading" class="btn-loading">
                <span class="btn-dot"></span>
                <span class="btn-dot"></span>
                <span class="btn-dot"></span>
              </span>
              <span v-else>Créer mon compte →</span>
            </button>

            <div class="register-footer-links">
              Vous avez déjà un compte ? <router-link to="/login">Connectez-vous</router-link>
            </div>

          </form>
        </div>
      </div>

      <div class="register-illustration-col">
        <div class="illustration-content">
          <LoginScene />
          <div class="illustration-text">
            <h3>Rejoignez l'excellence</h3>
            <p>La première plateforme de portfolios numériques certifiés.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authstore'
import { useRouter } from 'vue-router'
import AnimatedBackground from '@/components/landing/AnimatedBackground.vue'
import LoginScene from '@/components/landing/LoginScene.vue'
import { useLandingTheme } from '@/composables/useLandingTheme'

const { landingMode, toggle: toggleTheme } = useLandingTheme()

const authStore = useAuthStore()
const router = useRouter()

/* STATE */
const role = ref('ETUDIANT')
const prenom = ref('')
const nom = ref('')
const email = ref('')
const password = ref('')
const ecole = ref('')
const isSubmitting = ref(false)

const ecoles = [
  'ENSATanger',
  'ENCGTanger',
  'FSTTanger',
  'FSJESTanger',
  'ENSATetouan',
  'ENSTetouan',
  'FSTetouan',
  'FLSHMartil',
  'FSJESTetouan',
  'ENSAAlHoceima',
  'FSTAlHoceima',
  'FPDAlHoceima'
]

/* ERRORS */
const error = ref('')
const fieldErrors = ref({
  prenom: '',
  nom: '',
  email: '',
  password: '',
  ecole: ''
})

/* HELPERS */
const normalizeEmail = (v) => v.trim().toLowerCase()

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const isStrongPassword = (v) => {
  if (typeof v !== 'string') return false
  const minLength = v.length >= 8
  const hasUpper = /[A-Z]/.test(v)
  const hasLower = /[a-z]/.test(v)
  const hasNumber = /[0-9]/.test(v)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-\\/\[\]=+;]/.test(v)
  return minLength && hasUpper && hasLower && hasNumber && hasSymbol
}

/* ERROR HANDLING */
const clearErrors = () => {
  error.value = ''
  authStore.error = null
  fieldErrors.value = { prenom: '', nom: '', email: '', password: '', ecole: '' }
}

const safeError = computed(() => authStore.error || error.value)

/* VALIDATION */
const validateFields = () => {
  let ok = true
  fieldErrors.value = { prenom: '', nom: '', email: '', password: '', ecole: '' }

  if (!prenom.value.trim()) {
    fieldErrors.value.prenom = 'Prénom requis'
    ok = false
  }

  if (!nom.value.trim()) {
    fieldErrors.value.nom = 'Nom requis'
    ok = false
  }

  if (!email.value.trim()) {
    fieldErrors.value.email = 'Email requis'
    ok = false
  } else if (!isValidEmail(email.value)) {
    fieldErrors.value.email = 'Email invalide'
    ok = false
  }

  if (!password.value) {
    fieldErrors.value.password = 'Mot de passe requis'
    ok = false
  } else if (!isStrongPassword(password.value)) {
    fieldErrors.value.password = 'Critères du mot de passe non respectés'
    ok = false
  }

  if ((role.value === 'ETUDIANT' || role.value === 'PROFESSEUR') && !ecole.value) {
    fieldErrors.value.ecole = 'Veuillez sélectionner votre établissement'
    ok = false
  }

  return ok
}

/* COMPUTED */
const isDisabled = computed(() =>
  isSubmitting.value ||
  authStore.loading ||
  !prenom.value.trim() ||
  !nom.value.trim() ||
  !email.value.trim() ||
  !password.value ||
  ((role.value === 'ETUDIANT' || role.value === 'PROFESSEUR') && !ecole.value)
)

const handleRegister = async () => {
  if (isSubmitting.value) return

  clearErrors()

  if (!validateFields()) return

  isSubmitting.value = true

  try {
    const data = {
      nom: nom.value.trim(),
      prenom: prenom.value.trim(),
      email: normalizeEmail(email.value),
      password: password.value,
      role: role.value,
      ecole: (role.value === 'ETUDIANT' || role.value === 'PROFESSEUR') ? ecole.value : undefined
    }

    const success = await authStore.register(data)

    if (success) {
      router.push('/login?registered=true')
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('Register error:', err)
    error.value = 'Une erreur est survenue lors de l\'inscription.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  clearErrors()
})
</script>

<style scoped>
.register-landing {
  font-family: var(--landing-font);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-wrapper {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1100px;
  width: 100%;
  min-height: 100vh;
}

.register-form-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-card {
  width: 100%;
  max-width: 480px;
  padding: 36px;
  background: var(--landing-surface);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--landing-border);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.4);
}

.register-header {
  margin-bottom: 28px;
}

.register-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #f1f5f9;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-decoration: none;
  margin-bottom: 20px;
}

.register-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--landing-text);
  margin-bottom: 6px;
}

.register-subtitle {
  font-size: 0.88rem;
  color: var(--landing-text-secondary);
}

/* ─── Role Selector ─── */
.role-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.role-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: var(--landing-surface);
  border: 2px solid var(--landing-border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.role-option input {
  display: none;
}

.role-option:hover {
  background: var(--landing-surface-hover);
}

.role-option.active {
  border-color: var(--landing-accent);
  background: color-mix(in srgb, var(--landing-accent) 10%, var(--landing-bg));
  box-shadow: 0 0 20px var(--landing-glow);
}

.role-icon {
  font-size: 1.6rem;
}

.role-label {
  color: var(--landing-text);
  font-size: 0.8rem;
  font-weight: 600;
}

/* ─── Fields ─── */
.row {
  display: flex;
  gap: 12px;
}

.row .field {
  flex: 1;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--landing-text-secondary);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.field input, .select-wrapper select {
  width: 100%;
  padding: 11px 14px;
  background: var(--landing-surface);
  border: 1px solid var(--landing-border);
  border-radius: 12px;
  color: var(--landing-text);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}

.field input::placeholder {
  color: var(--landing-text-secondary);
  opacity: 0.5;
}

.field input:focus, .select-wrapper select:focus {
  border-color: var(--landing-accent-border);
  box-shadow: 0 0 0 3px var(--landing-glow);
  background: var(--landing-surface-hover);
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: "▼";
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--landing-text-secondary);
  font-size: 10px;
  pointer-events: none;
}

.select-wrapper select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.select-wrapper select option {
  background: var(--landing-bg);
  color: var(--landing-text);
}

.field-hint {
  font-size: 0.72rem;
  color: var(--landing-text-secondary);
  margin-top: 5px;
}

.field-error {
  color: #f87171;
  font-size: 0.75rem;
  margin-top: 5px;
}

.form-message {
  font-size: 0.85rem;
  text-align: center;
  padding: 10px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.form-message--error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #fca5a5;
}

/* ─── Button ─── */
.btn-submit {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: var(--landing-gradient-btn);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 32px var(--landing-glow);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  margin-top: 8px;
}

.btn-submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px var(--landing-glow-strong);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-loading {
  display: flex;
  gap: 5px;
  align-items: center;
}

.btn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: btn-dot-bounce 1.2s ease-in-out infinite;
}

.btn-dot:nth-child(2) { animation-delay: 0.2s; }
.btn-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes btn-dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.register-footer-links {
  text-align: center;
  margin-top: 20px;
  font-size: 0.85rem;
  color: var(--landing-text-secondary);
}

.register-footer-links a {
  color: var(--landing-accent);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.register-footer-links a:hover {
  color: var(--landing-accent-hover);
  text-decoration: underline;
}

/* ─── Illustration ─── */
.register-illustration-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.illustration-content {
  text-align: center;
  max-width: 400px;
}

.illustration-text {
  margin-top: 24px;
}

.illustration-text h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--landing-text);
  margin-bottom: 8px;
}

.illustration-text p {
  font-size: 0.88rem;
  color: var(--landing-text-secondary);
  line-height: 1.6;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .register-wrapper {
    grid-template-columns: 1fr;
    min-height: 100vh;
  }

  .register-form-col {
    padding: 24px;
  }

  .register-illustration-col {
    display: none;
  }

  .register-card {
    padding: 28px 20px;
    box-shadow: none;
    background: transparent;
    backdrop-filter: none;
  }
}

.register-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.register-theme-toggle {
  background: var(--landing-surface);
  border: 1px solid var(--landing-border);
  color: var(--landing-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.register-theme-toggle:hover {
  background: var(--landing-surface-hover);
  color: var(--landing-text);
  border-color: var(--landing-border-hover);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
