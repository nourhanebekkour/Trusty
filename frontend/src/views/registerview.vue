<template>
  <div class="register-page">
    <!-- LEFT SIDE -->
    <div class="left">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C8C6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <strong>TRUSTY</strong>
      </div>
      <h1>Rejoignez <span class="accent">l'excellence.</span></h1>
      <p class="subtitle">
        Créez votre compte et rejoignez la première plateforme de portfolios numériques certifiés.
      </p>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right">
      <div class="form-container">
        <h2>Créer un compte</h2>
        <p class="welcome-sub">Sélectionnez votre profil et remplissez vos informations.</p>

        <form @submit.prevent="handleRegister" autocomplete="off">
          
          <!-- ROLE SELECTION -->
          <div class="role-selector">
            <label 
              class="role-card" 
              :class="{ active: role === 'ETUDIANT' }"
            >
              <input type="radio" v-model="role" value="ETUDIANT" />
              <span class="role-icon">🎓</span>
              <span class="role-title">Étudiant</span>
            </label>
            <label 
              class="role-card" 
              :class="{ active: role === 'PROFESSEUR' }"
            >
              <input type="radio" v-model="role" value="PROFESSEUR" />
              <span class="role-icon">👨‍🏫</span>
              <span class="role-title">Professeur</span>
            </label>
            <label 
              class="role-card" 
              :class="{ active: role === 'PROFESSIONNEL' }"
            >
              <input type="radio" v-model="role" value="PROFESSIONNEL" />
              <span class="role-icon">💼</span>
              <span class="role-title">Professionnel</span>
            </label>
          </div>

          <div class="row">
            <div class="field">
              <label>Prénom</label>
              <input v-model.trim="prenom" type="text" placeholder="John" required />
              <p v-if="fieldErrors.prenom" class="error-msg">{{ fieldErrors.prenom }}</p>
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model.trim="nom" type="text" placeholder="Doe" required />
              <p v-if="fieldErrors.nom" class="error-msg">{{ fieldErrors.nom }}</p>
            </div>
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model.trim="email" type="email" placeholder="nom@ecole.fr" required />
            <p v-if="fieldErrors.email" class="error-msg">{{ fieldErrors.email }}</p>
          </div>

          <div class="field">
            <label>Mot de passe</label>
            <input v-model.trim="password" type="password" placeholder="••••••••" required minlength="8" />
            <p class="hint">Min 8 caractères, majuscule, minuscule, nombre et symbole.</p>
            <p v-if="fieldErrors.password" class="error-msg">{{ fieldErrors.password }}</p>
          </div>

          <div class="field" v-if="role === 'ETUDIANT' || role === 'PROFESSEUR'">
            <label>École / Établissement</label>
            <div class="select-wrapper">
              <select v-model="ecole" required>
                <option value="" disabled>Sélectionnez votre établissement</option>
                <option v-for="e in ecoles" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <p v-if="fieldErrors.ecole" class="error-msg">{{ fieldErrors.ecole }}</p>
          </div>

          <p v-if="authStore.error || error" class="global-error">
            {{ safeError }}
          </p>

          <button type="submit" class="btn-register" :disabled="isDisabled">
            {{ (isSubmitting || authStore.loading) ? 'Création en cours...' : 'Créer mon compte →' }}
          </button>

          <div class="footer-links">
            Vous avez déjà un compte ? <router-link to="/login">Connectez-vous</router-link>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authstore'
import { useRouter } from 'vue-router'

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
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.register-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #1a2e2a;
}

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
  font-size: 36px;
  font-weight: 800;
  color: #e8f0ee;
  margin-top: -40px;
  line-height: 1.2;
}

.accent {
  color: #5C8C6A;
}

.subtitle {
  color: #a8bdb8;
  font-size: 16px;
  line-height: 1.5;
}

.right {
  width: 55%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a2e2a;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 480px;
}

h2 {
  font-size: 28px;
  font-weight: 700;
  color: #e8f0ee;
  margin-bottom: 8px;
}

.welcome-sub {
  color: #a8bdb8;
  font-size: 14px;
  margin-bottom: 30px;
}

/* ROLE SELECTOR */
.role-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.role-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px;
  background: #2a3d38;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-card input {
  display: none;
}

.role-card:hover {
  background: #314842;
}

.role-card.active {
  border-color: #5C8C6A;
  background: rgba(92, 140, 106, 0.1);
}

.role-icon {
  font-size: 24px;
}

.role-title {
  color: #e8f0ee;
  font-size: 13px;
  font-weight: 600;
}

.row {
  display: flex;
  gap: 16px;
}

.row .field {
  flex: 1;
}

.field {
  margin-bottom: 18px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #e8f0ee;
  display: block;
  margin-bottom: 8px;
}

.field input, .select-wrapper select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #3a5048;
  background: #2a3d38;
  color: #e8f0ee;
  font-size: 14px;
  transition: border-color 0.2s;
}

.field input:focus, .select-wrapper select:focus {
  outline: none;
  border-color: #5C8C6A;
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
  color: #a8bdb8;
  font-size: 10px;
  pointer-events: none;
}

.select-wrapper select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.hint {
  font-size: 11px;
  color: #6a8880;
  margin-top: 6px;
}

.error-msg {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
}

.global-error {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
  margin-bottom: 16px;
  background: rgba(255, 107, 107, 0.1);
  padding: 10px;
  border-radius: 6px;
}

.btn-register {
  width: 100%;
  padding: 14px;
  background: #5C8C6A;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;
}

.btn-register:hover:not(:disabled) {
  background: #4a7556;
}

.btn-register:disabled {
  background: #3a5048;
  cursor: not-allowed;
  color: #6a8880;
}

.footer-links {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: #a8bdb8;
}

.footer-links a {
  color: #5C8C6A;
  text-decoration: none;
  font-weight: 600;
}

.footer-links a:hover {
  text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .register-page {
    flex-direction: column;
  }
  .left {
    width: 100%;
    padding: 40px;
    border-right: none;
    border-bottom: 1px solid #3a5048;
  }
  h1 {
    margin-top: 20px;
  }
  .right {
    width: 100%;
    padding: 40px 20px;
  }
}
</style>
