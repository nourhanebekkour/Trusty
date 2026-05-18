<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">Trusty<span>.io</span></div>

      <p class="nav-label">Principal</p>
      <div class="nav-item"><i class="ti ti-layout-dashboard"></i> Tableau de bord</div>
      <div class="nav-item active"><i class="ti ti-briefcase"></i> Projets <span class="badge">3</span></div>
      <div class="nav-item"><i class="ti ti-building-factory"></i> Stages <span class="badge">2</span></div>
      <div class="nav-item"><i class="ti ti-calendar-event"></i> Activités</div>

      <p class="nav-label">Étudiants</p>
      <div class="nav-item"><i class="ti ti-users"></i> Mes étudiants</div>
      <div class="nav-item"><i class="ti ti-file-certificate"></i> Lettres de rec.</div>
      <div class="nav-item"><i class="ti ti-star"></i> Recommandations</div>

      <p class="nav-label">Gestion</p>
      <div class="nav-item"><i class="ti ti-bell"></i> Notifications <span class="badge">4</span></div>
      <div class="nav-item"><i class="ti ti-settings"></i> Paramètres</div>

      <div class="sidebar-footer">
        <div class="avatar-sm">MP</div>
        <div>
          <div class="prof-name">M. Professeur</div>
          <div class="prof-dept">Informatique</div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <!-- TOPBAR -->
      <div class="topbar">
        <div>
          <h1 class="page-title">Projets à valider</h1>
          <p class="page-sub">Gérez et évaluez les soumissions étudiantes</p>
        </div>
        <div class="prof-chip">
          <div class="avatar-sm">MP</div>
          M. Professeur &nbsp;·&nbsp; Dept. Informatique
        </div>
      </div>

      <!-- STATS -->
      <div class="stats-row">
        <div class="stat-card active">
          <div class="stat-label">En attente</div>
          <div class="stat-value">3</div>
          <div class="stat-sub"><span class="dot warn"></span>Nécessitent action</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Validés</div>
          <div class="stat-value">12</div>
          <div class="stat-sub"><span class="dot ok"></span>Ce semestre</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Étudiants suivis</div>
          <div class="stat-value">8</div>
          <div class="stat-sub"><span class="dot blue"></span>Actifs</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Stages en cours</div>
          <div class="stat-value">2</div>
          <div class="stat-sub"><span class="dot pink"></span>À superviser</div>
        </div>
      </div>

      <!-- COLUMNS -->
      <div class="columns">
        <!-- LEFT -->
        <div class="left-col">
          <!-- PROJETS -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-clipboard-check"></i> Éléments à valider</div>
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
              v-for="projet in projets"
              :key="projet.id"
              class="proj-item"
            >
              <div class="proj-icon" :class="projet.color">
                <i :class="'ti ti-' + projet.icon"></i>
              </div>
              <div class="proj-info">
                <div class="proj-name">{{ projet.nom }}</div>
                <div class="proj-meta">{{ projet.etudiant }} · {{ projet.context }} · {{ projet.date }}</div>
                <div class="proj-desc">{{ projet.description }}</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: projet.progress + '%', background: projet.statusColor }"></div>
                </div>
              </div>
              <div class="proj-right">
                <span class="status-pill" :class="'pill-' + projet.status">
                  {{ projet.statusLabel }}
                </span>
                <button v-if="projet.status === 'pending'" class="btn-primary btn-sm" @click="validerProjet(projet)">
                  Valider
                </button>
                <button v-if="projet.status === 'valide'" class="btn-ghost btn-sm ok-border">
                  Certifier
                </button>
                <button class="btn-ghost btn-sm">Détails</button>
              </div>
            </div>
          </div>

          <!-- LETTRES DE RECOMMANDATION -->
          <div class="card" style="margin-top: 20px;">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-file-certificate"></i> Lettres de recommandation</div>
              <div class="card-action"><i class="ti ti-plus"></i> Nouvelle</div>
            </div>

            <div v-for="lettre in lettres" :key="lettre.id" class="notif-item">
              <span class="notif-dot" :style="{ background: lettre.color }"></span>
              <div class="notif-content">
                <div class="notif-text">
                  <strong>{{ lettre.etudiant }}</strong> {{ lettre.message }}
                </div>
                <div class="notif-time">{{ lettre.time }} · {{ lettre.formation }}</div>
              </div>
              <button
                class="btn-sm"
                :class="lettre.urgent ? 'btn-warn' : 'btn-primary'"
                style="margin-left: auto; flex-shrink: 0;"
              >
                {{ lettre.action }}
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="right-col">
          <!-- ÉTUDIANTS -->
          <div class="card">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-users"></i> Mes étudiants</div>
              <div class="card-action">Voir tous <i class="ti ti-arrow-right"></i></div>
            </div>
            <div v-for="etudiant in etudiants" :key="etudiant.id" class="student-row">
              <div class="avatar-sm" :style="{ background: etudiant.gradient }">{{ etudiant.initiales }}</div>
              <div>
                <div class="stud-name">{{ etudiant.nom }}</div>
                <div class="stud-sub">{{ etudiant.formation }}</div>
              </div>
              <div class="stud-score" :class="etudiant.score >= 80 ? 'ok' : 'warn'">
                {{ etudiant.score }}
              </div>
            </div>
          </div>

          <!-- STAGES -->
          <div class="card" style="margin-top: 20px;">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-building-factory"></i> Stages supervisés</div>
            </div>
            <div v-for="(stage, i) in stages" :key="stage.id">
              <div style="margin-bottom: 14px;">
                <div class="stage-row">
                  <div class="stage-name">{{ stage.entreprise }}</div>
                  <span class="status-pill" :class="'pill-' + stage.status">{{ stage.statusLabel }}</span>
                </div>
                <div class="notif-time" style="margin-bottom: 6px;">{{ stage.etudiant }} · {{ stage.role }} · {{ stage.dates }}</div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: stage.progress + '%', background: stage.color }"></div>
                </div>
                <div class="notif-time" style="margin-top: 4px;">{{ stage.progress }}% · {{ stage.note }}</div>
              </div>
              <hr v-if="i < stages.length - 1" class="divider" />
            </div>
          </div>

          <!-- ACTIVITÉ RÉCENTE -->
          <div class="card" style="margin-top: 20px;">
            <div class="card-header">
              <div class="card-title"><i class="ti ti-bell"></i> Activité récente</div>
            </div>
            <div v-for="notif in notifications" :key="notif.id" class="notif-item" :class="{ 'no-border': notif.last }">
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
import { ref } from 'vue'

const activeTab = ref('Projets')
const tabs = ['Projets', 'Stages', 'Activités']

const projets = ref([
  {
    id: 1,
    nom: 'Cloud Scale API',
    etudiant: 'Thomas Bernard',
    context: 'Projet académique',
    date: 'Soumis il y a 2j',
    description: 'Infrastructure microservices, Docker & Kubernetes — 10k req/s',
    icon: 'api',
    color: 'blue',
    progress: 100,
    statusColor: '#f4b94b',
    status: 'pending',
    statusLabel: 'En attente',
  },
  {
    id: 2,
    nom: 'Développeur Fullstack',
    etudiant: 'Léa Martin',
    context: 'TechCorp Paris',
    date: 'Juin–Déc 2023',
    description: 'Dashboard monitoring industriel — React & Go',
    icon: 'device-laptop',
    color: 'teal',
    progress: 65,
    statusColor: '#f4b94b',
    status: 'pending',
    statusLabel: 'En attente',
  },
  {
    id: 3,
    nom: "Algorithme d'Optimisation",
    etudiant: 'Alexandre Gauthier',
    context: 'Hackathon',
    date: 'Mars 2023',
    description: 'Algorithme génétique — logistique urbaine',
    icon: 'math-function',
    color: 'amber',
    progress: 45,
    statusColor: '#f4b94b',
    status: 'pending',
    statusLabel: 'En attente',
  },
  {
    id: 4,
    nom: "Système de Recommandation IA",
    etudiant: 'Sophie Durand',
    context: 'Projet M1',
    date: 'Jan 2024',
    description: 'NLP — filtrage collaboratif hybride',
    icon: 'robot',
    color: 'pink',
    progress: 100,
    statusColor: '#66c99f',
    status: 'valide',
    statusLabel: 'Validé',
  },
])

const lettres = ref([
  {
    id: 1,
    etudiant: 'Thomas Bernard',
    message: 'a demandé une lettre pour son stage chez AWS Paris',
    time: 'Il y a 3 heures',
    formation: 'Master 2 Ingénierie Logicielle',
    color: '#66c99f',
    action: 'Rédiger',
    urgent: false,
  },
  {
    id: 2,
    etudiant: 'Léa Martin',
    message: 'a soumis une demande de certification officielle de portfolio',
    time: 'Hier',
    formation: 'Licence Design Numérique',
    color: '#85B7EB',
    action: 'Signer',
    urgent: false,
  },
  {
    id: 3,
    etudiant: 'Alex Gauthier',
    message: 'lettre en attente de signature depuis 5 jours',
    time: '5 jours',
    formation: 'DUT Paris-Saclay',
    color: '#f4b94b',
    action: 'Urgence',
    urgent: true,
  },
])

const etudiants = ref([
  { id: 1, nom: 'Thomas Bernard', initiales: 'TB', formation: 'M2 Ingénierie Logicielle', score: 88, gradient: 'linear-gradient(135deg, #378ADD, #85B7EB)' },
  { id: 2, nom: 'Léa Martin', initiales: 'LM', formation: 'Licence Design Numérique', score: 94, gradient: 'linear-gradient(135deg, #D4537E, #ED93B1)' },
  { id: 3, nom: 'Alexandre Gauthier', initiales: 'AG', formation: 'DUT Paris-Saclay', score: 62, gradient: 'linear-gradient(135deg, #1D9E75, #5DCAA5)' },
  { id: 4, nom: 'Sophie Durand', initiales: 'SD', formation: 'Master 1 IA', score: 77, gradient: 'linear-gradient(135deg, #BA7517, #EF9F27)' },
])

const stages = ref([
  {
    id: 1,
    entreprise: 'TechCorp Paris',
    etudiant: 'Léa Martin',
    role: 'Dev. Fullstack',
    dates: 'Juin–Déc 2023',
    progress: 70,
    color: '#66c99f',
    status: 'valide',
    statusLabel: 'En cours',
    note: 'Rapport intermédiaire reçu',
  },
  {
    id: 2,
    entreprise: 'Startup DataViz',
    etudiant: 'Thomas Bernard',
    role: 'Data Engineer',
    dates: 'Jan–Juil 2024',
    progress: 30,
    color: '#f4b94b',
    status: 'pending',
    statusLabel: 'Attente rapport',
    note: 'Rapport final attendu sous 2 semaines',
  },
])

const notifications = ref([
  { id: 1, nom: 'Thomas B.', message: 'a soumis son portfolio complet', time: 'Il y a 1h', color: '#66c99f' },
  { id: 2, nom: 'Léa M.', message: 'a ajouté 2 nouvelles compétences', time: 'Il y a 3h', color: '#85B7EB' },
  { id: 3, nom: 'Alex G.', message: "n'a pas remis son rapport de stage", time: 'Hier', color: '#f4b94b' },
  { id: 4, nom: 'Sophie D.', message: 'a demandé une extension de délai', time: 'Il y a 2j', color: '#a0b4ae', last: true },
])

function validerProjet(projet) {
  projet.status = 'valide'
  projet.statusLabel = 'Validé'
  projet.progress = 100
  projet.statusColor = '#66c99f'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --bg: #0D2B2B;
  --surface: #1A3838;
  --accent: #D6EDE8;
  --accent2: #a8d4cc;
  --text: #ffffff;
  --muted: #a0b4ae;
  --border: rgba(214,237,232,0.12);
  --border2: rgba(214,237,232,0.22);
  --ok: #66c99f;
  --warn: #f4b94b;
  --danger: #e57373;
}

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
  cursor: pointer;
  transition: border-color 0.15s;
}
.stat-card:hover { border-color: rgba(214,237,232,0.22); }
.stat-card.active {
  border-color: #D6EDE8;
  background: rgba(214,237,232,0.06);
}

.stat-label {
  font-size: 11px;
  color: #a0b4ae;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}
.stat-sub { font-size: 11px; color: #a0b4ae; margin-top: 4px; }

.dot {
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
.dot.ok { background: #66c99f; }
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
.card-action {
  font-size: 12px;
  color: #a0b4ae;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-action:hover { color: #D6EDE8; }

/* ── TABS ── */
.tab-row {
  display: flex;
  gap: 0;
  border-bottom: none;
}
.tab {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: #a0b4ae;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.tab.active { color: #D6EDE8; border-bottom-color: #D6EDE8; }
.tab:hover { color: #a8d4cc; }

/* ── PROJET ITEM ── */
.proj-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(214,237,232,0.12);
  transition: padding-left 0.15s;
  cursor: pointer;
}
.proj-item:last-child { border-bottom: none; padding-bottom: 0; }
.proj-item:hover { padding-left: 4px; }

.proj-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.proj-icon.blue { background: rgba(55,138,221,0.15); color: #85B7EB; }
.proj-icon.teal { background: rgba(29,158,117,0.15); color: #5DCAA5; }
.proj-icon.amber { background: rgba(239,159,39,0.15); color: #EF9F27; }
.proj-icon.pink { background: rgba(212,83,126,0.15); color: #ED93B1; }

.proj-info { flex: 1; min-width: 0; }
.proj-name { font-size: 13px; font-weight: 500; color: #ffffff; margin-bottom: 3px; }
.proj-meta { font-size: 11px; color: #a0b4ae; line-height: 1.5; }
.proj-desc { font-size: 11px; color: #a8d4cc; margin-top: 4px; }

.progress-bar {
  height: 4px;
  background: rgba(214,237,232,0.06);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
  width: 80%;
}
.progress-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }

.proj-right {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

/* ── STATUS PILLS ── */
.status-pill {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 9px;
  border-radius: 20px;
}
.pill-pending { background: rgba(244,185,75,0.15); color: #f4b94b; border: 1px solid rgba(244,185,75,0.3); }
.pill-valide { background: rgba(102,201,159,0.15); color: #66c99f; border: 1px solid rgba(102,201,159,0.3); }
.pill-refus { background: rgba(229,115,115,0.12); color: #e57373; border: 1px solid rgba(229,115,115,0.3); }

/* ── BUTTONS ── */
.btn-sm {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 7px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
  border: none;
  background: var(--olive);
}
.btn-primary { background: #D6EDE8; color: #0D2B2B; font-weight: 700; }
.btn-primary:hover { opacity: 0.85; }
.btn-ghost {
  background: transparent;
  color: #a0b4ae;
  border: 1px solid rgba(214,237,232,0.22);
}
.btn-ghost:hover { color: #D6EDE8; border-color: #D6EDE8; }
.btn-ghost.ok-border { color: #66c99f; border-color: rgba(102,201,159,0.3); }
.btn-warn { background: #f4b94b; color: #0D2B2B; font-weight: 700; }

/* ── AVATAR ── */
.avatar-sm {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2e6d6d, #D6EDE8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #0D2B2B;
  flex-shrink: 0;
}

/* ── STUDENTS ── */
.student-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(214,237,232,0.12);
  cursor: pointer;
}
.student-row:last-child { border-bottom: none; }
.student-row:hover .stud-name { color: #D6EDE8; }

.stud-name { font-size: 13px; font-weight: 500; color: #ffffff; }
.stud-sub { font-size: 11px; color: #a0b4ae; }
.stud-score {
  margin-left: auto;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.stud-score.ok { color: #66c99f; }
.stud-score.warn { color: #f4b94b; }

/* ── STAGES ── */
.stage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.stage-name { font-size: 12px; font-weight: 500; color: #ffffff; }

/* ── NOTIFICATIONS ── */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(214,237,232,0.12);
  font-size: 12px;
}
.notif-item.no-border { border-bottom: none; }
.notif-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.notif-content { flex: 1; }
.notif-text { color: #a0b4ae; line-height: 1.5; }
.notif-text strong { color: #a8d4cc; }
.notif-time { font-size: 10px; color: #5d7a74; margin-top: 2px; }

.divider {
  border: none;
  border-top: 1px solid rgba(214,237,232,0.12);
  margin: 8px 0;
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(214,237,232,0.22); border-radius: 4px; }
</style>
