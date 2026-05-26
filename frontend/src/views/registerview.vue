<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authstore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  nom: '',
  prenom: ''
})

async function handleRegister() {
  const success = await authStore.register(form.value)
  if (success) {
    // Compte INACTIF 
    router.push('/login?registered=true')
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister">
    <input v-model="form.prenom" placeholder="Prénom" required />
    <input v-model="form.nom" placeholder="Nom" required />
    <input v-model="form.email" type="email" placeholder="Email" required />
    <input v-model="form.password" type="password" placeholder="Mot de passe" required />
    <p v-if="authStore.error" class="error">{{ authStore.error }}</p>
    <button type="submit" :disabled="authStore.loading">
      {{ authStore.loading ? 'Inscription...' : "S'inscrire" }}
    </button>
  </form>
</template>