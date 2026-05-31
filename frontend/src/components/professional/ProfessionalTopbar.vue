<template>
  <div class="page-header professional-topbar">
    <div>
      <div class="logo">TRUSTY</div>
      <h1 class="page-title">Candidats a recommander</h1>
      <p class="page-sub">Consultez les profils exposes par les APIs existantes et emettez des recommandations.</p>
    </div>

    <div class="professional-topbar__status">
      <span class="dot ok"></span>
      Espace professionnel
    </div>
  </div>
</template>

<style scoped>
.professional-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.logo {
  color: #5c8c6a;
  font-size: 16px;
  font-weight: 900;
  margin-bottom: 8px;
}

.professional-topbar__status {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #b7d5cd;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  color: #0d2b2b;
  background: #d6ede8;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .professional-topbar {
    flex-direction: column;
  }
}
</style>
