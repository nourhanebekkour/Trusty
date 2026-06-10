<template>
  <div class="verify-email-container">
    <div v-if="loading" class="status-card">
      <div class="spinner"></div>
      <h1>Vérification de votre compte...</h1>
      <p>Veuillez patienter pendant que nous validons votre adresse e-mail.</p>
    </div>

    <div v-else-if="success" class="status-card success">
      <div class="icon-check">✓</div>
      <h1>Compte vérifié !</h1>
      <p>Votre adresse e-mail a été validée avec succès. Vous pouvez maintenant vous connecter.</p>
      <router-link to="/login" class="btn-primary">Se connecter</router-link>
    </div>

    <div v-else class="status-card error">
      <div class="icon-error">✕</div>
      <h1>Échec de la vérification</h1>
      <p>{{ sanitizedErrorMessage }}</p>
      <router-link to="/login" class="btn-secondary">Retour à la connexion</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

// Messages d'erreur génériques 
const GENERIC_MESSAGES = {
  missing:  "Le lien de vérification est incomplet.",
  invalid:  "Le lien de vérification est invalide ou a expiré.",
  default:  "Une erreur est survenue. Veuillez réessayer.",
}

// On n'affiche jamais un message brut venant du serveur
const sanitizedErrorMessage = computed(() => {
  const msg = errorMessage.value
  if (!msg) return GENERIC_MESSAGES.invalid
  if (msg.length > 120) return GENERIC_MESSAGES.default
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(msg))
  return div.innerHTML
})

//Validation stricte du format du token 
function isValidTokenFormat(token) {
  if (typeof token !== 'string') return false
  if (token.length < 10 || token.length > 512) return false
  return /^[a-zA-Z0-9\-_.]+$/.test(token)
}

//On mémorise les tokens déjà traités dans la session
const PROCESSED_KEY = 'verified_tokens'
function isAlreadyProcessed(token) {
  try {
    const list = JSON.parse(sessionStorage.getItem(PROCESSED_KEY) || '[]')
    return list.includes(token)
  } catch {
    return false
  }
}
function markAsProcessed(token) {
  try {
    const list = JSON.parse(sessionStorage.getItem(PROCESSED_KEY) || '[]')
    if (!list.includes(token)) {
      list.push(token)
      sessionStorage.setItem(PROCESSED_KEY, JSON.stringify(list.slice(-10)))
    }
  } catch { /* silencieux */ }
}

//Protection contre les soumissions multiples
let verificationInProgress = false

onMounted(async () => {
  // Si l'utilisateur est déjà connecté, redirection immédiate
  if (authStore.isAuthenticated) {
    await router.replace('/')
    return
  }

  const token = route.query.token

  //Token absent
  if (!token) {
    loading.value = false
    success.value = false
    errorMessage.value = GENERIC_MESSAGES.missing
    return
  }

  //Validation du format avant tout appel réseau
  if (!isValidTokenFormat(token)) {
    loading.value = false
    success.value = false
    errorMessage.value = GENERIC_MESSAGES.invalid
    return
  }

  //Anti-rejeu
  if (isAlreadyProcessed(token)) {
    loading.value = false
    success.value = false
    errorMessage.value = GENERIC_MESSAGES.invalid
    return
  }

  //Anti-double-clic / double montage
  if (verificationInProgress) return
  verificationInProgress = true

  try {
    await authStore.verifyEmail(token)
    markAsProcessed(token)
    success.value = true

    // Redirection automatique vers /login après 3s en cas de succès
    setTimeout(() => router.replace('/login'), 3000)
  } catch (error) {
    // Log interne uniquement en développement, jamais en production
    if (import.meta.env.DEV) {
      console.error('Erreur vérification email:', error)
    }
    // Message générique basé sur le status HTTP, sans détails backend
    const status = error.response?.status
    if (status === 400 || status === 404 || status === 410) {
      errorMessage.value = GENERIC_MESSAGES.invalid
    } else {
      errorMessage.value = GENERIC_MESSAGES.default
    }
  } finally {
    loading.value = false
    verificationInProgress = false
  }
})
</script>

<style scoped>
.verify-email-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f7f6;
  padding: 20px;
}

.status-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

h1 {
  margin-top: 20px;
  color: #333;
  font-size: 24px;
}

p {
  color: #666;
  margin: 15px 0 30px;
  line-height: 1.5;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon-check {
  font-size: 60px;
  color: #2ecc71;
  margin-bottom: 20px;
}

.icon-error {
  font-size: 60px;
  color: #e74c3c;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  display: inline-block;
  background-color: #95a5a6;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
</style>
