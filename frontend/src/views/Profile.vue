<template>
  <div class="profile-page">

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="loadProfile" class="btn-outline">Réessayer</button>
    </div>

    <!-- Content -->
    <template v-else-if="user">
      <div class="page-header">
        <h1>Mon Profil Étudiant</h1>
        <p class="subtitle">Gérez votre identité numérique et vos certifications professionnelles.</p>
      </div>

      <div class="profile-grid">

        <!-- LEFT SIDEBAR -->
        <div class="sidebar">

          <!-- Profile Card -->
          <div class="card profile-card">
            <div class="cover-banner"></div>
            <div class="avatar-wrapper">
              <div class="avatar">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                <span v-else>{{ getInitials(user.name) }}</span>
                <span class="online-dot"></span>
              </div>
            </div>
            <div class="profile-info">
              <h2>{{ user.name }}</h2>
              <p class="role" v-if="user.role || user.specialite">{{ user.role ?? user.specialite }}</p>
              <div class="info-row">✉ {{ user.email }}</div>
              <div class="info-row" v-if="user.phone">📞 {{ user.phone }}</div>
              <div class="info-row" v-if="user.location">📍 {{ user.location }}</div>
              <div class="info-row" v-if="user.created_at">
                📅 Inscrit en {{ formatDate(user.created_at) }}
              </div>
              <button class="btn-outline" @click="openEditModal">✏️ Modifier le profil</button>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="card stats-card">
            <p class="stats-label">STATISTIQUES D'ACTIVITÉ</p>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-number">{{ user.projects_count ?? 0 }}</span>
                <span class="stat-desc">Projets Validés</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ user.badges_count ?? 0 }}</span>
                <span class="stat-desc">Badges</span>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT CONTENT -->
        <div class="content">

          <!-- Skills -->
          <div class="card">
            <div class="section-header">
              <h3>Compétences</h3>
              <button class="add-btn" @click="openSkillsModal">+ Ajouter</button>
            </div>
            <div class="tags" v-if="user.skills && user.skills.length">
              <span class="tag" v-for="skill in user.skills" :key="skill">{{ skill }}</span>
            </div>
            <p class="empty-msg" v-else>Aucune compétence ajoutée.</p>
          </div>

          <!-- Badges -->
          <div class="card">
            <div class="section-header">
              <h3>Badges Certifiés</h3>
            </div>

            <div class="badges-grid" v-if="user.badges && user.badges.length">
              <div class="badge-card" v-for="badge in user.badges" :key="badge.id ?? badge.title">
                <div class="badge-icon" :style="{ background: badge.color ?? '#EEEDFE' }">
                  <span>{{ badge.icon ?? '🏅' }}</span>
                </div>
                <div>
                  <p class="badge-title">{{ badge.title ?? badge.name }}</p>
                  <p class="badge-year">{{ badge.year ?? formatYear(badge.obtained_at) }}</p>
                </div>
              </div>
            </div>
            <p class="empty-msg" v-else>Aucun badge certifié.</p>

            <!-- Generate Portfolio -->
            <div class="generate-box">
              <div class="gen-icon">✨</div>
              <h4>Générer mon portfolio</h4>
              <p>Créez instantanément un portfolio professionnel certifié à partir de vos projets et badges validés. Prêt à être partagé avec des recruteurs.</p>
              <button class="btn-primary" @click="generatePortfolio">🔗 Lancer la génération</button>
            </div>
          </div>

          <!-- GitHub + Projets -->
          <div class="two-cols">

            <!-- GitHub Repos -->
            <div class="card">
              <div class="section-header">
                <h3>Dépôts GitHub</h3>
                <button class="add-btn">+ Ajouter</button>
              </div>
              <div class="repo-list" v-if="user.repositories && user.repositories.length">
                <div class="repo-item" v-for="repo in user.repositories" :key="repo.id ?? repo.name">
                  <div class="repo-icon">⚙</div>
                  <div class="repo-info">
                    <div class="repo-top">
                      <a :href="repo.url ?? repo.html_url ?? '#'" target="_blank" class="repo-name">
                        {{ repo.name }}
                      </a>
                      <span class="ext-link">↗</span>
                    </div>
                    <p class="repo-desc">{{ repo.description }}</p>
                    <p class="repo-lang">
                      <span class="lang-dot" :style="{ background: langColor(repo.language) }"></span>
                      {{ repo.language }}
                    </p>
                  </div>
                </div>
              </div>
              <p class="empty-msg" v-else>Aucun dépôt lié.</p>
              <button class="link-btn">Lier un nouveau dépôt</button>
            </div>

            <!-- Projets Académiques -->
            <div class="card">
              <div class="section-header">
                <h3>Projets Académiques</h3>
                <button class="add-btn">+ Ajouter</button>
              </div>
              <div class="project-list" v-if="user.projects && user.projects.length">
                <div class="project-row" v-for="project in user.projects" :key="project.id">
                  <div class="project-info">
                    <span class="project-icon">{{ project.icon ?? '📁' }}</span>
                    <div>
                      <p class="project-title">{{ project.title ?? project.name }}</p>
                      <p class="project-desc">{{ project.description }}</p>
                    </div>
                  </div>
                  <span class="status" :class="statusClass(project.status)">
                    {{ project.status }}
                  </span>
                </div>
              </div>
              <p class="empty-msg" v-else>Aucun projet académique.</p>
              <button class="link-btn">Voir tous les projets</button>
            </div>

          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-overlay" v-if="showEditModal" @click.self="closeEditModal">
        <div class="modal">
          <div class="modal-header">
            <h3>Modifier le profil</h3>
            <button class="close-btn" @click="closeEditModal">✕</button>
          </div>
          <div class="modal-body">
            <label>Nom complet</label>
            <input v-model="editForm.name" type="text" placeholder="Nom complet" />
            <label>Téléphone</label>
            <input v-model="editForm.phone" type="text" placeholder="+33 6 ..." />
            <label>Localisation</label>
            <input v-model="editForm.location" type="text" placeholder="Paris, France" />
          </div>
          <div class="modal-footer">
            <button class="btn-outline" @click="closeEditModal">Annuler</button>
            <button class="btn-primary" @click="saveProfile" :disabled="saving">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

    </template>
  </div>
  <!-- Skills Modal -->
<div v-if="showSkillsModal" class="modal-overlay" @click.self="showSkillsModal = false">
  <div class="skill-modal">

    <!-- Header -->
    <div class="skill-modal-header">
      <div class="skill-modal-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l1.9 5.8h6.1l-4.9 3.6 1.9 5.8-4.9-3.6-4.9 3.6 1.9-5.8-4.9-3.6h6.1z"/>
        </svg>
      </div>
      <button class="skill-modal-close" @click="showSkillsModal = false">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="skill-modal-body">
      <h2 class="skill-modal-title">Ajouter une compétence</h2>
      <p class="skill-modal-subtitle">Ajoutez une compétence à votre profil pour la mettre en avant.</p>

      <label class="skill-input-label">Nom de la compétence</label>
      <div class="skill-input-wrapper">
        <svg class="skill-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Ex: Vue.js, Design UI, Gestion de projet…"
          class="skill-input"
          v-model="newSkillName"
          @keyup.enter="saveSkill"
        />
      </div>

      <!-- Suggestions -->
      <div class="skill-suggestions">
        <span class="skill-suggestions-label">Suggestions</span>
        <div class="skill-suggestions-tags">
          <button
            v-for="tag in suggestionTags"
            :key="tag"
            class="skill-tag-btn"
            :class="{ active: newSkillName === tag }"
            @click="newSkillName = tag"
          >{{ tag }}</button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="skill-modal-footer">
      <button class="skill-btn-cancel" @click="showSkillsModal = false">Annuler</button>
      <button 
  class="skill-btn-submit" 
  :disabled="!newSkillName.trim()" 
  @click="saveSkill"
>
  + Ajouter au profil
</button>
    </div>

    <!-- Success -->
    <transition name="skill-fade">
      <div v-if="showSuccess" class="skill-success">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>✅ "{{ savedSkillName }}" ajoutée avec succès !</span>
</div>
    </transition>

  </div>
</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue' // Ajoute nextTick ici
import { useAuthStore } from '@/stores/authstore'
import { getProfile, patchProfile } from '@/services/authservices'

const authStore     = useAuthStore()
const user          = ref(null)
const loading       = ref(false)
const error         = ref(null)
const showEditModal = ref(false)
const saving        = ref(false)

const editForm = ref({ name: '', phone: '', location: '' })

const loadProfile = async () => {
  loading.value = true
  error.value   = null
  try {
    const res      = await getProfile()
    user.value     = res.data
    authStore.user = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

const openEditModal  = () => {
  editForm.value = {
    name:     user.value.name     ?? '',
    phone:    user.value.phone    ?? '',
    location: user.value.location ?? '',
  }
  showEditModal.value = true
}
const closeEditModal = () => { showEditModal.value = false }

const saveProfile = async () => {
  saving.value = true
  try {
    const res      = await patchProfile(user.value.id, editForm.value)
    user.value     = { ...user.value, ...res.data }
    authStore.user = user.value
    closeEditModal()
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la mise à jour.')
  } finally {
    saving.value = false
  }
}

const generatePortfolio = () => alert('Fonctionnalité bientôt disponible !')

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

const formatYear = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).getFullYear()
}

const statusClass = (status) => ({
  'status-green': ['Validé', 'validated', 'active'].includes(status),
  'status-amber': ['En attente', 'pending'].includes(status),
  'status-gray':  ['Brouillon', 'draft'].includes(status),
})

const langColors = {
  JavaScript: '#f0db4f', TypeScript: '#3178c6',
  Python: '#3572A5', Vue: '#42b883',
  PHP: '#777bb3', Java: '#b07219',
  CSS: '#563d7c', HTML: '#e34c26',
}
const langColor = (lang) => langColors[lang] ?? '#6b7280'

onMounted(loadProfile)

const showSkillsModal = ref(false);
const newSkillName = ref('');

const suggestionTags = [
  'Vue.js',
  'JavaScript',
  'PHP',
  'Laravel',
  'CSS',
  'HTML',
  'Python',
  'Git',
  'Machine Learning'
]

const showSuccess = ref(false)
const savedSkillName = ref('')

function openSkillsModal() {
  showSkillsModal.value = true;
}

// 1. Déclare la variable de référence (SANS import ici)
const skillInputRef = ref(null);

function saveSkill() {
  const skillToAdd = newSkillName.value.trim();
  if (!skillToAdd) return;

  // Initialise user.value si nécessaire (mode demo/dev)
  if (!user.value) {
    user.value = { skills: [] };
  }

  if (!user.value.skills) {
    user.value.skills = [];
  }

  if (user.value.skills.includes(skillToAdd)) {
    alert("Cette compétence est déjà dans votre profil.");
    newSkillName.value = '';
    return;
  }

  // Ajout de la compétence
  user.value.skills.push(skillToAdd);
  savedSkillName.value = skillToAdd;

  // Reset + message succès
  newSkillName.value = '';
  showSuccess.value = true;

  nextTick(() => {
    const inputElement = document.querySelector('.skill-input');
    if (inputElement) inputElement.focus();
  });

  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
}
</script>

<style scoped>

* { box-sizing: border-box; margin: 0; padding: 0; color: #D6EDE8; }

.profile-page {
  padding: 28px 32px;
  background: #0D2B2B;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow-x: hidden; /* ← AJOUT : empêche le scroll horizontal */
}

/* ── States ── */
.loading-state, .error-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 60vh; gap: 16px; color: #6b7280;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #378ADD;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Header ── */
.page-header h1 { font-size: 22px; font-weight: 600; color: #D6EDE8; }
.subtitle { font-size: 13px; color: #D6EDE8; margin-top: 4px; margin-bottom: 20px; }

/* ── Grid ── */
/* Dans votre CSS */
.profile-grid {
  display: grid;
  /* Changez 240px par une valeur plus grande, ex: 320px */
  grid-template-columns: 320px 1fr; 
  gap: 20px;
  align-items: start;
  background-color: #0D2B2B;
  min-width: 0;
}
.sidebar { display: flex; flex-direction: column; gap: 16px; min-width: 0; /* ← AJOUT */ }
.content { display: flex; flex-direction: column; gap: 16px; color: #D6EDE8; min-width: 0; /* ← AJOUT */ }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; min-width: 0; /* ← AJOUT */ }

/* ── Card ── */
.card { background: #3D3D3D; border: 1px solid #3D3D3D; border-radius: 12px; padding: 18px 20px; min-width: 0; /* ← AJOUT */ }

/* ── Profile Card ── */
.cover-banner {
  background: linear-gradient(135deg, #c7dcf7, #b2e8d4);
  height: 68px; border-radius: 10px 10px 0 0;
  margin: -18px -20px 0;
}
.avatar-wrapper { margin-top: -28px; margin-bottom: 10px; }
.avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, #378ADD, #1D9E75);
  color: #fff; font-size: 20px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  position: relative; border: 3px solid #fff; overflow: hidden;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.online-dot {
  width: 13px; height: 13px; background: #1D9E75;
  border-radius: 50%; border: 2px solid #fff;
  position: absolute; bottom: 1px; right: 1px;
}
.profile-info h2 { font-size: 15px; font-weight: 600; color: #D6EDE8; }
.role { font-size: 13px;
    color: #D6EDE8;
    margin: 2px 0 10px; }
.info-row { font-size: 13px; color: #D6EDE8; margin-top: 6px; }

.btn-outline {
  width: 100%; margin-top: 14px; padding: 8px;
  border-radius: 8px; border: 1px solid #5C8C6A;
  background: #5C8C6A; color: #374151;
  font-size: 13px; cursor: pointer;
}
.btn-outline:hover { background: #f9fafb; }

/* ── Stats ── */
.stats-label { font-size: 10px; font-weight: 600; letter-spacing: .06em; color: #9ca3af; margin-bottom: 10px; }
.stats-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.stat-box    { background: #1A3838; border-radius: 8px; padding: 12px; text-align: center; }
.stat-number { display: block; font-size: 24px; font-weight: 600; color: #D6EDE8; }
.stat-desc   { font-size: 11px; color: #6b7280; margin-top: 2px; display: block; }

/* ── Section header ── */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-header h3 { font-size: 14px; font-weight: 600; color: #D6EDE8; }
.add-btn {
  top: 754px; left: 1047px; width: 97px; height: 32px; padding: 0 12px;
  display: flex; align-items: center; justify-content: center;
  font-family: Inter; font-size: 14px; line-height: 22px; font-weight: 500;
  color: #D6EDE8; background: #00000000; opacity: 1;
  border: none; border-radius: 10px; gap: 8px; cursor: pointer;
}

/* ── Tags ── */
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag  { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }

/* ── Badges ── */
.badges-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.badge-card  { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px; border: 1px solid #5C8C6A; flex: 1; min-width: 140px; background: #5C8C6A; }
.badge-icon  { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.badge-title { font-size: 13px; font-weight: 500; color: #1a1a2e; }
.badge-year  { font-size: 11px; color: #9ca3af; margin-top: 1px; }

/* ── Generate Box ── */
.generate-box { border: 1.5px dashed #d1d5db; border-radius: 12px; padding: 24px 20px; text-align: center; margin-top: 16px; }
.gen-icon { font-size: 32px; margin-bottom: 10px; }
.generate-box h4 { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.generate-box p  { font-size: 13px; color: #6b7280; line-height: 1.6; }

.btn-primary {
  margin-top: 14px; padding: 9px 20px;
  background: #5C8C6A; color: #fff;
  border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
}
.btn-primary:hover    { background: #2568b0; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

/* ── Repos ── */
.repo-list { display: flex; flex-direction: column; }
.repo-item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
.repo-item:last-child { border-bottom: none; }
.repo-icon { font-size: 16px; margin-top: 2px; color: #6b7280; flex-shrink: 0; }
.repo-info { flex: 1; min-width: 0; /* ← AJOUT */ }
.repo-top  { display: flex; justify-content: space-between; }
.repo-name { font-size: 13px; font-weight: 500; color: #5C8C6A; text-decoration: none; }
.repo-name:hover { text-decoration: underline; }
.ext-link  { font-size: 12px; color: #9ca3af; }
.repo-desc { font-size: 12px; color: #f3f4f6; margin-top: 2px; line-height: 1.4; }
.repo-lang { font-size: 11px; color: #6b7280; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
.lang-dot  { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

.link-btn {
  top: 1129px; left: 418px; width: 100%; height: 40px; padding: 0 12px;
  display: flex; align-items: center; justify-content: center;
  font-family: Inter; font-size: 12px; line-height: 20px; font-weight: 500;
  color: #63604FFF; background: #00000000;
  opacity: 1; border: none; border-radius: 10px; cursor: pointer;
}

/* ── Projects ── */
.project-list  { display: flex; flex-direction: column; }
.project-row   { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.project-row:last-child { border-bottom: none; }
.project-info  { display: flex; align-items: center; gap: 10px; min-width: 0; /* ← AJOUT */ }
.project-icon  { font-size: 18px; flex-shrink: 0; /* ← AJOUT */ }
.project-title { font-size: 13px; font-weight: 500; color: #5C8C6A; }
.project-desc  { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.status        { font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; /* ← AJOUT */ }
.status-green  { background: #EAF3DE; color: #3B6D11; }
.status-amber  { background: #FAEEDA; color: #854F0B; }
.status-gray   { background: #f3f4f6; color: #6b7280; }

.empty-msg { font-size: 13px; color: #9ca3af; padding: 8px 0; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal { background: #fff; border-radius: 14px; width: 420px; max-width: 95vw; padding: 24px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 16px; font-weight: 600; color: #1a1a2e; }
.close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #6b7280; }
.modal-body { display: flex; flex-direction: column; gap: 10px; }
.modal-body label { font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: -4px; }
.modal-body input { padding: 9px 12px; border: 1px solid #0D2B2B; border-radius: 8px; font-size: 14px; color: #1a1a2e; outline: none; background-color: #0D2B2B;}
.modal-body input:focus { border-color: #5C8C6A; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .profile-grid { 
    /* Ajustez ici aussi si nécessaire ou passez à 1fr pour empiler */
    grid-template-columns: 280px 1fr; 
  }
}

@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
  .two-cols     { grid-template-columns: 1fr; }
  .profile-page { padding: 16px; }
}

@media (max-width: 480px) {
  .profile-page { padding: 12px; }
  .badges-grid  { flex-direction: column; }
  .badge-card   { min-width: unset; }
}

/* Gardez le CSS précédent, mais vous pouvez ajuster la max-width si besoin */
/* ── Skill Modal ── */
.modal{
  background-color: #1A3838;
}
.skill-modal {
  background: #1A3838;
  border: 1px solid #2a4a4a;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  position: relative;
}

.skill-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 22px 0;
}

.skill-modal-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #0D2B2B;
  border: 1px solid #2a4a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5C8C6A;
}

.skill-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: #6b9a8a;
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;
}
.skill-modal-close:hover {
  background: #0D2B2B;
  color: #D6EDE8;
}

.skill-modal-body {
  padding: 14px 22px 0;
}

.skill-modal-title {
  font-size: 15px;
  font-weight: 600;
  color: #D6EDE8;
  margin: 14px 0 4px;
}

.skill-modal-subtitle {
  font-size: 13px;
  color: #6b9a8a;
  margin: 0 0 18px;
  line-height: 1.5;
}

.skill-input-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b9a8a;
  display: block;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.skill-input-wrapper {
  position: relative;
}

.skill-input-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: #4a7a6a;
  pointer-events: none;
}

.skill-input {
  width: 100%;
  padding: 10px 12px 10px 33px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #2a4a4a;
  background: #0D2B2B;
  color: #D6EDE8;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.skill-input::placeholder { color: #4a6a6a; }
.skill-input:focus { border-color: #5C8C6A; }

/* Suggestions */
.skill-suggestions { margin-top: 14px; }

.skill-suggestions-label {
  font-size: 11px;
  color: #4a7a6a;
  display: block;
  margin-bottom: 7px;
}

.skill-suggestions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag-btn {
  background: #0D2B2B;
  border: 1px solid #2a4a4a;
  border-radius: 20px;
  padding: 4px 11px;
  font-size: 12px;
  color: #6b9a8a;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.skill-tag-btn:hover,
.skill-tag-btn.active {
  border-color: #5C8C6A;
  color: #D6EDE8;
  background: #1f4040;
}

/* Footer */
.skill-modal-footer {
  display: flex;
  gap: 8px;
  padding: 18px 22px 22px;
  margin-top: 16px;
}

.skill-btn-cancel {
  flex: 1;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #2a4a4a;
  background: transparent;
  color: #6b9a8a;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.skill-btn-cancel:hover {
  background: #0D2B2B;
  color: #D6EDE8;
}

.skill-btn-submit {
  flex: 2;
  padding: 9px 14px;
  border-radius: 8px;
  border: none;
  background: #5C8C6A;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s, opacity 0.15s;
}
.skill-btn-submit:not(:disabled):hover { background: #4a7a58; }
.skill-btn-submit:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Success */
.skill-success {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 22px 18px;
  padding: 10px 14px;
  background: #0a2a1a;
  border: 1px solid #2a5a3a;
  border-radius: 8px;
  font-size: 13px;
  color: #5C8C6A;
}

.skill-fade-enter-active,
.skill-fade-leave-active { transition: opacity 0.3s; }
.skill-fade-enter-from,
.skill-fade-leave-to     { opacity: 0; }
</style>