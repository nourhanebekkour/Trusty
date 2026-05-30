<template>
  <div class="card">
    <div class="section-header">
      <h3>Dépôts GitHub</h3>
      <a
        v-if="githubUsername"
        :href="`https://github.com/${githubUsername}`"
        target="_blank"
        class="add-btn"
        rel="noopener"
      >Voir profil ↗</a>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="repos-loading">
      <div class="skeleton" v-for="n in 3" :key="n"></div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="repos-error">
      <span>⚠️ {{ error }}</span>
      <button class="link-btn" @click="loadRepos">Réessayer</button>
    </div>

    <!-- Pas de username configuré -->
    <div v-else-if="!githubUsername" class="empty-msg">
      <p>Aucun compte GitHub lié. Modifiez votre profil pour ajouter votre username.</p>
    </div>

    <!-- Liste des dépôts -->
    <div class="repo-list" v-else-if="allRepos.length">
      <a
        class="repo-item"
        v-for="repo in visibleRepos"
        :key="repo.id_depot"
        :href="repo.url_github"
        target="_blank"
        rel="noopener"
      >
        <div class="repo-icon">
          <span v-if="repo.is_fork">🍴</span>
          <Github v-else class="github-icon" />
        </div>
        <div class="repo-info">
          <div class="repo-top">
            <a :href="repo.url_github" target="_blank" class="repo-name" rel="noopener">
              {{ repo.nom_depot }} <span class="ext-link">↗</span>
            </a>
          </div>

          <p class="repo-desc" v-if="repo.description_github">{{ repo.description_github }}</p>

          <!-- Topics -->
          <div class="repo-topics" v-if="repo.topics?.length">
            <span class="topic-tag" v-for="t in repo.topics.slice(0, 3)" :key="t">{{ t }}</span>
          </div>

          <div class="repo-meta-row">
            <p class="repo-lang" v-if="repo.langage_principal">
              <span class="lang-dot" :style="{ background: langColor(repo.langage_principal) }"></span>
              {{ repo.langage_principal }}
            </p>
            <span class="repo-stars" v-if="repo.stargazers_count">
              ⭐ {{ repo.stargazers_count }}
            </span>
            <span class="repo-forks" v-if="repo.forks_count">
              🍴 {{ repo.forks_count }}
            </span>
            <p class="repo-meta" v-if="repo.date_dernier_commit">
              Màj : {{ formatDate(repo.date_dernier_commit) }}
            </p>
          </div>
        </div>
      </a>

      <!-- Voir plus / moins -->
      <button v-if="hasMore" class="link-btn" @click="showAll = !showAll">
        {{ showAll ? 'Voir moins ↑' : `Voir plus (${allRepos.length - 5} de plus) →` }}
      </button>
    </div>

    <!-- Aucun dépôt -->
    <p class="empty-msg" v-else>Aucun dépôt public trouvé.</p>

    <a
      v-if="githubUsername"
      :href="`https://github.com/${githubUsername}?tab=repositories`"
      target="_blank"
      class="link-btn"
      rel="noopener"
    >
      Voir tous les dépôts sur GitHub ↗
    </a>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Github } from 'lucide-vue-next'

async function fetchGithubRepos(username) {
  if (!username) return []
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=public`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`)
    const repos = await res.json()
    return repos.map((r) => ({
      id_depot:            String(r.id),
      nom_depot:           r.name,
      url_github:          r.html_url,
      description_github:  r.description ?? '',
      langage_principal:   r.language ?? null,
      date_dernier_commit: r.pushed_at ?? null,
      stargazers_count:    r.stargazers_count,
      forks_count:         r.forks_count,
      topics:              r.topics ?? [],
      is_fork:             r.fork,
    }))
  } catch (err) {
    console.warn('[fetchGithubRepos] Erreur GitHub API :', err.message)
    throw err
  }
}

const props = defineProps({ user: Object })

const allRepos       = ref([])
const loading        = ref(false)
const error          = ref(null)
const showAll        = ref(false)
const githubUsername = ref(props.user?.etudiant?.github_username ?? null)

const visibleRepos = computed(() =>
  showAll.value ? allRepos.value : allRepos.value.slice(0, 5)
)

const hasMore = computed(() => allRepos.value.length > 5)

watch(
  () => props.user?.etudiant?.github_username,
  (newUsername) => {
    githubUsername.value = newUsername
    loadRepos()
  }
)

async function loadRepos() {
  if (!githubUsername.value) {
    allRepos.value = []
    return
  }

  const dbRepos = props.user?.etudiant?.depots_github ?? []
  if (dbRepos.length) allRepos.value = dbRepos

  loading.value = true
  error.value   = null
  try {
    allRepos.value = await fetchGithubRepos(githubUsername.value)
  } catch (e) {
    error.value = 'Impossible de charger les dépôts GitHub.'
    if (dbRepos.length) allRepos.value = dbRepos
  } finally {
    loading.value = false
  }
}

const langColors = {
  JavaScript: '#f0db4f', TypeScript: '#3178c6', Python:  '#3572A5',
  Vue:        '#42b883', PHP:        '#777bb3', Java:    '#b07219',
  CSS:        '#563d7c', HTML:       '#e34c26', Rust:    '#dea584',
  Go:         '#00ADD8', Ruby:       '#CC342D', C:       '#555555',
  'C++':      '#f34b7d', 'C#':       '#178600', Shell:   '#89e051',
  Kotlin:     '#A97BFF', Swift:      '#FA7343', Dart:    '#00B4AB',
}
const langColor = (lang) => langColors[lang] ?? '#6b7280'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

onMounted(loadRepos)
</script>

<style scoped>
@import '@/assets/profile.css';

.github-icon {
  width: 22px;
  height: 22px;
}

.repos-loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.skeleton {
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.repos-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #e74c3c;
  font-size: 13px;
  padding: 12px 0;
}

.repo-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 4px 0;
}

.topic-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 500;
}

.repo-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.repo-stars,
.repo-forks {
  font-size: 11px;
  color: var(--color-text-secondary, #888);
}

.repo-item {
  display: flex;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.repo-item:hover { background: #f9fafb; border-radius: 8px; }
.repo-item:hover .repo-name { color: #4f46e5; }

.ext-link {
  font-size: 11px;
  color: #9ca3af;
  margin-left: 4px;
  opacity: 0;
  transition: opacity .15s;
}
.repo-item:hover .ext-link { opacity: 1; }
</style>