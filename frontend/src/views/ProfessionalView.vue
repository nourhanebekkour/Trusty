<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">Trusty<span>.io</span></div>

      <p class="nav-label">Principal</p>
      <div class="nav-item"><i class="ti ti-layout-dashboard"></i> Tableau de bord</div>
      <div class="nav-item active"><i class="ti ti-users-group"></i> Explorer <span class="badge">24</span></div>
      <div class="nav-item"><i class="ti ti-bookmark"></i> Favoris <span class="badge">5</span></div>

      <p class="nav-label">Recommandations</p>
      <div class="nav-item"><i class="ti ti-message-star"></i> Mes recommandations <span class="badge">{{ totalRecs }}</span></div>
      <div class="nav-item"><i class="ti ti-history"></i> Historique</div>

      <p class="nav-label">Gestion</p>
      <div class="nav-item"><i class="ti ti-bell"></i> Notifications <span class="badge">3</span></div>
      <div class="nav-item"><i class="ti ti-settings"></i> Paramètres</div>

      <div class="sidebar-footer">
        <div class="avatar-sm">DT</div>
        <div>
          <div class="prof-name">DataTech SAS</div>
          <div class="prof-dept">Professionnel vérifié</div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <!-- TOPBAR -->
      <div class="topbar">
        <div>
          <h1 class="page-title">Portfolios à recommander</h1>
          <p class="page-sub">Émettez des recommandations professionnelles pour les étudiants</p>
        </div>
        <div class="prof-chip">
          <div class="avatar-sm">DT</div>
          DataTech SAS &nbsp;·&nbsp; Professionnel vérifié
        </div>
      </div>

      <!-- STATS -->
      <div class="stats-row">
        <div class="stat-card active">
          <div class="stat-label">En attente</div>
          <div class="stat-value">{{ candidatsEnAttente }}</div>
          <div class="stat-sub"><span class="dot warn"></span>Nécessitent attention</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Recommandations émises</div>
          <div class="stat-value">{{ totalRecs }}</div>
          <div class="stat-sub"><span class="dot ok"></span>Ce mois</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Portfolios consultés</div>
          <div class="stat-value">{{ statsActivite.consultes }}</div>
          <div class="stat-sub"><span class="dot blue"></span>Actifs</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Favoris sauvés</div>
          <div class="stat-value">{{ favoris.length }}</div>
          <div class="stat-sub"><span class="dot pink"></span>En suivi</div>
        </div>
      </div>

      <!-- COLUMNS -->
      <div class="columns">
        <!-- LEFT -->
        <div class="left-col">
          <!-- LISTE CANDIDATS -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-message-star"></i> Éléments à recommander</div>
              <div class="tab-row">
                <div
                  v-for="tab in tabs"
                  :key="tab"
                  class="tab"
                  :class="{ active: activeTab === tab }"
                  @click="activeTab = tab"
                >{{ tab }}</div>
              </div>
            </div>

            <div
              v-for="candidat in candidatsFiltres"
              :key="candidat.id"
              class="proj-item"
              :class="{ 'selected-row': selectedId === candidat.id }"
              @click="selectCandidat(candidat)"
            >
              <div class="proj-icon" :class="candidat.color">
                <i :class="'ti ti-' + candidat.icon"></i>
              </div>
              <div class="proj-info">
                <div class="proj-name">{{ candidat.nom }}</div>
                <div class="proj-meta">{{ candidat.formation }} · {{ candidat.ecole }} · {{ candidat.ville }}</div>
                <div class="proj-desc">{{ candidat.description }}</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: candidat.score + '%', background: candidat.score >= 80 ? '#66c99f' : '#f4b94b' }"></div>
                </div>
              </div>
              <div class="proj-right">
                <span class="status-pill" :class="aRecommande(candidat.id) ? 'pill-valide' : 'pill-pending'">
                  {{ aRecommande(candidat.id) ? 'Recommandé' : 'En attente' }}
                </span>
                <button
                  v-if="!aRecommande(candidat.id)"
                  class="btn-primary btn-sm"
                  @click.stop="ouvrirFormulaire(candidat)"
                >
                  Recommander
                </button>
                <button
                  v-else
                  class="btn-ghost btn-sm ok-border"
                  @click.stop="ouvrirFormulaire(candidat)"
                >
                  <i class="ti ti-plus" style="font-size:10px;"></i> Ajouter
                </button>
                <button class="btn-ghost btn-sm" @click.stop="selectCandidat(candidat)">Détails</button>
              </div>
            </div>
          </div>

          <!-- FORMULAIRE RECOMMANDATION -->
          <div class="card rec-form-card" v-if="selectedCandidat" style="margin-top: 20px;">
            <div class="card-header">
              <div class="card-title">
                <i class="ti ti-quote"></i> Recommandation pour
                <span class="rec-for-name">{{ selectedCandidat.nom }}</span>
              </div>
              <div class="card-action" @click="selectedCandidat = null">
                <i class="ti ti-x"></i> Fermer
              </div>
            </div>

            <div class="rec-type-row">
              <div
                class="rec-type-card"
                :class="{ active: recType === 'rapide' }"
                @click="recType = 'rapide'"
              >
                <i class="ti ti-zap"></i>
                <div>
                  <div class="rec-type-title">Repas Rapide (Flux interne)</div>
                  <div class="rec-type-sub">Court commentaire partagé sur votre flux</div>
                </div>
              </div>
              <div
                class="rec-type-card"
                :class="{ active: recType === 'officielle' }"
                @click="recType = 'officielle'"
              >
                <i class="ti ti-certificate"></i>
                <div>
                  <div class="rec-type-title">Recommandation Officielle (Citation)</div>
                  <div class="rec-type-sub">Recommandation formelle épinglée sur le portfolio</div>
                </div>
              </div>
            </div>

            <textarea
              v-model="recTexte"
              class="rec-textarea"
              :placeholder="recType === 'rapide'
                ? 'Ajoutez un court commentaire professionnel sur ce candidat...'
                : 'Rédigez une recommandation formelle qui sera épinglée sur le portfolio de l\'étudiant...'"
              rows="4"
            ></textarea>

            <div class="rec-form-footer">
              <span class="rec-form-hint">
                <i class="ti ti-info-circle"></i>
                {{ recType === 'officielle' ? 'Sera visible sur le portfolio · Signé & certifié par votre organisation' : 'Partagé sur votre flux professionnel interne' }}
              </span>
              <span class="rec-char-count" :class="{ warn: recTexte.length > 400 }">
                {{ recTexte.length }}/500
              </span>
            </div>

            <div class="action-bar-form">
              <button
                class="btn-primary btn-action"
                :disabled="!recTexte.trim() || recTexte.length > 500"
                @click="envoyerRecommandation"
              >
                <i class="ti ti-send"></i>
                {{ recType === 'rapide' ? 'Partager sur mon flux' : 'Signer & Certifier' }}
              </button>
              <button class="btn-ghost btn-action" @click="selectedCandidat = null">
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="right-col">
          <!-- CANDIDATS FAVORIS -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-bookmark"></i> Candidats suivis</div>
              <div class="card-action">Voir tous <i class="ti ti-arrow-right"></i></div>
            </div>
            <div v-for="c in candidatsFavoris" :key="c.id" class="student-row" @click="selectCandidat(c)">
              <div class="avatar-sm" :style="{ background: c.gradient }">{{ c.initiales }}</div>
              <div>
                <div class="stud-name">{{ c.nom }}</div>
                <div class="stud-sub">{{ c.formation }}</div>
              </div>
              <div class="stud-score" :class="c.score >= 80 ? 'ok' : 'warn'">{{ c.score }}</div>
            </div>
            <div v-if="candidatsFavoris.length === 0" class="empty-state">
              Aucun favori pour le moment
            </div>
          </div>

          <!-- RECOMMANDATIONS RÉCENTES -->
          <div class="card" style="margin-top: 20px;">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-message-star"></i> Recommandations émises</div>
            </div>
            <div v-if="recsEmises.length === 0" class="empty-state">
              Aucune recommandation émise
            </div>
            <div
              v-for="(rec, i) in recsEmises"
              :key="i"
              class="notif-item"
              :class="{ 'no-border': i === recsEmises.length - 1 }"
            >
              <div class="avatar-sm" :style="{ background: rec.gradient }">{{ rec.initiales }}</div>
              <div class="notif-content">
                <div class="notif-text">
                  <strong>{{ rec.nom }}</strong>
                  <span class="rec-type-badge" :class="rec.type === 'officielle' ? 'badge-cert' : 'badge-rapide'">
                    {{ rec.type === 'officielle' ? 'Officielle' : 'Rapide' }}
                  </span>
                </div>
                <div class="notif-time">{{ rec.extrait }}</div>
                <div class="notif-time">{{ rec.date }}</div>
              </div>
            </div>
          </div>

          <!-- ACTIVITÉ RÉCENTE -->
          <div class="card" style="margin-top: 20px;">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-bell"></i> Activité récente</div>
            </div>
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="notif-item"
              :class="{ 'no-border': notif.last }"
            >
              <span class="notif-dot" :style="{ background: notif.color }"></span>
              <div>
                <div class="notif-text"><strong>{{ notif.nom }}</strong> {{ notif.message }}</div>
                <div class="notif-time">{{ notif.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('Portfolios')
const tabs = ['Portfolios', 'Stages', 'Activités']
const selectedId = ref(null)
const selectedCandidat = ref(null)
const recTexte = ref('')
const recType = ref('officielle')
const favoris = ref([2])
const statsActivite = ref({ consultes: 24 })

const candidats = ref([
  {
    id: 1,
    nom: 'Thomas Bernard',
    initiales: 'TB',
    formation: 'M2 Ingénierie Logicielle',
    ecole: 'Sorbonne',
    score: 88,
    gradient: 'linear-gradient(135deg, #378ADD, #85B7EB)',
    ville: 'Paris',
    icon: 'device-laptop',
    color: 'blue',
    description: 'Architecture cloud, Docker & K8s — 3 projets majeurs validés, stage TechCorp Paris.',
  },
  {
    id: 2,
    nom: 'Léa Martin',
    initiales: 'LM',
    formation: 'Licence Design Numérique',
    ecole: 'Paris 8',
    score: 94,
    gradient: 'linear-gradient(135deg, #D4537E, #ED93B1)',
    ville: 'Lyon',
    icon: 'pencil',
    color: 'pink',
    description: 'Spécialiste UX/UI · Dashboard industriel React · Figma expert.',
  },
  {
    id: 3,
    nom: 'Alexandre Gauthier',
    initiales: 'AG',
    formation: 'DUT Informatique',
    ecole: 'Paris-Saclay',
    score: 62,
    gradient: 'linear-gradient(135deg, #1D9E75, #5DCAA5)',
    ville: 'Gif-sur-Yvette',
    icon: 'math-function',
    color: 'teal',
    description: 'Algorithme génétique logistique urbaine — Hackathon 2023.',
  },
  {
    id: 4,
    nom: 'Sophie Durand',
    initiales: 'SD',
    formation: 'Master 1 IA',
    ecole: 'Paris-Saclay',
    score: 77,
    gradient: 'linear-gradient(135deg, #BA7517, #EF9F27)',
    ville: 'Gif-sur-Yvette',
    icon: 'robot',
    color: 'amber',
    description: 'Systèmes de recommandation NLP · Filtrage hybride · Projet M1 distingué.',
  },
])

const recsEmises = ref([])

const notifications = ref([
  { id: 1, nom: 'Thomas Bernard', message: 'a consulté votre offre DataTech', time: 'Il y a 30 min', color: '#66c99f' },
  { id: 2, nom: 'Léa Martin', message: 'a accepté votre contact', time: 'Il y a 2h', color: '#85B7EB' },
  { id: 3, nom: '', message: '3 nouveaux portfolios certifiés correspondent à vos critères', time: "Aujourd'hui", color: '#a0b4ae', last: true },
])

const candidatsFiltres = computed(() => candidats.value)
const candidatsFavoris = computed(() => candidats.value.filter(c => favoris.value.includes(c.id)))
const totalRecs = computed(() => recsEmises.value.length)
const candidatsEnAttente = computed(() => candidats.value.filter(c => !aRecommande(c.id)).length)

function aRecommande(id) {
  return recsEmises.value.some(r => r.candidatId === id)
}

function selectCandidat(candidat) {
  selectedId.value = candidat.id
  selectedCandidat.value = candidat
  recTexte.value = ''
  recType.value = 'officielle'
  statsActivite.value.consultes++
}

function ouvrirFormulaire(candidat) {
  selectedId.value = candidat.id
  selectedCandidat.value = candidat
  recTexte.value = ''
  recType.value = 'officielle'
}

function envoyerRecommandation() {
  if (!recTexte.value.trim() || recTexte.value.length > 500) return
  const now = new Date()
  const mois = now.toLocaleString('fr-FR', { month: 'long' })
  const annee = now.getFullYear()
  recsEmises.value.unshift({
    candidatId: selectedCandidat.value.id,
    nom: selectedCandidat.value.nom,
    initiales: selectedCandidat.value.initiales,
    gradient: selectedCandidat.value.gradient,
    type: recType.value,
    extrait: recTexte.value.length > 60 ? recTexte.value.slice(0, 60) + '…' : recTexte.value,
    date: `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`,
  })
  notifications.value.unshift({
    id: Date.now(),
    nom: 'DataTech SAS',
    message: `a émis une recommandation ${recType.value === 'officielle' ? 'officielle' : 'rapide'} pour ${selectedCandidat.value.nom}`,
    time: "À l'instant",
    color: '#66c99f',
  })
  recTexte.value = ''
  selectedCandidat.value = null
  selectedId.value = null
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.layout {
  display: flex;
  height: 100vh;
  background: #0D2B2B;
  color: #ffffff;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #1A3838;
  border-right: 1px solid rgba(214,237,232,0.12);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 4px;
}
.logo {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #D6EDE8;
  letter-spacing: -0.5px;
  margin-bottom: 24px;
  padding-left: 4px;
}
.logo span { color: #a0b4ae; font-weight: 400; }
.nav-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #a0b4ae;
  padding: 10px 4px 4px;
  margin: 0;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #a0b4ae;
  transition: all 0.15s;
  border: 1px solid transparent;
}
.nav-item i { font-size: 16px; }
.nav-item:hover { background: rgba(214,237,232,0.06); color: #D6EDE8; }
.nav-item.active {
  background: rgba(214,237,232,0.10);
  color: #D6EDE8;
  border-color: rgba(214,237,232,0.22);
  font-weight: 500;
}
.badge {
  margin-left: auto;
  background: #D6EDE8;
  color: #0D2B2B;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
}
.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(214,237,232,0.12);
  display: flex;
  align-items: center;
  gap: 10px;
}
.prof-name { font-size: 12px; color: #a8d4cc; }
.prof-dept { font-size: 10px; color: #a0b4ae; }

/* ── MAIN ── */
.main { flex: 1; overflow-y: auto; padding: 32px; }

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
}
.page-sub { color: #a0b4ae; font-size: 13px; margin-top: 2px; }
.prof-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1A3838;
  border: 1px solid rgba(214,237,232,0.22);
  border-radius: 40px;
  padding: 6px 14px 6px 8px;
  font-size: 13px;
  color: #a8d4cc;
}

/* ── STATS ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}
.stat-card {
  background: #1A3838;
  border: 1px solid rgba(214,237,232,0.12);
  border-radius: 12px;
  padding: 18px 20px;
  transition: border-color 0.15s;
}
.stat-card:hover { border-color: rgba(214,237,232,0.22); }
.stat-card.active { border-color: #D6EDE8; background: rgba(214,237,232,0.06); }
.stat-label { font-size: 11px; color: #a0b4ae; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: #ffffff; line-height: 1; }
.stat-sub { font-size: 11px; color: #a0b4ae; margin-top: 4px; }
.dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
.dot.ok   { background: #66c99f; }
.dot.warn { background: #f4b94b; }
.dot.blue { background: #85B7EB; }
.dot.pink { background: #ED93B1; }

/* ── COLUMNS ── */
.columns { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.left-col, .right-col { display: flex; flex-direction: column; }

/* ── CARD ── */
.card {
  background: #1A3838;
  border: 1px solid rgba(214,237,232,0.12);
  border-radius: 14px;
  padding: 22px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.card-title {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #D6EDE8;
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-action { font-size: 12px; color: #a0b4ae; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.card-action:hover { color: #D6EDE8; }

/* ── TABS ── */
.tab-row { display: flex; gap: 0; }
.tab { padding: 6px 14px; font-size: 12px; font-weight: 500; color: #a0b4ae; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.tab.active { color: #D6EDE8; border-bottom-color: #D6EDE8; }
.tab:hover { color: #a8d4cc; }

/* ── PROJ ITEM ── */
.proj-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(214,237,232,0.12);
  cursor: pointer;
  transition: padding-left 0.15s;
}
.proj-item:last-child { border-bottom: none; padding-bottom: 0; }
.proj-item:hover { padding-left: 4px; }
.proj-item.selected-row { background: rgba(214,237,232,0.04); border-radius: 8px; padding-left: 8px; }

.proj-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.proj-icon.blue  { background: rgba(55,138,221,0.15);  color: #85B7EB; }
.proj-icon.teal  { background: rgba(29,158,117,0.15);  color: #5DCAA5; }
.proj-icon.amber { background: rgba(239,159,39,0.15);  color: #EF9F27; }
.proj-icon.pink  { background: rgba(212,83,126,0.15);  color: #ED93B1; }

.proj-info { flex: 1; min-width: 0; }
.proj-name { font-size: 13px; font-weight: 500; color: #ffffff; margin-bottom: 3px; }
.proj-meta { font-size: 11px; color: #a0b4ae; line-height: 1.5; }
.proj-desc { font-size: 11px; color: #a8d4cc; margin-top: 4px; }

.progress-bar { height: 4px; background: rgba(214,237,232,0.06); border-radius: 4px; overflow: hidden; margin-top: 8px; width: 80%; }
.progress-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }

.proj-right { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }

/* ── STATUS PILLS ── */
.status-pill { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 9px; border-radius: 20px; }
.pill-pending { background: rgba(244,185,75,0.15);  color: #f4b94b; border: 1px solid rgba(244,185,75,0.3); }
.pill-valide  { background: rgba(102,201,159,0.15); color: #66c99f; border: 1px solid rgba(102,201,159,0.3); }

/* ── FORMULAIRE ── */
.rec-form-card { border-color: rgba(214,237,232,0.22); }
.rec-for-name { color: #a8d4cc; }

.rec-type-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.rec-type-card { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border: 1px solid rgba(214,237,232,0.15); border-radius: 10px; cursor: pointer; transition: all 0.15s; background: rgba(214,237,232,0.03); }
.rec-type-card i { font-size: 18px; color: #a0b4ae; margin-top: 2px; flex-shrink: 0; }
.rec-type-card:hover { border-color: rgba(214,237,232,0.3); }
.rec-type-card.active { border-color: #D6EDE8; background: rgba(214,237,232,0.08); }
.rec-type-card.active i { color: #D6EDE8; }
.rec-type-title { font-size: 12px; font-weight: 500; color: #D6EDE8; margin-bottom: 3px; }
.rec-type-sub { font-size: 10px; color: #a0b4ae; line-height: 1.4; }

.rec-textarea { width: 100%; background: rgba(214,237,232,0.05); border: 1px solid rgba(214,237,232,0.18); border-radius: 10px; padding: 12px 14px; color: #ffffff; font-family: 'DM Sans', sans-serif; font-size: 12px; line-height: 1.6; resize: vertical; outline: none; transition: border-color 0.2s; display: block; min-height: 90px; }
.rec-textarea::placeholder { color: #5d7a74; }
.rec-textarea:focus { border-color: rgba(214,237,232,0.4); }

.rec-form-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; margin-bottom: 14px; }
.rec-form-hint { font-size: 10px; color: #5d7a74; display: flex; align-items: center; gap: 4px; }
.rec-form-hint i { font-size: 12px; }
.rec-char-count { font-size: 10px; color: #5d7a74; }
.rec-char-count.warn { color: #f4b94b; }

.action-bar-form { display: flex; gap: 8px; padding-top: 14px; border-top: 1px solid rgba(214,237,232,0.12); }
.btn-action { padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px; transition: all 0.15s; border: none; }
.btn-action:first-child { flex: 1; justify-content: center; }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── BUTTONS ── */
.btn-sm { font-size: 11px; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; border: none; }
.btn-primary { background: #D6EDE8; color: #0D2B2B; font-weight: 700; }
.btn-primary:hover { opacity: 0.85; }
.btn-ghost { background: transparent; color: #a0b4ae; border: 1px solid rgba(214,237,232,0.22); }
.btn-ghost:hover { color: #D6EDE8; border-color: #D6EDE8; }
.btn-ghost.ok-border { color: #66c99f; border-color: rgba(102,201,159,0.3); }

/* ── AVATAR ── */
.avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #2e6d6d, #D6EDE8); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #0D2B2B; flex-shrink: 0; }

/* ── STUDENTS ── */
.student-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(214,237,232,0.12); cursor: pointer; }
.student-row:last-child { border-bottom: none; }
.student-row:hover .stud-name { color: #D6EDE8; }
.stud-name { font-size: 13px; font-weight: 500; color: #ffffff; }
.stud-sub { font-size: 11px; color: #a0b4ae; }
.stud-score { margin-left: auto; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
.stud-score.ok { color: #66c99f; }
.stud-score.warn { color: #f4b94b; }

/* ── NOTIF ── */
.notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(214,237,232,0.12); font-size: 12px; }
.notif-item.no-border { border-bottom: none; }
.notif-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.notif-content { flex: 1; }
.notif-text { color: #a0b4ae; line-height: 1.5; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.notif-text strong { color: #a8d4cc; }
.notif-time { font-size: 10px; color: #5d7a74; margin-top: 2px; }

/* ── REC BADGES ── */
.rec-type-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 10px; }
.badge-cert   { background: rgba(102,201,159,0.15); color: #66c99f; border: 1px solid rgba(102,201,159,0.3); }
.badge-rapide { background: rgba(133,183,235,0.15); color: #85B7EB; border: 1px solid rgba(133,183,235,0.3); }

.empty-state { text-align: center; color: #a0b4ae; font-size: 13px; padding: 20px; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(214,237,232,0.22); border-radius: 4px; }
</style>