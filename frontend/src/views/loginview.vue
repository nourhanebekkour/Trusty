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

const email = ref('')
const password = ref('')
const remember = ref(false)

const isSubmitting = ref(false)

const auth = useAuthStore()
const router = useRouter()

/*  Email validation*/
const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/* Safe error message */
const safeError = computed(() => {
  if (!auth.error) return ''
  return 'Email ou mot de passe incorrect'
})

const handleLogin = async () => {
  if (isSubmitting.value) return

  const cleanEmail = email.value.trim().toLowerCase()
  const cleanPassword = password.value.trim()

  if (!cleanEmail || !cleanPassword) return
  if (!isValidEmail(cleanEmail)) return

  // optional hardening
  if (cleanPassword.length > 100) return

  isSubmitting.value = true

  try {
    await auth.loginUser({
      email: cleanEmail,
      password: cleanPassword,
      remember: remember.value
    })

    // safer check (user + error)
    if (!auth.error && auth.user) {
      router.push('/')
    }

  } catch (err) {
    console.error('Login error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

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