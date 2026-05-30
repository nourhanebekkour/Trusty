<template>
  <div class="page-header professional-topbar">
    <div>
      <div class="logo">Trusty<span>.io</span></div>
      <h1 class="page-title">Portfolios a recommander</h1>
      <p class="page-sub">Emettez des recommandations professionnelles pour les etudiants.</p>
    </div>

    <div class="professional-topbar__status">
      <span class="dot ok"></span>
      Espace professionnel
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.professional-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.logo {
  color: #d6ede8;
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
}

.logo span {
  color: #a0b4ae;
  font-weight: 500;
}

.professional-topbar__status {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(214, 237, 232, 0.18);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  color: #a8d4cc;
  background: rgba(214, 237, 232, 0.05);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .professional-topbar {
    flex-direction: column;
  }
}
</style>
