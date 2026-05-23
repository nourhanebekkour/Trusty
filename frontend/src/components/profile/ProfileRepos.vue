<template>
  <div class="card">
    <div class="section-header">
      <h3>Dépôts GitHub</h3>
      <button class="add-btn">+ Ajouter</button>
    </div>
    <div class="repo-list" v-if="user.etudiant?.depots_github?.length">
      <div class="repo-item" v-for="repo in user.etudiant.depots_github" :key="repo.id_depot">
        <div class="repo-icon">⚙</div>
        <div class="repo-info">
          <div class="repo-top">
            <a :href="repo.url_github ?? '#'" target="_blank" class="repo-name">{{ repo.nom_depot }}</a>
            <span class="ext-link">↗</span>
          </div>
          <p class="repo-desc" v-if="repo.description_github">{{ repo.description_github }}</p>
          <p class="repo-lang">
            <span class="lang-dot" :style="{ background: langColor(repo.langage_principal) }"></span>
            {{ repo.langage_principal }}
          </p>
          <p class="repo-meta" v-if="repo.date_dernier_commit">
  Dernier commit : {{ new Date(repo.date_dernier_commit).toLocaleDateString('fr-FR') }}
</p>
        </div>
      </div>
    </div>
    <p class="empty-msg" v-else>Aucun dépôt lié.</p>
    <button class="link-btn">Lier un nouveau dépôt</button>
  </div>
</template>

<script setup>
defineProps({ user: Object })

const langColors = {
  JavaScript: '#f0db4f', TypeScript: '#3178c6', Python: '#3572A5',
  Vue: '#42b883', PHP: '#777bb3', Java: '#b07219', CSS: '#563d7c', HTML: '#e34c26',
}
const langColor = (lang) => langColors[lang] ?? '#6b7280'
</script>
<style scoped>
@import '@/assets/profile.css';
</style>