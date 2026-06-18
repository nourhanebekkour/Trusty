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
      <p>{{ errorMessage || "Le lien de vérification est invalide ou a expiré." }}</p>
      <router-link to="/login" class="btn-secondary">Retour à la connexion</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'

const route = useRoute()
const authStore = useAuthStore()
const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token
  
  if (!token) {
    loading.value = false
    success.value = false
    errorMessage.value = "Token de vérification manquant."
    return
  }

  try {
    await authStore.verifyEmail(token)
    success.value = true
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    errorMessage.value = error.response?.data?.message || "Une erreur est survenue lors de la vérification de votre compte."
  } finally {
    loading.value = false
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
