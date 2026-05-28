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
import ProfessorSidebar from './ProfessorSideBar.vue'
import ProfessorFooter from './ProfessorFooter.vue'
</script>

<style scoped>
.professor-layout {
  min-height: 100vh;
  background: #F4F2EC;
}

.professor-layout__main {
  min-height: calc(100vh - 64px);
  margin-left: 210px;
  padding-top: 64px;
  padding-bottom: 0;
}
</style>