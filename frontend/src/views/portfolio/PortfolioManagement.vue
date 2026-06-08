<template>
  <div class="dashboard-page">

    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <header class="page-header">
      <div class="page-header__left">
        <div class="page-header__title">
          <h1 class="page-title">Mes Portfolios</h1>
        </div>
        <p class="page-subtitle">Gérez et publiez vos différentes versions de portfolio.</p>
      </div>
      <button class="btn btn--create" @click="openCreateModal">
        <span></span> Créer une nouvelle version
      </button>
    </header>

    <!-- ── ERROR ─────────────────────────────────────────────────── -->
    <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

    <!-- ── AUTO-GENERATED BANNER ─────────────────────────────────── -->
    <div v-if="hasAutoPortfolio" class="auto-default-banner">
      <div>
        <p class="auto-default-title">Portfolio généré automatiquement</p>
        <p class="auto-default-msg">Votre portfolio a été généré automatiquement lors de votre inscription. Personnalisez-le et publiez-le !</p>
      </div>
    </div>

    <!-- ── LOADING ────────────────────────────────────────────────── -->
    <div v-if="loading" class="loading-state">Chargement de vos portfolios...</div>

    <!-- ── PORTFOLIO GRID ────────────────────────────────────────── -->
    <div v-else class="portfolio-grid">
      <div v-for="p in portfolios" :key="p.id_portfolio" :class="['pf-card', p.isAuto && 'pf-card--auto']">

        <div class="pf-card__top">
          <div class="pf-card__meta">
            <span v-if="p.objective" :class="['obj-badge', `obj-badge--${p.objective}`]">{{ p.objective }}</span>
            <span class="tpl-label">{{ p.modele?.nom_modele }}</span>
          </div>
          <span :class="['status-badge', p.est_publie ? 'status-badge--published' : 'status-badge--draft']">
            <span class="badge__dot"></span>
            {{ p.est_publie ? 'Publié' : 'Brouillon' }}
          </span>
        </div>

        <h3 class="pf-card__title">{{ p.titre_personnalise }}</h3>

        <p v-if="p.isAuto && !p.est_publie" class="auto-portfolio-msg">Votre portfolio a été généré automatiquement. Personnalisez-le et publiez-le !</p>

        <a v-if="p.est_publie && p.url_publique" :href="`/portfolio/${p.url_publique}`" target="_blank" class="pf-card__url">
          🔗 /portfolio/{{ p.url_publique }}
        </a>

        <div class="pf-card__stats">
          <span class="stat-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ p.nombre_vues }} vues
          </span>
          <span class="stat-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ p.nombre_recommandations }} recommandations
          </span>
        </div>

        <div class="pf-card__actions">
          <button class="btn btn--ghost" @click="editPortfolio(p)">Modifier</button>
          <button class="btn btn--ghost" :disabled="!p.est_publie" @click="viewPortfolio(p)">Voir</button>
          <button
            :class="['btn', p.est_publie ? 'btn--unpublish' : 'btn--publish']"
            :disabled="publishingId === p.id_portfolio"
            @click="togglePublish(p)"
          >
            {{ publishingId === p.id_portfolio ? '...' : (p.est_publie ? 'Dépublier' : 'Publier') }}
          </button>
        </div>
      </div>

      <!-- "+" add card -->
      <button class="pf-card pf-card--add" @click="openCreateModal">
        <span class="add-card__icon">+</span>
        <span class="add-card__label">Nouvelle version</span>
      </button>
    </div>

    <!-- ── TEMPLATES DISPONIBLES ─────────────────────────────────── -->
    <section class="templates-section">
      <h2 class="templates-section__title">Templates disponibles</h2>
      <div class="tpl-showcase-grid">
        <div
          v-for="tpl in templateShowcase"
          :key="tpl.id"
          :class="['tpl-showcase-card', activeTemplate === tpl.id && 'tpl-showcase-card--active']"
        >
          <div class="tpl-showcase__preview" :style="{ background: tpl.bg }">

            <!-- Template 1: One Page — dark navy -->
            <template v-if="tpl.id === 'Template 1'">
              <div class="tpl1-hero">
                <div class="tpl1-avatar"></div>
                <div class="tpl1-lines">
                  <div class="tpl1-line tpl1-line--name"></div>
                  <div class="tpl1-line tpl1-line--sub"></div>
                  <div class="tpl1-line tpl1-line--tag"></div>
                </div>
                <div class="tpl1-score">
                  <svg viewBox="0 0 40 40" class="tpl1-score__svg">
                    <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3"/>
                    <circle cx="20" cy="20" r="14" fill="none" stroke="#5C8C6A" stroke-width="3"
                      stroke-dasharray="62 88" stroke-linecap="round" transform="rotate(-90 20 20)"/>
                    <text x="20" y="24" text-anchor="middle" fill="white" font-size="8" font-weight="bold">87</text>
                  </svg>
                </div>
              </div>
              <div class="tpl1-section-stub">
                <div class="tpl1-stub-line"></div>
                <div class="tpl1-stub-line tpl1-stub-line--short"></div>
              </div>
            </template>

            <!-- Template 2: Dashboard — light gray -->
            <template v-else-if="tpl.id === 'Template 2'">
              <div class="tpl2-layout">
                <div class="tpl2-sidebar">
                  <div class="tpl2-sidebar__dot"></div>
                  <div class="tpl2-sidebar__dot"></div>
                  <div class="tpl2-sidebar__dot"></div>
                  <div class="tpl2-sidebar__dot"></div>
                </div>
                <div class="tpl2-content">
                  <div class="tpl2-topbar"></div>
                  <div class="tpl2-cards">
                    <div class="tpl2-card"></div>
                    <div class="tpl2-card"></div>
                  </div>
                  <div class="tpl2-row"></div>
                  <div class="tpl2-row tpl2-row--short"></div>
                </div>
              </div>
            </template>

            <!-- Template 3: CV Minimaliste — white -->
            <template v-else>
              <div class="tpl3-layout">
                <div class="tpl3-avatar"></div>
                <div class="tpl3-line tpl3-line--name"></div>
                <div class="tpl3-line tpl3-line--role"></div>
                <div class="tpl3-divider"></div>
                <div class="tpl3-line tpl3-line--text"></div>
                <div class="tpl3-line tpl3-line--text tpl3-line--short"></div>
              </div>
            </template>

          </div>

          <div class="tpl-showcase__info">
            <div class="tpl-showcase__name-row">
              <span class="tpl-showcase__name">{{ tpl.name }}</span>
              <span v-if="activeTemplate === tpl.id" class="tpl-showcase__badge">Actuel</span>
            </div>
            <p class="tpl-showcase__desc">{{ tpl.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CREATE MODAL ───────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Créer un portfolio</h2>
            <button class="modal__close" @click="closeModal">✕</button>
          </div>

          <div class="modal__body">

            <div class="field">
              <label class="field__label">Titre</label>
              <input v-model="form.title" class="field__input" placeholder="ex: Portfolio DevOps" />
            </div>

            <div class="field">
              <label class="field__label">Objectif</label>
              <div class="obj-selector">
                <button
                  v-for="obj in objectives"
                  :key="obj"
                  type="button"
                  :class="['obj-option', `obj-option--${obj}`, form.objective === obj && 'obj-option--active']"
                  @click="form.objective = obj"
                >{{ obj }}</button>
              </div>
            </div>

            <div class="field">
              <label class="field__label">Template</label>
              <p v-if="!templates.length" class="field__hint">Chargement des templates...</p>
              <div v-else class="template-grid">
                <div
                  v-for="tpl in templates"
                  :key="tpl.id"
                  :class="['template-card', form.template === tpl.id && 'template-card--selected']"
                  @click="form.template = tpl.id"
                >
                  <div class="template-card__preview" :style="{ background: tpl.color }">
                    <div class="tpl-line tpl-line--title"></div>
                    <div class="tpl-line tpl-line--sub"></div>
                    <div class="tpl-line tpl-line--block"></div>
                  </div>
                  <span class="template-card__label">{{ tpl.name }}</span>
                </div>
              </div>
            </div>

          </div>

          <div class="modal__footer">
            <button class="btn btn--ghost" @click="closeModal">Annuler</button>
            <button class="btn btn--save" :disabled="saving || !form.template" @click="savePortfolio">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

// ── Static display data (ne vient pas de l'API) ──────────────────────
const TEMPLATE_COLORS = {
  'Template 1': 'linear-gradient(135deg, #1A3838 60%, #5C8C6A 100%)',
  'Template 2': 'linear-gradient(135deg, #2a2a4a 60%, #6a5c8c 100%)',
  'Template 3': 'linear-gradient(135deg, #3a2a1a 60%, #8c6a5c 100%)',
}

const templateShowcase = [
  { id: 'Template 1', name: 'One Page',       bg: '#0B1120', desc: 'Portfolio une page avec score de crédibilité et sections fluides.' },
  { id: 'Template 2', name: 'Dashboard',      bg: '#F3F4F6', desc: 'Interface tableau de bord avec navigation latérale et widgets.' },
  { id: 'Template 3', name: 'CV Minimaliste', bg: '#FFFFFF', desc: 'Design épuré façon CV, idéal pour impression PDF.' },
]

const objectives = ['WEBDEV', 'DEVOPS', 'DATA', 'CYBER']

// ── State ────────────────────────────────────────────────────────────
const portfolios   = ref([])
const apiModeles   = ref([])
const loading      = ref(false)
const saving       = ref(false)
const publishingId = ref(null)
const errorMsg     = ref('')

// ── Computed ─────────────────────────────────────────────────────────
const templates = computed(() =>
  apiModeles.value.map(m => ({
    id:    m.id_modele,
    name:  m.nom_modele,
    color: TEMPLATE_COLORS[m.nom_modele] ?? '#374151',
  }))
)

const hasAutoPortfolio = computed(() => portfolios.value.some(p => p.isAuto))

const activeTemplate = computed(() => portfolios.value[0]?.modele?.nom_modele ?? 'Template 1')

// ── Data loading ─────────────────────────────────────────────────────
async function loadPortfolios() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.get('/portfolio/me')
    portfolios.value = res.data.data ?? []
  } catch (e) {
    errorMsg.value = 'Impossible de charger vos portfolios.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadModeles() {
  try {
    const res = await api.get('/portfolio/templates')
    apiModeles.value = res.data.data ?? []
  } catch (e) {
    console.error('Impossible de charger les templates :', e)
  }
}

onMounted(() => {
  loadPortfolios()
  loadModeles()
})

// ── Modal ────────────────────────────────────────────────────────────
const showModal = ref(false)
const form = reactive({ title: '', template: '', objective: 'WEBDEV' })

function openCreateModal() {
  form.title     = ''
  form.template  = templates.value[0]?.id ?? ''
  form.objective = 'WEBDEV'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function savePortfolio() {
  if (!form.template) return
  saving.value = true
  errorMsg.value = ''
  try {
    await api.post('/portfolio/me', {
      titre_personnalise: form.title || 'Nouveau Portfolio',
      id_modele: form.template,
    })
    closeModal()
    await loadPortfolios()
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? 'Erreur lors de la création.'
    console.error(e)
  } finally {
    saving.value = false
  }
}

// ── Actions ──────────────────────────────────────────────────────────
function editPortfolio(p) {
  router.push({ name: 'portfolio-template1', params: { url_publique: p.url_publique }, query: { edit: 'true' } })
}

function viewPortfolio(p) {
  router.push({ name: 'portfolio-template1', params: { url_publique: p.url_publique } })
}

async function togglePublish(p) {
  publishingId.value = p.id_portfolio
  errorMsg.value = ''
  try {
    await api.post(`/portfolio/me/${p.id_portfolio}/publish`, {
      est_publie: !p.est_publie,
    })
    p.est_publie = !p.est_publie
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? 'Erreur lors de la publication.'
    console.error(e)
  } finally {
    publishingId.value = null
  }
}
</script>

<style scoped>
@import '@/assets/dashboard.css';

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.pf-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.18s, box-shadow 0.18s;
}
.pf-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* "+" add card */
.pf-card--add {
  background: transparent;
  border: 2px dashed var(--color-border);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  gap: 10px;
  color: var(--color-text-tertiary);
  transition: border-color 0.18s, color 0.18s, background 0.18s;
}
.pf-card--add:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
  transform: translateY(-2px);
}
.add-card__icon  { font-size: 2rem; font-weight: 300; line-height: 1; }
.add-card__label { font-size: 0.82rem; font-weight: 600; }

.pf-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.pf-card__meta { display: flex; align-items: center; gap: 8px; }
.pf-card__title { font-size: 1.05rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.pf-card__url { font-size: 0.75rem; color: var(--color-accent); text-decoration: none; word-break: break-all; }
.pf-card__url:hover { text-decoration: underline; }
.pf-card__stats { display: flex; gap: 10px; flex-wrap: wrap; }
.pf-card__actions {
  display: flex; gap: 8px; flex-wrap: wrap;
  margin-top: 4px; padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.obj-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.04em; }
.obj-badge--WEBDEV { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; }
.obj-badge--DEVOPS { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }
.obj-badge--DATA   { background: rgba(234, 179, 8,   0.12); color: #a16207; }
.obj-badge--CYBER  { background: rgba(239, 68, 68,  0.12); color: #dc2626; }

.tpl-label { font-size: 0.7rem; color: var(--color-text-secondary); background: var(--color-surface-alt); padding: 2px 8px; border-radius: 6px; }

.status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.status-badge--published { background: var(--color-accent-light); color: var(--color-accent); border: 1px solid var(--color-accent-border); }
.status-badge--draft     { background: var(--color-surface-alt); color: var(--color-text-secondary); }

.stat-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; color: var(--color-text-secondary); background: var(--color-surface-alt); padding: 3px 10px; border-radius: 20px; }

.btn--create {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--color-accent); color: #fff; border: none;
  border-radius: 10px; padding: 10px 18px; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: background 0.15s;
}
.btn--create:hover { background: var(--color-accent-hover); }

.btn--publish {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--color-accent-light); color: var(--color-accent);
  border: 1px solid var(--color-accent-border); border-radius: 8px;
  padding: 6px 12px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.btn--publish:hover { background: var(--color-accent-border); }

.btn--unpublish {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(239, 68, 68, 0.08); color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px;
  padding: 6px 12px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.btn--unpublish:hover { background: rgba(239, 68, 68, 0.14); }

.btn--save {
  display: inline-flex; align-items: center;
  background: var(--color-accent); color: #fff; border: none;
  border-radius: 10px; padding: 10px 24px; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.btn--save:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn--save:disabled,
.btn--publish:disabled,
.btn--unpublish:disabled,
.btn--ghost:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px; width: 100%; max-width: 480px; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--color-border); }
.modal__title { font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.modal__close { background: none; border: none; color: var(--color-text-secondary); font-size: 1.1rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; }
.modal__close:hover { background: var(--color-surface-hover); }
.modal__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }
.modal__footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--color-border); }

.field { display: flex; flex-direction: column; gap: 8px; }
.field__label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
.field__input { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 14px; color: var(--color-text-primary); font-size: 0.9rem; font-family: Inter, sans-serif; outline: none; transition: border-color 0.15s; width: 100%; }
.field__input:focus { border-color: var(--color-accent); }
.field__hint { font-size: 0.8rem; color: var(--color-text-secondary); margin: 0; }

.obj-selector { display: flex; gap: 8px; flex-wrap: wrap; }
.obj-option {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em;
  padding: 5px 14px; border-radius: 20px; cursor: pointer;
  border: 1px solid var(--color-border); background: var(--color-surface-alt);
  color: var(--color-text-secondary); transition: all 0.15s;
}
.obj-option--WEBDEV.obj-option--active { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; border-color: rgba(59, 130, 246, 0.35); }
.obj-option--DEVOPS.obj-option--active { background: rgba(139, 92, 246, 0.12); color: #7c3aed; border-color: rgba(139, 92, 246, 0.35); }
.obj-option--DATA.obj-option--active   { background: rgba(234, 179, 8,   0.12); color: #a16207; border-color: rgba(234, 179, 8,   0.35); }
.obj-option--CYBER.obj-option--active  { background: rgba(239, 68, 68,  0.12); color: #dc2626; border-color: rgba(239, 68, 68,  0.35); }

.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.template-card { border: 2px solid var(--color-border); border-radius: 10px; overflow: hidden; cursor: pointer; transition: border-color 0.15s, transform 0.15s; }
.template-card:hover { transform: translateY(-2px); }
.template-card--selected { border-color: var(--color-accent); }
.template-card__preview { height: 70px; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; }
.tpl-line { border-radius: 3px; background: rgba(255, 255, 255, 0.3); }
.tpl-line--title { height: 8px; width: 70%; }
.tpl-line--sub   { height: 5px; width: 50%; }
.tpl-line--block { height: 20px; width: 100%; margin-top: 4px; }
.template-card__label { display: block; text-align: center; font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); padding: 6px 0; background: var(--color-surface-alt); }

/* Auto-default banner */
.auto-default-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
.auto-default-title { font-size: 0.95rem; font-weight: 700; color: var(--color-accent); margin: 0 0 4px; }
.auto-default-msg   { font-size: 0.82rem; color: var(--color-text-secondary); margin: 0; }

.pf-card--auto { border-color: var(--color-accent-border); }

.auto-portfolio-msg {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  background: var(--color-accent-light);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 0;
}

.badge__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

/* Error & loading */
.error-banner {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #dc2626;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.loading-state {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* ── Templates disponibles section ─────────────────────────────────── */
.templates-section {
  margin-top: 36px;
}
.templates-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.tpl-showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.tpl-showcase-card {
  border: 2px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s, transform 0.15s;
}
.tpl-showcase-card:hover { transform: translateY(-2px); }
.tpl-showcase-card--active { border-color: var(--color-accent); }

.tpl-showcase__preview {
  height: 120px;
  position: relative;
  overflow: hidden;
}

.tpl-showcase__info {
  padding: 12px 14px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tpl-showcase__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tpl-showcase__name { font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); }
.tpl-showcase__badge {
  font-size: 0.62rem; font-weight: 700;
  background: var(--color-accent-light); color: var(--color-accent);
  border: 1px solid var(--color-accent-border);
  padding: 1px 7px; border-radius: 20px;
}
.tpl-showcase__desc { font-size: 0.74rem; color: var(--color-text-secondary); margin: 0; line-height: 1.4; }

/* Template 1 preview — dark navy (couleurs intentionnelles du template) */
.tpl1-hero {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 12px 8px;
}
.tpl1-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  flex-shrink: 0;
}
.tpl1-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; padding-top: 2px; }
.tpl1-line { border-radius: 3px; background: rgba(255,255,255,0.2); }
.tpl1-line--name { height: 7px; width: 80%; }
.tpl1-line--sub  { height: 5px; width: 55%; }
.tpl1-line--tag  { height: 5px; width: 35%; background: rgba(92, 140, 106, 0.5); border-radius: 20px; }
.tpl1-score { flex-shrink: 0; }
.tpl1-score__svg { width: 36px; height: 36px; }
.tpl1-section-stub { padding: 0 12px; display: flex; flex-direction: column; gap: 4px; }
.tpl1-stub-line { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.1); width: 100%; }
.tpl1-stub-line--short { width: 60%; }

/* Template 2 preview */
.tpl2-layout { display: flex; height: 100%; }
.tpl2-sidebar {
  width: 28px; background: #1f2937;
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 12px 0; flex-shrink: 0;
}
.tpl2-sidebar__dot { width: 10px; height: 10px; border-radius: 3px; background: rgba(255,255,255,0.2); }
.tpl2-content { flex: 1; padding: 10px 10px 8px; display: flex; flex-direction: column; gap: 6px; }
.tpl2-topbar { height: 8px; border-radius: 3px; background: #d1d5db; width: 70%; }
.tpl2-cards { display: flex; gap: 6px; }
.tpl2-card { flex: 1; height: 28px; border-radius: 5px; background: #ffffff; border: 1px solid #e5e7eb; }
.tpl2-row { height: 6px; border-radius: 3px; background: #d1d5db; width: 100%; }
.tpl2-row--short { width: 55%; }

/* Template 3 preview */
.tpl3-layout { display: flex; flex-direction: column; align-items: center; padding: 14px 16px 8px; gap: 5px; }
.tpl3-avatar { width: 26px; height: 26px; border-radius: 50%; background: #d1d5db; margin-bottom: 4px; }
.tpl3-line { border-radius: 3px; background: #d1d5db; }
.tpl3-line--name  { height: 7px; width: 60%; }
.tpl3-line--role  { height: 5px; width: 40%; background: #9ca3af; }
.tpl3-divider     { height: 1px; width: 80%; background: #e5e7eb; margin: 2px 0; }
.tpl3-line--text  { height: 4px; width: 85%; }
.tpl3-line--short { width: 55%; }

@media (max-width: 580px) {
  .pf-card__actions { flex-direction: column; }
  .template-grid { grid-template-columns: 1fr 1fr; }
  .tpl-showcase-grid { grid-template-columns: 1fr 1fr; }
}
</style>