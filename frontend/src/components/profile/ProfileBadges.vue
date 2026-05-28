<template>
  <div class="card">
    <div class="section-header">
      <h3>Badges Certifiés</h3>
      <span class="badge-count" v-if="badges.length">{{ badges.length }}</span>
    </div>

    <div class="badges-grid" v-if="badges.length">
      <div class="badge-card" v-for="eb in badges" :key="eb.badge.id_badge">
        <div class="badge-icon-wrap" :style="{ background: categoryColor(eb.badge.categorie).bg }">
          <span>{{ eb.badge.icone ?? '🏅' }}</span>
        </div>
        <div class="badge-info">
          <p class="badge-title">{{ eb.badge.nom }}</p>
          <p class="badge-cat" :style="{ color: categoryColor(eb.badge.categorie).text }">
            {{ eb.badge.categorie }}
          </p>
          <p class="badge-year">{{ formatDate(eb.date_attribution) }}</p>
        </div>
      </div>
    </div>

    <div class="empty-badges" v-else>
      <span class="empty-icon">🏅</span>
      <p>Aucun badge certifié pour l'instant.</p>
      <p class="empty-sub">Complétez vos projets et activités pour en obtenir.</p>
    </div>

    <div class="generate-box">
      <div class="gen-left">
        <div class="gen-icon">✨</div>
        <div>
          <h4>Générer mon portfolio</h4>
          <p>Créez un portfolio professionnel certifié à partir de vos projets et badges validés.</p>
        </div>
      </div>
      <button class="btn-portfolio" @click="router.push('/portfolio')">
        Lancer →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props  = defineProps({ user: Object })
const router = useRouter()

const badges = computed(() => props.user.etudiant?.badges ?? [])

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const CATEGORY_COLORS = {
  Projet:    { bg: '#eef2ff', text: '#6366f1' },
  Stage:     { bg: '#f0fdf4', text: '#16a34a' },
  Activite:  { bg: '#fff7ed', text: '#ea580c' },
  Technique: { bg: '#eff6ff', text: '#2563eb' },
  default:   { bg: '#f3f4f6', text: '#6b7280' },
}

const categoryColor = (cat) =>
  CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default
</script>

<style scoped>
@import '@/assets/profile.css';

.badge-count {
  background: #6366f1;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.badge-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  transition: box-shadow .15s;
}
.badge-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }

.badge-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.badge-info { min-width: 0; }
.badge-title {
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-cat {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  margin: 0 0 1px;
}
.badge-year { font-size: 10px; color: #9ca3af; margin: 0; }

/* Empty */
.empty-badges {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 0;
  color: #9ca3af;
  font-size: 13px;
}
.empty-icon { font-size: 32px; }
.empty-sub  { font-size: 11px; }

/* Generate box */
.generate-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(135deg, #eef2ff 0%, #5C8C6A 100%);
  border: 1px solid #5C8C6A;
  border-radius: 10px;
  padding: 14px 16px;
  margin-top: 4px;
}
.gen-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.gen-icon { font-size: 24px; flex-shrink: 0; }
.generate-box h4 {
  font-size: 13px;
  font-weight: 700;
  color: #3730a3;
  margin: 0 0 2px;
}
.generate-box p {
  font-size: 11px;
  color: #6366f1;
  margin: 0;
  line-height: 1.4;
}
.btn-portfolio {
  flex-shrink: 0;
  padding: 8px 16px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
  white-space: nowrap;
}
.btn-portfolio:hover { background: #4f46e5; }
</style>