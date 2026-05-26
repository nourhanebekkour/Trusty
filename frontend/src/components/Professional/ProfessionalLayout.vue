<template>
  <div class="professional-layout">
    <ProfessionalTopbar />
    <ProfessionalSidebar />

    <main class="professional-layout__main">
      <RouterView />
    </main>

    <ProfessionalFooter />
  </div>
</template>

<script setup>
import '@/assets/professional.css'
import ProfessionalTopbar from './ProfessionalTopbar.vue'
import ProfessionalSidebar from './ProfessionalSidebar.vue'
import ProfessionalFooter from './ProfessionalFooter.vue'
</script>

<style scoped>
.professional-layout {
  min-height: 100vh;
  background: #f4f2ec;
}

.professional-layout__main {
  min-height: calc(100vh - 64px);
  margin-left: 260px;
  padding: 88px 32px 72px;
}

@media (max-width: 900px) {
  .professional-layout__main {
    margin-left: 0;
    padding: 88px 18px 72px;
  }
}
</style>