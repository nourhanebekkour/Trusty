<template>
  <div class="professor-layout">
    <ProfessorTopbar />
    <div class="professor-layout__body">
      <ProfessorSidebar />
      <main class="professor-layout__main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ProfessorTopbar from './ProfessorTopbar.vue'
import ProfessorSidebar from './ProfessorSideBar_ma.vue/index.js'

const isCollapsed = ref(false)
provide('sidebarCollapsed', isCollapsed)
</script>

<style scoped>
.professor-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-page-bg, #F4F2EC);
}

.professor-layout__body {
  display: flex;
  flex: 1;
}

.professor-layout__main {
  flex: 1;
  min-width: 0;
  background: var(--color-page-bg, #F4F2EC);
  overflow-y: auto;
}
</style>