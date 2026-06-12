<template>
  <div class="login-landing" data-theme="landing">
    <AnimatedBackground />

    <div class="login-wrapper">
      <!-- Colonne gauche : formulaire -->
      <div class="login-form-col">
        <div class="login-card glass-card">
          <div class="login-header">
            <div class="login-header-top">
              <router-link to="/" class="login-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(92,140,106,0.3)" stroke="#5C8C6A" />
                </svg>
                <span>TRUSTY</span>
              </router-link>
              <button class="login-theme-toggle" @click="toggleTheme" :title="landingMode === 'dark' ? 'Mode clair' : 'Mode sombre'" type="button">
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
            <div class="login-eyebrow"><span></span> Espace sécurisé TRUSTY</div>
            <h1 class="login-title">Bienvenue</h1>
            <p class="login-subtitle">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <form @submit.prevent="handleLogin" autocomplete="on" novalidate>
            <div class="field">
              <label>Email</label>
              <input
                v-model.trim="email"
                type="email"
                placeholder="nom@ecole.fr"
                required
                autocomplete="username"
                :aria-invalid="!!fieldErrors.email"
                aria-describedby="email-error"
                maxlength="254"
              />
              <p v-if="fieldErrors.email" id="email-error" class="field-error" role="alert">
                {{ fieldErrors.email }}
              </p>
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <div class="password-wrapper">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                  :aria-invalid="!!fieldErrors.password"
                  aria-describedby="password-error"
                  maxlength="128"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Cacher' : 'Afficher'" tabindex="-1">
                  <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <p v-if="fieldErrors.password" id="password-error" class="field-error" role="alert">
                {{ fieldErrors.password }}
              </p>
            </div>

            <div class="remember-row">
              <label class="remember-label">
                <input type="checkbox" v-model="remember" class="remember-checkbox" />
                <span class="remember-text">Se souvenir de moi</span>
              </label>
            </div>

            <p v-if="isLocked" class="form-message form-message--error" role="alert">
              Trop de tentatives. Réessayez dans {{ lockCountdown }}s.
            </p>

            <p v-else-if="authStore.error || error" class="form-message form-message--error" role="alert">
              {{ safeError }}
            </p>

            <button type="button" class="btn-forgot" @click="openForgotModal">
              Mot de passe oublié ?
            </button>

            <button type="submit" class="btn-submit" :disabled="isDisabled">
              <span v-if="isSubmitting || authStore.loading" class="btn-loading">
                <span class="btn-dot"></span>
                <span class="btn-dot"></span>
                <span class="btn-dot"></span>
              </span>
              <span v-else>Se connecter →</span>
            </button>

            <div class="login-footer-links">
              Vous n'avez pas encore de compte ?
              <router-link to="/register">Inscrivez-vous</router-link>
            </div>
          </form>
        </div>
      </div>

      <!-- Colonne droite : scène 3D -->
      <div class="login-illustration-col">
        <div class="illustration-content">
          <LoginScene />
          <div class="illustration-text">
            <span class="illustration-kicker">Votre parcours, enfin visible</span>
            <h3>Transformez vos preuves en opportunités</h3>
            <p>Portfolios certifiés, recommandations et connexions professionnelles dans un espace de confiance.</p>
            <div class="illustration-benefits">
              <span>✓ Identité vérifiée</span>
              <span>✓ Données sécurisées</span>
              <span>✓ Profils certifiés</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal (restylée) -->
    <Teleport to="body">
      <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotModal">
        <div class="modal glass-card">
          <button class="modal-close" @click="closeForgotModal" type="button" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h3 class="modal-title">Mot de passe oublié</h3>
          <p class="modal-sub">Saisissez votre email pour recevoir un lien de réinitialisation.</p>

          <form @submit.prevent="submitForgotPassword">
            <div class="field">
              <label>Email</label>
              <input
                v-model.trim="forgotEmail"
                type="email"
                placeholder="nom@ecole.fr"
                required
                maxlength="254"
              />
            </div>

            <p v-if="forgotError" class="form-message form-message--error">{{ forgotError }}</p>
            <p v-if="forgotSuccess" class="form-message form-message--success">{{ forgotSuccess }}</p>

            <button type="submit" class="btn-submit" :disabled="forgotSending || !forgotEmail.trim()">
              {{ forgotSending ? 'Envoi...' : 'Envoyer' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authstore'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'
import AnimatedBackground from '@/components/landing/AnimatedBackground.vue'
import LoginScene from '@/components/landing/LoginScene.vue'
import { useLandingTheme } from '@/composables/useLandingTheme'

const { landingMode, toggle: toggleTheme } = useLandingTheme()

onUnmounted(() => {
  clearInterval(lockTimer)
})

/* ─── STATE ─── */
const email    = ref('')
const password = ref('')
const remember = ref(false)

const isSubmitting = ref(false)
const showPassword = ref(false)

/* ─── FORGOT PASSWORD ─── */
const showForgotModal = ref(false)
const forgotEmail = ref('')
const forgotSending = ref(false)
const forgotError = ref('')
const forgotSuccess = ref('')

/* ─── ERRORS ─── */
const error       = ref('')
const fieldErrors = ref({ email: '', password: '' })

/* ─── RATE LIMITING ─── */
const loginAttempts = ref(0)
const lockUntil     = ref(null)
const lockCountdown = ref(0)
let lockTimer = null

/* ─── STORE + ROUTER ─── */
const authStore = useAuthStore()
const router    = useRouter()

/* ─── CONFIG ─── */
const MAX_ATTEMPTS  = 3
const BASE_LOCK_TIME = 10 * 1000

/* ─── HELPERS ─── */
const normalizeEmail = (v) => v.trim().toLowerCase()
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isStrongPassword = (v) => {
  if (typeof v !== 'string') return false
  return (
    v.length >= 8 &&
    /[A-Z]/.test(v) &&
    /[a-z]/.test(v) &&
    /[0-9]/.test(v) &&
    /[!@#$%^&*(),.?":{}|<>_\-\\/\[\]=+;]/.test(v)
  )
}

/* ─── LOCK LOGIC ─── */
const isLocked = computed(() => lockUntil.value && Date.now() < lockUntil.value)
const applyLock = () => {
  const delay = BASE_LOCK_TIME * Math.pow(2, Math.max(0, loginAttempts.value - MAX_ATTEMPTS))
  lockUntil.value = Date.now() + delay

  lockCountdown.value = Math.ceil(delay / 1000)
  clearInterval(lockTimer)
  lockTimer = setInterval(() => {
    lockCountdown.value--
    if (lockCountdown.value <= 0) {
      clearInterval(lockTimer)
      lockUntil.value = null
    }
  }, 1000)
}

/* ─── ERROR HANDLING ─── */
const clearErrors = () => {
  error.value      = ''
  authStore.error  = null
  fieldErrors.value = { email: '', password: '' }
}

const safeError = computed(() => {
  const raw = authStore.error || error.value
  return raw ? 'Email ou mot de passe invalide' : ''
})

const setGenericError = () => { error.value = 'Email ou mot de passe invalide' }

const validateFields = () => {
  let ok = true
  fieldErrors.value = { email: '', password: '' }

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
    fieldErrors.value.password = 'Min 8 caractères, majuscule, minuscule, nombre et symbole'
    ok = false
  }

  return ok
}

/* ─── COMPUTED ─── */
const isDisabled = computed(() =>
  isSubmitting.value ||
  authStore.loading  ||
  isLocked.value     ||
  !email.value.trim() ||
  !password.value
)

/* ─── SUBMIT ─── */
const handleLogin = async () => {
  if (isSubmitting.value || isLocked.value) return
  clearErrors()
  if (!validateFields()) return

  isSubmitting.value = true

  try {
    const cleanEmail = normalizeEmail(email.value)

    const success = await authStore.login(cleanEmail, password.value)

    if (success) {
      loginAttempts.value = 0
      lockUntil.value     = null

      const redirectTo   = router.currentRoute.value.query.redirect || '/dashboard'
      const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/dashboard'
      router.push(safeRedirect)
      return
    }

    loginAttempts.value++
    if (loginAttempts.value >= MAX_ATTEMPTS) applyLock()
    setGenericError()

  } catch (err) {
    if (import.meta.env.DEV) console.error('Login error:', err)
    loginAttempts.value++
    if (loginAttempts.value >= MAX_ATTEMPTS) applyLock()
    setGenericError()
  } finally {
    isSubmitting.value = false
    password.value = ''
  }
}

/* ─── FORGOT PASSWORD ─── */
function openForgotModal() {
  forgotEmail.value = ''
  forgotError.value = ''
  forgotSuccess.value = ''
  showForgotModal.value = true
}
function closeForgotModal() {
  showForgotModal.value = false
}
async function submitForgotPassword() {
  if (!forgotEmail.value.trim()) return
  forgotSending.value = true
  forgotError.value = ''
  forgotSuccess.value = ''
  try {
    await authService.forgotPassword(forgotEmail.value)
    forgotSuccess.value = 'Un email de réinitialisation a été envoyé.'
  } catch (err) {
    forgotError.value = err?.response?.data?.message || "Impossible d'envoyer l'email. Vérifiez votre adresse."
  } finally {
    forgotSending.value = false
  }
}
</script>

<style scoped>
.login-landing {
  font-family: var(--landing-font);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-wrapper {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  max-width: 1180px;
  width: 100%;
  min-height: 100vh;
}

/* ─── Formulaire ──────────────────────────── */
.login-form-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 42px;
  background: color-mix(in srgb, var(--landing-surface) 82%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--landing-border);
  border-radius: 24px;
  box-shadow: 0 35px 100px rgba(0,0,0,0.42), inset 0 1px rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255,255,255,0.1), transparent 30%);
}

.login-header {
  margin-bottom: 32px;
}

.login-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--landing-text);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-decoration: none;
}

.login-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--landing-text);
  margin-bottom: 6px;
  letter-spacing: -0.04em;
}

.login-subtitle {
  font-size: 0.9rem;
  color: var(--landing-text-secondary);
}

.login-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  color: var(--landing-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.login-eyebrow span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 12px #34d399;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--landing-text-secondary);
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.field input {
  width: 100%;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--landing-bg) 58%, transparent);
  border: 1px solid var(--landing-border);
  border-radius: 12px;
  color: var(--landing-text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}

.field input::placeholder {
  color: var(--landing-text-secondary);
  opacity: 0.5;
}

.field input:focus {
  border-color: var(--landing-accent-border);
  box-shadow: 0 0 0 3px var(--landing-glow);
  background: var(--landing-surface-hover);
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--landing-text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--landing-text);
}

.field-error {
  color: #f87171;
  font-size: 0.78rem;
  margin-top: 6px;
}

.remember-row {
  margin-bottom: 16px;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--landing-text-secondary);
}

.remember-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #5C8C6A;
  border-radius: 4px;
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

.form-message--success {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #6ee7b7;
}

.btn-forgot {
  display: block;
  margin: 0 auto 20px;
  background: none;
  border: none;
  color: var(--landing-accent);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-family: inherit;
  padding: 0;
  transition: color 0.2s;
}

.btn-forgot:hover {
  color: var(--landing-accent-hover);
}

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
  min-height: 52px;
  position: relative;
  overflow: hidden;
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

.login-footer-links {
  text-align: center;
  margin-top: 24px;
  font-size: 0.85rem;
  color: var(--landing-text-secondary);
}

.login-footer-links a {
  color: var(--landing-accent);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.login-footer-links a:hover {
  color: var(--landing-accent-hover);
  text-decoration: underline;
}

/* ─── Colonne illustration ───────────────── */
.login-illustration-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.illustration-content {
  text-align: center;
  max-width: 460px;
}

.illustration-text {
  margin-top: 24px;
}

.illustration-text h3 {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--landing-text);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.illustration-text p {
  font-size: 0.88rem;
  color: var(--landing-text-secondary);
  line-height: 1.6;
}

.illustration-kicker {
  display: block;
  margin-bottom: 8px;
  color: var(--landing-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.illustration-benefits {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.illustration-benefits span {
  padding: 6px 10px;
  border: 1px solid var(--landing-border);
  border-radius: 999px;
  background: var(--landing-surface);
  color: var(--landing-text-secondary);
  font-size: 0.58rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

/* ─── Modal ──────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
  animation: fadeIn 0.25s ease-out;
}

.modal {
  background: color-mix(in srgb, var(--landing-bg) 95%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--landing-border);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  position: relative;
  animation: modalIn 0.3s ease-out;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
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
  transition: background 0.2s, color 0.2s;
}

.modal-close:hover {
  background: var(--landing-surface-hover);
  color: var(--landing-text);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--landing-text);
  margin: 0 0 8px;
}

.modal-sub {
  font-size: 0.88rem;
  color: var(--landing-text-secondary);
  margin: 0 0 24px;
  line-height: 1.5;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ─── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .login-wrapper {
    grid-template-columns: 1fr;
    min-height: 100vh;
  }

  .login-form-col {
    padding: 24px;
  }

  .login-illustration-col {
    display: none;
  }

  .login-card {
    padding: 32px 24px;
    box-shadow: none;
    background: transparent;
    backdrop-filter: none;
  }

  .modal {
    padding: 28px 24px;
  }
}

.login-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.login-theme-toggle {
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

.login-theme-toggle:hover {
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
