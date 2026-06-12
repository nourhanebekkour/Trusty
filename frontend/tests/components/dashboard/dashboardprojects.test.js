import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardProjects from '@/components/dashboard/DashboardProjects.vue'

// ── mock vue-router (composant utilise $router.push dans le template) ─────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ── Fixtures avec les vrais noms de champs du composant ───────────────────────
const PROJECT_VALIDE = {
  id_projet:         '1',
  titre:             'Application RH',
  type_projet:       'PFA',
  status_validation: 'VALIDE',
  date_debut:        '2024-09-01',
  description:       'Développement full-stack.',
  technologies: [
    { technologie: { nom: 'React' } },
    { technologie: { nom: 'Node.js' } },
  ],
}

const PROJECT_EN_ATTENTE = {
  id_projet:         '2',
  titre:             'Dashboard Analytics',
  type_projet:       'MODULE',
  status_validation: 'EN_ATTENTE',
  date_debut:        '2025-01-15',
  description:       'Tableau de bord interactif.',
  technologies: [
    { technologie: { nom: 'Python' } },
    { technologie: { nom: 'Vue.js' } },
  ],
}

const PROJECT_REJETE = {
  id_projet:         '3',
  titre:             'Portfolio V2',
  type_projet:       'PERSONNEL',
  status_validation: 'REJETE',
  date_debut:        '2025-03-01',
  description:       'Refonte du portfolio.',
  technologies: [
    { technologie: { nom: 'Figma' } },
  ],
}

// ── helper ────────────────────────────────────────────────────────────────────
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
  beforeEach(() => mockPush.mockClear())

  // ── Rendu de base ──────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre de la section', () => {
      expect(mountComponent().find('.section__title').text()).toBe('Mon Portfolio Numérique')
    })

    it('affiche les boutons Filtres et Trier par date', () => {
      const labels = mountComponent().findAll('button').map(b => b.text())
      expect(labels).toContain('Filtres')
      expect(labels).toContain('Trier par date')
    })
  })

  // ── État loading ───────────────────────────────────────────────────────────
  describe('État loading', () => {
    it('affiche 6 cartes squelettes quand loading est true', () => {
      expect(mountComponent({ loading: true }).findAll('.project-card')).toHaveLength(6)
    })

    it('affiche des éléments skeleton dans chaque carte', () => {
      expect(mountComponent({ loading: true }).findAll('.skeleton').length).toBeGreaterThanOrEqual(6)
    })

    it('n\'affiche pas le empty-state quand loading est true', () => {
      expect(mountComponent({ loading: true }).find('.empty-state').exists()).toBe(false)
    })
  })

  // ── État vide ──────────────────────────────────────────────────────────────
  describe('État vide (projects = [])', () => {
    it('affiche "Aucun projet pour le moment"', () => {
      expect(mountComponent().find('.empty-state__title').text()).toBe('Aucun projet pour le moment')
    })

    it('affiche le bouton "+ Ajouter un projet"', () => {
      expect(mountComponent().find('.btn--primary').text()).toContain('Ajouter un projet')
    })

    it('redirige vers /projets au clic sur "Ajouter un projet"', async () => {
      await mountComponent().find('.btn--primary').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets')
    })
  })

  // ── Affichage des projets ──────────────────────────────────────────────────
  describe('Affichage des projets', () => {
    it('rend le bon nombre de cartes projet', () => {
      expect(
        mountComponent({ projects: [PROJECT_VALIDE, PROJECT_EN_ATTENTE, PROJECT_REJETE] })
          .findAll('.project-card')
      ).toHaveLength(3)
    })

    it('affiche le titre du projet', () => {
      expect(
        mountComponent({ projects: [PROJECT_VALIDE] }).find('.project-card__title').text()
      ).toBe('Application RH')
    })

    it('affiche la description du projet', () => {
      expect(
        mountComponent({ projects: [PROJECT_VALIDE] }).find('.project-card__description').text()
      ).toContain('full-stack')
    })

    it('affiche les tags du projet (technologies)', () => {
      const tags = mountComponent({ projects: [PROJECT_VALIDE] })
        .findAll('.tag').map(t => t.text())
      expect(tags).toContain('React')
      expect(tags).toContain('Node.js')
    })

    it('affiche le badge de type (formatTypeProjet)', () => {
      // type_projet='PFA' → formatTypeProjet → 'PFA'
      expect(
        mountComponent({ projects: [PROJECT_VALIDE] }).find('.badge--type').text()
      ).toBe('PFA')
    })
  })

  // ── Badges de statut ───────────────────────────────────────────────────────
  describe('Badges de statut', () => {
    it('applique badge--status-ok pour VALIDE', () => {
      expect(
        mountComponent({ projects: [PROJECT_VALIDE] }).find('.badge--status').classes()
      ).toContain('badge--status-ok')
    })

    it('applique badge--status-wait pour EN_ATTENTE', () => {
      expect(
        mountComponent({ projects: [PROJECT_EN_ATTENTE] }).find('.badge--status').classes()
      ).toContain('badge--status-wait')
    })

    it('applique badge--status-error pour REJETE', () => {
      expect(
        mountComponent({ projects: [PROJECT_REJETE] }).find('.badge--status').classes()
      ).toContain('badge--status-error')
    })

    it('affiche une icône trusty pour les projets VALIDE', () => {
      expect(
        mountComponent({ projects: [PROJECT_VALIDE] }).find('.badge--status img').exists()
      ).toBe(true)
    })

    it('affiche un badge__dot pour les projets non VALIDE', () => {
      expect(
        mountComponent({ projects: [PROJECT_EN_ATTENTE] }).find('.badge__dot').exists()
      ).toBe(true)
    })
  })

  // ── Classe de carte ────────────────────────────────────────────────────────
  describe('Classe de carte projet', () => {
    it('ajoute project-card--pending pour EN_ATTENTE', () => {
      expect(
        mountComponent({ projects: [PROJECT_EN_ATTENTE] }).find('.project-card').classes()
      ).toContain('project-card--pending')
    })

    it("n'ajoute pas project-card--pending pour VALIDE", () => {
      expect(
        mountComponent({ projects: [PROJECT_VALIDE] }).find('.project-card').classes()
      ).not.toContain('project-card--pending')
    })
  })

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('navigue vers /projets/:id_projet au clic sur une carte', async () => {
      await mountComponent({ projects: [PROJECT_VALIDE] })
        .find('.project-card').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets/1')
    })

    it('navigue vers /projets au clic sur "Détails ↗"', async () => {
      await mountComponent({ projects: [PROJECT_VALIDE] })
        .find('.btn--link').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets')
    })
  })

  // ── formatDate ─────────────────────────────────────────────────────────────
  describe('Formatage de date', () => {
    it('formate date_debut en mois + année en français', () => {
      const dateText = mountComponent({ projects: [PROJECT_VALIDE] })
        .find('.project-card__date').text()
      expect(dateText).toMatch(/septembre 2024/i)
    })

    it("n'affiche rien si date_debut est null", () => {
      const project = { ...PROJECT_VALIDE, date_debut: null }
      expect(
        mountComponent({ projects: [project] }).find('.project-card__date').text()
      ).toBe('')
    })
  })
})
