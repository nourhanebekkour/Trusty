<template>
  <div class="login-page">

    <!-- LEFT SIDE -->
    <div class="left">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C8C6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <strong>TRUSTY</strong>
      </div>

      <h1>Certifiez votre excellence <span class="accent">académique.</span></h1>

      <p class="subtitle">
        La première plateforme de portfolios numériques qui transforme vos projets en preuves irréfutables de compétences.
      </p>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right">
      <h2>Bon retour parmi nous</h2>
      <p class="welcome-sub">Veuillez entrer vos identifiants pour accéder à votre espace.</p>

      <form @submit.prevent="handleLogin" autocomplete="on">

        <div class="field">
          <label>Email</label>
          <input
            v-model.trim="email"
            type="email"
            placeholder="nom@ecole.fr"
            required
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label>Mot de passe</label>
          <input
            v-model.trim="password"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
            autocomplete="current-password"
          />
        </div>

        <div class="remember">
          <input type="checkbox" v-model="remember" id="remember" />
          <label for="remember">Se souvenir de moi</label>
        </div>

        <p v-if="auth.error" class="error">
          {{ safeError }}
        </p>

        <button
          type="submit"
          class="btn-login"
          :disabled="isSubmitting || auth.loading || !email || !password"
        >
          {{ (isSubmitting || auth.loading) ? 'Connexion...' : 'Se connecter →' }}
        </button>

        <div class="divider">OU CONTINUER EN TANT QU'INVITÉ</div>

        <button
          type="button"
          class="btn-guest"
          :disabled="isSubmitting || auth.loading"
        >
          Consulter les portfolios publics
        </button>

      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/authstore'
import { useRouter } from 'vue-router'

/*STATE*/
const email = ref('')
const password = ref('')
const remember = ref(false)

const isSubmitting = ref(false)
const showCaptcha = ref(false)

/* ERRORS */
const error = ref('')
const fieldErrors = ref({
  email: '',
  password: ''
})

/* SECURITY UX STATE */
const loginAttempts = ref(0)
const lockUntil = ref(null)

/* store + router */
const auth = useAuthStore()
const router = useRouter()

/* CONFIG */
const MAX_ATTEMPTS = 3
const BASE_LOCK_TIME = 10 * 1000

/*HELPERS */
const normalizeEmail = (v) => v.trim().toLowerCase()

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)


const isStrongPassword = (v) => {
  if (typeof v !== 'string') return false

  const minLength = v.length >= 8
  const hasUpper = /[A-Z]/.test(v)
  const hasLower = /[a-z]/.test(v)
  const hasNumber = /[0-9]/.test(v)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-\\/\[\]=+;]/.test(v)

  return minLength && hasUpper && hasLower && hasNumber && hasSymbol
}

const getCaptchaToken = async () => {
  if (!showCaptcha.value) return null
  return 'mock-captcha-token'
}

/* LOCK LOGIC */
const isLocked = computed(() =>
  lockUntil.value && Date.now() < lockUntil.value
)

const applyLock = () => {
  const delay =
    BASE_LOCK_TIME *
    Math.pow(2, Math.max(0, loginAttempts.value - MAX_ATTEMPTS))

  lockUntil.value = Date.now() + delay
}

/* ERROR HANDLING*/
const clearErrors = () => {
  error.value = ''
  fieldErrors.value = { email: '', password: '' }
}

const setGenericError = () => {
  error.value = 'Email ou mot de passe invalide'
}

/* VALIDATION */
const validateFields = () => {
  let ok = true
  fieldErrors.value = { email: '', password: '' }

  /* EMAIL */
  if (!email.value.trim()) {
    fieldErrors.value.email = 'Email requis'
    ok = false
  } else if (!isValidEmail(email.value)) {
    fieldErrors.value.email = 'Email invalide'
    ok = false
  }

  /* PASSWORD */
  if (!password.value) {
    fieldErrors.value.password = 'Mot de passe requis'
    ok = false
  } else if (!isStrongPassword(password.value)) {
    fieldErrors.value.password =
      'Min 8 caractères, majuscule, minuscule, nombre et symbole'
    ok = false
  }

  return ok
}

/* COMPUTED */
const isDisabled = computed(() =>
  isSubmitting.value ||
  auth.loading ||
  isLocked.value ||
  !email.value.trim() ||
  !password.value
)

/*LOGIN*/
const handleLogin = async () => {
  if (isSubmitting.value || isLocked.value) return

  clearErrors()

  if (!validateFields()) return

  isSubmitting.value = true

  try {
    const cleanEmail = normalizeEmail(email.value)
    const cleanPassword = password.value

    const captchaToken = await getCaptchaToken()

    const res = await auth.loginUser({
      email: cleanEmail,
      password: cleanPassword,
      remember: remember.value,
      captcha: captchaToken
    })

    /* SUCCESS */
    if (res?.success) {
      loginAttempts.value = 0
      lockUntil.value = null
      router.push('/')
      return
    }

    /* FAIL */
    loginAttempts.value++

    if (res?.requireCaptcha) {
      showCaptcha.value = true
    }

    if (loginAttempts.value >= MAX_ATTEMPTS) {
      applyLock()
    }

    setGenericError()

  } catch (err) {

    if (import.meta.env.DEV) {
      console.error('Login error:', err)
    }

    loginAttempts.value++

    if (loginAttempts.value >= MAX_ATTEMPTS) {
      applyLock()
    }

    setGenericError()

  } finally {
    isSubmitting.value = false
  }
}
</script>
db chni banlk fhada mn na7iya d securite ghir frontend

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  background: #1a2e2a;
}

/* LEFT */
.left {
  width: 45%;
  background: #2a3d38;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #3a5048;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #5C8C6A;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: #e8f0ee;
}

.accent {
  color: #5C8C6A;
}

.subtitle {
  color: #a8bdb8;
  font-size: 15px;
}

/* RIGHT */
.right {
  width: 55%;
  padding: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #1a2e2a;
}

h2 {
  font-size: 26px;
  font-weight: 700;
  color: #e8f0ee;
}

.welcome-sub {
  color: #a8bdb8;
  font-size: 14px;
  margin-bottom: 36px;
}

.field {
  margin-bottom: 20px;
}

.field label {
  font-size: 13px;
  color: #e8f0ee;
  display: block;
  margin-bottom: 8px;
}

.field input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #3a5048;
  background: #2a3d38;
  color: #e8f0ee;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a8bdb8;
  font-size: 13px;
  margin-bottom: 20px;
}

.error {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
  margin-bottom: 10px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #5C8C6A;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-login:disabled {
  background: #3a5048;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  font-size: 11px;
  color: #6a8880;
  margin: 16px 0;
}

.btn-guest {
  width: 100%;
  padding: 13px;
  border: 1px solid #3a5048;
  background: transparent;
  color: #e8f0ee;
  border-radius: 8px;
  cursor: pointer;
}
</style>