<template>
  <div class="app">
    <NavBar />
    <div class="layout">
      <AdminSideBar />
      <main class="content">
        <RouterView />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import NavBar from '../laayout/NavBar.vue'
import AdminSideBar from './AdminSideBar.vue'
import Footer from '../laayout/Footer.vue'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.layout {
  display: flex;
  flex: 1;
  width: 100%;
  align-items: stretch;
  min-height: 0;
  background-color: var(--color-page-bg);
}

.content {
  flex: 1;
  padding: 0px;
  background-color: var(--color-page-bg);
  overflow-y: auto;
  min-height: 0;
}
</style>
