import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardProjects from '@/components/dashboard/DashboardProjects.vue'

// ── mock vue-router ──────────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ── fixtures ─────────────────────────────────────────────────────────────────
const PROJECT_CERTIFIE = {
  id: '1',
  titre: 'Application RH',
  type: 'Développement Web',
  statut: 'Certifié',
  dateDebut: '2024-09-01',
  description: 'Développement full-stack.',
  tags: ['React', 'Node.js'],
}

const PROJECT_EN_COURS = {
  id: '2',
  titre: 'Dashboard Analytics',
  type: 'Data Science',
  statut: 'En cours',
  dateDebut: '2025-01-15',
  description: "Tableau de bord interactif.",
  tags: ['Python', 'Vue.js'],
}

const PROJECT_EN_ATTENTE = {
  id: '3',
  titre: 'Portfolio V2',
  type: 'Design',
  statut: 'En attente',
  dateDebut: '2025-03-01',
  description: 'Refonte du portfolio.',
  tags: ['Figma'],
}

// ── helper ───────────────────────────────────────────────────────────────────
const mountComponent = (props = {}) =>
  mount(DashboardProjects, {
    props: { projects: [], loading: false, ...props },
    global: {
      stubs: { 'router-link': true },
      mocks: { $router: { push: mockPush } },
    },
  })

// ─────────────────────────────────────────────────────────────────────────────
describe('DashboardProjects.vue', () => {

  beforeEach(() => {
    mockPush.mockClear()
  })

  // ── Rendu de base ──────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre de la section', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.section__title').text()).toBe('Mon Portfolio Numérique')
    })

    it('affiche les boutons Filtres et Trier par date', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const labels = buttons.map(b => b.text())
      expect(labels).toContain('Filtres')
      expect(labels).toContain('Trier par date')
    })
  })

  // ── État loading ───────────────────────────────────────────────────────────
  describe('État loading', () => {
    it('affiche 6 cartes squelettes quand loading est true', () => {
      const wrapper = mountComponent({ loading: true })
      const skeletons = wrapper.findAll('.project-card')
      expect(skeletons).toHaveLength(6)
    })

    it('affiche des éléments skeleton dans chaque carte', () => {
      const wrapper = mountComponent({ loading: true })
      expect(wrapper.findAll('.skeleton').length).toBeGreaterThanOrEqual(6)
    })

    it('ne affiche pas le empty-state quand loading est true', () => {
      const wrapper = mountComponent({ loading: true })
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })
  })

  // ── État vide ──────────────────────────────────────────────────────────────
  describe('État vide (projects = [])', () => {
    it('affiche le message "Aucun projet pour le moment"', () => {
      const wrapper = mountComponent({ projects: [] })
      expect(wrapper.find('.empty-state__title').text()).toBe('Aucun projet pour le moment')
    })

    it('affiche le bouton "+ Ajouter un projet"', () => {
      const wrapper = mountComponent({ projects: [] })
      expect(wrapper.find('.btn--primary').text()).toContain('Ajouter un projet')
    })

    it('redirige vers /projets au clic sur "Ajouter un projet"', async () => {
      const wrapper = mountComponent({ projects: [] })
      await wrapper.find('.btn--primary').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets')
    })
  })

  // ── Affichage des projets ──────────────────────────────────────────────────
  describe('Affichage des projets', () => {
    it('rend le bon nombre de cartes projet', () => {
      const wrapper = mountComponent({
        projects: [PROJECT_CERTIFIE, PROJECT_EN_COURS, PROJECT_EN_ATTENTE],
      })
      expect(wrapper.findAll('.project-card')).toHaveLength(3)
    })

    it('affiche le titre de chaque projet', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      expect(wrapper.find('.project-card__title').text()).toBe('Application RH')
    })

    it('affiche la description du projet', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      expect(wrapper.find('.project-card__description').text()).toContain('full-stack')
    })

    it('affiche les tags du projet', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      const tags = wrapper.findAll('.tag').map(t => t.text())
      expect(tags).toContain('React')
      expect(tags).toContain('Node.js')
    })

    it('affiche le badge de type', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      expect(wrapper.find('.badge--type').text()).toBe('Développement Web')
    })
  })

  // ── Badges de statut ───────────────────────────────────────────────────────
  describe('Badges de statut', () => {
    it('applique badge--status-ok pour statut "Certifié"', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      expect(wrapper.find('.badge--status').classes()).toContain('badge--status-ok')
    })

    it('applique badge--status-progress pour statut "En cours"', () => {
      const wrapper = mountComponent({ projects: [PROJECT_EN_COURS] })
      expect(wrapper.find('.badge--status').classes()).toContain('badge--status-progress')
    })

    it('applique badge--status-wait pour statut "En attente"', () => {
      const wrapper = mountComponent({ projects: [PROJECT_EN_ATTENTE] })
      expect(wrapper.find('.badge--status').classes()).toContain('badge--status-wait')
    })

    it('affiche une icône trusty pour les projets Certifiés', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      const img = wrapper.find('.badge--status img')
      expect(img.exists()).toBe(true)
    })

    it('affiche un badge__dot pour les projets non Certifiés', () => {
      const wrapper = mountComponent({ projects: [PROJECT_EN_COURS] })
      expect(wrapper.find('.badge__dot').exists()).toBe(true)
    })
  })

  // ── Classe de carte ────────────────────────────────────────────────────────
  describe('Classe de carte projet', () => {
    it('ajoute project-card--pending pour statut "En attente"', () => {
      const wrapper = mountComponent({ projects: [PROJECT_EN_ATTENTE] })
      expect(wrapper.find('.project-card').classes()).toContain('project-card--pending')
    })

    it("n'ajoute pas project-card--pending pour statut Certifié", () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      expect(wrapper.find('.project-card').classes()).not.toContain('project-card--pending')
    })
  })

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('navigue vers /projets/:id au clic sur une carte', async () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      await wrapper.find('.project-card').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets/1')
    })

    it('navigue vers /projets au clic sur "Détails ↗" sans propager le clic', async () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      await wrapper.find('.btn--link').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets')
    })
  })

  // ── formatDate ─────────────────────────────────────────────────────────────
  describe('Formatage de date', () => {
    it('formate la date en mois + année en français', () => {
      const wrapper = mountComponent({ projects: [PROJECT_CERTIFIE] })
      const dateText = wrapper.find('.project-card__date').text()
      expect(dateText).toMatch(/septembre 2024/i)
    })

    it("n'affiche rien si dateDebut est absent", () => {
      const project = { ...PROJECT_CERTIFIE, dateDebut: null }
      const wrapper = mountComponent({ projects: [project] })
      expect(wrapper.find('.project-card__date').text()).toBe('')
    })
  })
})