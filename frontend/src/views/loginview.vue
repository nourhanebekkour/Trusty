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

      <ul class="features">
        <li>
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C8C6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <div>
            <strong>Validations Institutionnelles</strong>
            <p>Vos compétences sont certifiées par des organismes officiels.</p>
          </div>
        </li>
        <li>
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C8C6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <strong>Score de Crédibilité</strong>
            <p>Boostez votre employabilité avec un profil vérifié à 100%.</p>
          </div>
        </li>
        <li>
          <div class="icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C8C6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <div>
            <strong>Parcours Adaptatifs</strong>
            <p>Des portfolios qui évoluent avec vos réussites académiques.</p>
          </div>
        </li>
      </ul>

      <div class="footer-note">
        <span>🏛️ Utilisé par +50 institutions</span>
        <span>🔒 Données sécurisées (RGPD)</span>
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right">
      <h2>Bon retour parmi nous</h2>
      <p class="welcome-sub">Veuillez entrer vos identifiants pour accéder à votre espace.</p>

      <form @submit.prevent="handleLogin">

        <div class="field">
          <label>Nom d'utilisateur ou Email</label>
          <input v-model="email" type="text" placeholder="nom@ecole.fr" />
        </div>

        <div class="field">
          <label>
            Mot de passe
            <a href="#" class="forgot">Mot de passe oublié ?</a>
          </label>
          <input v-model="password" type="password" placeholder="••••••••" />
        </div>

        <div class="remember">
          <input type="checkbox" v-model="remember" id="remember" />
          <label for="remember">Se souvenir de moi</label>
        </div>

        <p v-if="auth.error" class="error">{{ auth.error }}</p>

        <button type="submit" class="btn-login" :disabled="auth.loading">
          {{ auth.loading ? 'Connexion...' : 'Se connecter →' }}
        </button>

        <div class="divider">OU CONTINUER EN TANT QU'INVITÉ</div>

        <button type="button" class="btn-guest">Consulter les portfolios publics</button>

        <p class="terms">
          En vous connectant, vous acceptez nos
          <a href="#">Conditions d'utilisation</a> et notre
          <a href="#">Politique de Confidentialité</a>
        </p>

      </form>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authstor'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const remember = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function handleLogin() {
  await auth.loginUser({
    email: email.value,
    password: password.value
  })
  if (!auth.error) {
    router.push('/')
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

/* ── LEFT ── */
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
  margin-bottom: 40px;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: #e8f0ee;
  line-height: 1.3;
  margin-bottom: 16px;
}

.accent {
  color: #5C8C6A;
}

.subtitle {
  color: #a8bdb8;
  font-size: 15px;
  margin-bottom: 40px;
}

.features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.features li {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.icon-box {
  width: 42px;
  height: 42px;
  min-width: 42px;
  background: #1a2e2a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.features strong {
  display: block;
  font-size: 15px;
  color: #e8f0ee;
}

.features p {
  font-size: 13px;
  color: #a8bdb8;
  margin-top: 4px;
}

.footer-note {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #a8bdb8;
  margin-top: 40px;
}

/* ── RIGHT ── */
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
  margin-bottom: 10px;
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
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #e8f0ee;
  margin-bottom: 8px;
}

.forgot {
  color: #5C8C6A;
  font-weight: 400;
  font-size: 12px;
  text-decoration: none;
}

.field input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #3a5048;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #2a3d38;
  color: #e8f0ee;
  transition: border 0.2s;
}

.field input::placeholder {
  color: #6a8880;
}

.field input:focus {
  border-color: #5C8C6A;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #a8bdb8;
  margin-bottom: 24px;
}

.error {
  color: #e57373;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #5C8C6A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background 0.2s;
}

.btn-login:hover {
  background: #4a7058;
}

.btn-login:disabled {
  background: #3a5048;
  cursor: not-allowed;
  opacity: 0.7;
}

.divider {
  text-align: center;
  font-size: 11px;
  color: #6a8880;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.btn-guest {
  width: 100%;
  padding: 13px;
  background: transparent;
  color: #e8f0ee;
  border: 1px solid #3a5048;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: background 0.2s;
}

.btn-guest:hover {
  background: #D6EDE8;
  color: #1a2e2a;
}

.terms {
  font-size: 12px;
  color: #6a8880;
  text-align: center;
  line-height: 1.6;
}

.terms a {
  color: #5C8C6A;
  text-decoration: none;
}
</style>