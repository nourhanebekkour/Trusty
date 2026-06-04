<template>
  <div class="professor-layout">
    <ProfessorTopbar />
    <ProfessorSidebar />

    <main class="professor-layout__main">
      <RouterView />
    </main>

    <ProfessorFooter />
  </div>
</template>

<script setup>
import ProfessorTopbar from './ProfessorTopbar.vue'
import ProfessorSidebar from './ProfessorSidebar.vue'
import ProfessorFooter from './ProfessorFooter.vue'
</script>

<style scoped>
.professor-layout {
  min-height: 100vh;
  background: var(--color-page-bg, #F4F2EC);
}

.professor-layout__main {
  margin-left: 235px;
  padding-top: 64px;
  min-height: calc(100vh - 64px);
  background: var(--color-page-bg, #F4F2EC);
}
</style>