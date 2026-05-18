<script setup>
import { onMounted } from 'vue'          
import { RouterView } from 'vue-router'
import SideBar from './components/laayout/SideBar.vue'
import { useAuthStore } from './stores/auth'  
const authStore = useAuthStore()         

onMounted(async () => {                  
  await authStore.fetchUser()
})
import NavBar from './components/laayout/NavBar.vue'
import AppFooter from './components/laayout/Footer.vue'
</script>

<template>
  <div class="app">
    <NavBar />       
    <div class="layout">
      <SideBar />
      <main class="content">
        <RouterView />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

/* Dans App.vue */
/* Dans App.vue */
.layout {
  display: flex;
  flex: 1;
  width: 100%;
  align-items: stretch;
  min-height: 0;
  /* AJOUTEZ CETTE LIGNE */
  background-color: #F4F2EC; /* La couleur beige de votre sidebar */
}

.content {
  flex: 1;
  padding: 0px;
  background-color: #0D2B2B;
  overflow-y: auto;
  min-height: 0; /* ← ajoute */
}
</style>