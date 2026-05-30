<template>
  <div class="admin-layout">
    <AppTopbar :notif-count="3" />
    <AppSidebar />

    <main class="admin-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppTopbar from '../layout/AppTopbar.vue'
import AppSidebar from '../layout/AppSidebar.vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #edeade;
}

.admin-layout__main {
  margin-left: 220px;
  padding-top: 60px;
  min-height: 100vh;
}

@media (max-width: 900px) {
  .admin-layout__main {
    margin-left: 0;
  }
}
</style>
