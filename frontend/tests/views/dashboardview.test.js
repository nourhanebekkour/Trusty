import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

// ── mocks services ────────────────────────────────────────────────────────────
vi.mock('@/services/dashboardservices', () => ({
  fetchStats:    vi.fn(),
  fetchProjects: vi.fn(),
  fetchRecos:    vi.fn(),
}))

// ── mocks composants enfants ──────────────────────────────────────────────────
vi.mock('@/components/dashboard/DashboardStats.vue',    () => ({ default: defineComponent({ name: 'DashboardStats',    props: ['stats'],             template: '<div class="mock-stats" />' }) }))
vi.mock('@/components/dashboard/DashboardProjects.vue', () => ({ default: defineComponent({ name: 'DashboardProjects', props: ['projects', 'loading'], template: '<div class="mock-projects" />' }) }))
vi.mock('@/components/dashboard/DashboardRecos.vue',    () => ({ default: defineComponent({ name: 'DashboardRecos',    props: ['recos', 'loading'],   template: '<div class="mock-recos" />' }) }))

import { fetchStats, fetchProjects, fetchRecos } from '@/services/dashboardservices'
import Dashboard from '@/views/Dashboard.vue'

// ── mock vue-router ───────────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ── fixtures ──────────────────────────────────────────────────────────────────
const MOCK_STATS    = { projetsCertifies: 4, credibilite: 78, vuesProfil: 123, recommandations: 6 }
const MOCK_PROJECTS = [{ id: '1', titre: 'Projet A', type: 'Web', statut: 'Certifié', dateDebut: '2024-01-01', description: 'desc', tags: [] }]
const MOCK_RECOS    = [{ id_recommandation: '1', message: 'Super!', auteur: { nom: 'Doe', prenom: 'John', poste: 'CTO' } }]

// ── helper ────────────────────────────────────────────────────────────────────
const mountView = () =>
  mount(Dashboard, {
    global: {
      stubs: { 'router-link': true },
      mocks: { $router: { push: mockPush } },
    },
  })

// ─────────────────────────────────────────────────────────────────────────────
describe('Dashboard.vue (view)', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    fetchStats.mockResolvedValue(MOCK_STATS)
    fetchProjects.mockResolvedValue(MOCK_PROJECTS)
    fetchRecos.mockResolvedValue(MOCK_RECOS)
  })

  // ── Rendu initial ──────────────────────────────────────────────────────────
  describe('Rendu initial', () => {
    it('affiche le titre principal', () => {
      const wrapper = mountView()
      expect(wrapper.find('.page-title').text()).toBe('Tableau de Bord Étudiant')
    })

    it('affiche le sous-titre descriptif', () => {
      const wrapper = mountView()
      expect(wrapper.find('.page-subtitle').text()).toContain('réalisations')
    })

    it('contient le conteneur dashboard-page', () => {
      const wrapper = mountView()
      expect(wrapper.find('.dashboard-page').exists()).toBe(true)
    })
  })

  // ── Composants enfants ─────────────────────────────────────────────────────
  describe('Composants enfants', () => {
    it('monte le composant DashboardStats', () => {
      const wrapper = mountView()
      expect(wrapper.find('.mock-stats').exists()).toBe(true)
    })

    it('monte le composant DashboardProjects', () => {
      const wrapper = mountView()
      expect(wrapper.find('.mock-projects').exists()).toBe(true)
    })

    it('monte le composant DashboardRecos', () => {
      const wrapper = mountView()
      expect(wrapper.find('.mock-recos').exists()).toBe(true)
    })
  })

  // ── Chargement des données (onMounted) ─────────────────────────────────────
  describe('Chargement des données au montage', () => {
    it('appelle fetchStats au montage', async () => {
      mountView()
      await flushPromises()
      expect(fetchStats).toHaveBeenCalledTimes(1)
    })

    it('appelle fetchProjects au montage', async () => {
      mountView()
      await flushPromises()
      expect(fetchProjects).toHaveBeenCalledTimes(1)
    })

    it('appelle fetchRecos au montage', async () => {
      mountView()
      await flushPromises()
      expect(fetchRecos).toHaveBeenCalledTimes(1)
    })

    it('les 3 services sont appelés sans arguments', async () => {
      mountView()
      await flushPromises()
      expect(fetchStats).toHaveBeenCalledWith()
      expect(fetchProjects).toHaveBeenCalledWith()
      expect(fetchRecos).toHaveBeenCalledWith()
    })
  })

  // ── Passage des props aux enfants ──────────────────────────────────────────
  describe('Props passées aux composants enfants', () => {
    it('passe les stats à DashboardStats après chargement', async () => {
      const wrapper = mountView()
      await flushPromises()
      const statsComp = wrapper.findComponent({ name: 'DashboardStats' })
      expect(statsComp.props('stats')).toEqual(MOCK_STATS)
    })

    it('passe les projects à DashboardProjects après chargement', async () => {
      const wrapper = mountView()
      await flushPromises()
      const projComp = wrapper.findComponent({ name: 'DashboardProjects' })
      expect(projComp.props('projects')).toEqual(MOCK_PROJECTS)
    })

    it('passe loading=true à DashboardProjects avant chargement', () => {
      const wrapper = mountView()
      const projComp = wrapper.findComponent({ name: 'DashboardProjects' })
      expect(projComp.props('loading')).toBe(true)
    })

    it('passe loading=false à DashboardProjects après chargement', async () => {
      const wrapper = mountView()
      await flushPromises()
      const projComp = wrapper.findComponent({ name: 'DashboardProjects' })
      expect(projComp.props('loading')).toBe(false)
    })

    it('passe loading=true à DashboardRecos avant chargement', () => {
      const wrapper = mountView()
      const recosComp = wrapper.findComponent({ name: 'DashboardRecos' })
      expect(recosComp.props('loading')).toBe(true)
    })

    it('passe loading=false à DashboardRecos après chargement', async () => {
      const wrapper = mountView()
      await flushPromises()
      const recosComp = wrapper.findComponent({ name: 'DashboardRecos' })
      expect(recosComp.props('loading')).toBe(false)
    })

    it('passe les recos à DashboardRecos après chargement', async () => {
      const wrapper = mountView()
      await flushPromises()
      const recosComp = wrapper.findComponent({ name: 'DashboardRecos' })
      expect(recosComp.props('recos')).toEqual(MOCK_RECOS)
    })
  })

  // ── Bannière CTA ───────────────────────────────────────────────────────────
  describe('Bannière CTA', () => {
    it('affiche le bloc cta-banner', () => {
      const wrapper = mountView()
      expect(wrapper.find('.cta-banner').exists()).toBe(true)
    })

    it('affiche le titre "Prêt à partager ?"', () => {
      const wrapper = mountView()
      expect(wrapper.find('.cta-banner__title').text()).toBe('Prêt à partager ?')
    })

    it('affiche le bouton "Aperçu Public"', () => {
      const wrapper = mountView()
      const buttons = wrapper.findAll('.btn--outline-accent').map(b => b.text())
      expect(buttons).toContain('Aperçu Public')
    })

    it('affiche le bouton "Générer mon URL Certifiée"', () => {
      const wrapper = mountView()
      const buttons = wrapper.findAll('.btn--outline-accent').map(b => b.text())
      expect(buttons).toContain('Générer mon URL Certifiée')
    })

    it('navigue vers /portfolio/apercu au clic sur "Aperçu Public"', async () => {
      const wrapper = mountView()
      const apercuBtn = wrapper.findAll('.btn--outline-accent').find(b => b.text() === 'Aperçu Public')
      await apercuBtn.trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/portfolio/apercu')
    })
  })

  // ── Gestion d'erreurs ──────────────────────────────────────────────────────
  // Ces tests nécessitent un try/catch dans onMounted de Dashboard.vue.
  // Ajouter ce correctif dans Dashboard.vue, puis décommenter les tests.
  //
  //   onMounted(async () => {
  //     try {
  //       stats.value           = await fetchStats()
  //       projects.value        = await fetchProjects()
  //       loadingProjects.value = false
  //       recommandations.value = await fetchRecos()
  //       loadingRecos.value    = false
  //     } catch (err) {
  //       console.error('[Dashboard] Erreur de chargement :', err)
  //       loadingProjects.value = false
  //       loadingRecos.value    = false
  //     }
  //   })

  // describe('Résilience aux erreurs de service', () => {
  //   beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}) })
  //   afterEach(() => { vi.restoreAllMocks() })
  //
  //   it('reste monté si fetchStats échoue', async () => {
  //     fetchStats.mockRejectedValueOnce(new Error('fail'))
  //     const wrapper = mountView()
  //     await flushPromises()
  //     expect(wrapper.find('.dashboard-page').exists()).toBe(true)
  //   })
  //   it('reste monté si fetchProjects échoue', async () => {
  //     fetchProjects.mockRejectedValueOnce(new Error('fail'))
  //     const wrapper = mountView()
  //     await flushPromises()
  //     expect(wrapper.find('.dashboard-page').exists()).toBe(true)
  //   })
  //   it('reste monté si fetchRecos échoue', async () => {
  //     fetchRecos.mockRejectedValueOnce(new Error('fail'))
  //     const wrapper = mountView()
  //     await flushPromises()
  //     expect(wrapper.find('.dashboard-page').exists()).toBe(true)
  //   })
  // })
})