<script setup>
import { onMounted } from 'vue'          
import { RouterView } from 'vue-router'
import SideBar from './components/laayout/SideBar.vue'
import { useAuthStore } from './stores/auth'  
const authStore = useAuthStore()         

onMounted(async () => {                  
  await authStore.fetchUser()
})
</script>

<template>
  <SideBar />
  <RouterView/>
</template>