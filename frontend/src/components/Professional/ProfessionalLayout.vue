<template>
  <div class="professional-layout">
    <ProfessionalTopbar />

    <div class="layout-body">
      <ProfessionalSidebar />
      <main class="layout-content">
        <RouterView />
      </main>
    </div>

    <ProfessionalFooter />
  </div>
</template>

<script setup>
import '@/assets/professional.css'
import '@/assets/professional-pages.css'
import ProfessionalTopbar from './ProfessionalTopbar.vue/index.js'
import ProfessionalSidebar from './ProfessionalSidebar.vue'
import ProfessionalFooter from './ProfessionalFooter.vue'
</script>

<style scoped>
.professional-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background: var(--color-page-bg, #F5F3EE);
}

.layout-body {
  display: flex;
  flex: 1;
  width: 100%;
  align-items: stretch;
  min-height: 0;
}

.layout-content {
  flex: 1;
  padding: 0;
  background: var(--color-page-bg, #F5F3EE);
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  min-width: 0;
}
</style>
