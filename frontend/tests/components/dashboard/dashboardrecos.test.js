import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardRecos from '@/components/dashboard/DashboardRecos.vue'

// ── mock vue-router ──────────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ── fixtures ─────────────────────────────────────────────────────────────────
const RECO_1 = {
  id_recommandation: '1',
  message: 'Étudiant sérieux et très impliqué dans ses projets. Je recommande vivement.',
  auteur: { nom: 'Dupont', prenom: 'Marie', poste: 'Responsable RH - TechCorp' },
}

const RECO_2 = {
  id_recommandation: '2',
  message: 'Excellent travail en équipe, très bon niveau technique.',
  auteur: { nom: 'Martin', prenom: 'Jean', poste: 'CTO - StartupXYZ' },
}

const RECO_3 = {
  id_recommandation: '3',
  message: 'Très grande rigueur et autonomie.',
  auteur: { nom: 'Leroy', prenom: 'Sophie', poste: 'Lead Dev - AgenceZ' },
}

// ── helper ───────────────────────────────────────────────────────────────────
const mountComponent = (props = {}) =>
  mount(DashboardRecos, {
    props: { recos: [], loading: false, ...props },
    global: {
      stubs: { 'router-link': true },
      mocks: { $router: { push: mockPush } },
    },
  })

// ─────────────────────────────────────────────────────────────────────────────
describe('DashboardRecos.vue', () => {

  beforeEach(() => {
    mockPush.mockClear()
  })

  // ── Rendu de base ──────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre de la section', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.section__title').text()).toBe('Flux de Recommandations')
    })

    it('affiche le bouton "Tout voir"', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.btn--ghost').text()).toBe('Tout voir')
    })

    it('navigue vers /recommendations au clic sur "Tout voir"', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.btn--ghost').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/recommendations')
    })
  })

  // ── État loading ───────────────────────────────────────────────────────────
  describe('État loading', () => {
    it('affiche le bloc skeleton de la recommandation vedette', () => {
      const wrapper = mountComponent({ loading: true })
      expect(wrapper.find('.reco-featured').exists()).toBe(true)
      expect(wrapper.find('.reco-featured__bar').exists()).toBe(true)
    })

    it('affiche des éléments skeleton dans le bloc featured', () => {
      const wrapper = mountComponent({ loading: true })
      expect(wrapper.findAll('.skeleton').length).toBeGreaterThanOrEqual(3)
    })

    it('ne affiche pas le empty-state quand loading est true', () => {
      const wrapper = mountComponent({ loading: true })
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })

    it("n'affiche pas de contenu de recommandation quand loading est true", () => {
      const wrapper = mountComponent({ loading: true })
      expect(wrapper.find('.reco-featured__text').exists()).toBe(false)
    })
  })

  // ── État vide ──────────────────────────────────────────────────────────────
  describe('État vide (recos = [])', () => {
    it('affiche le message "Aucune recommandation pour le moment"', () => {
      const wrapper = mountComponent({ recos: [] })
      expect(wrapper.find('.empty-state__title').text()).toBe('Aucune recommandation pour le moment')
    })

    it('affiche le bloc empty-state--compact', () => {
      const wrapper = mountComponent({ recos: [] })
      expect(wrapper.find('.empty-state--compact').exists()).toBe(true)
    })

    it("n'affiche pas le bloc reco-featured quand recos est vide", () => {
      const wrapper = mountComponent({ recos: [] })
      expect(wrapper.find('.reco-featured__text').exists()).toBe(false)
    })
  })

  // ── Recommandation vedette ─────────────────────────────────────────────────
  describe('Recommandation vedette (recos[0])', () => {
    it('affiche le message de la première recommandation', () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.reco-featured__text').text()).toContain('Je recommande vivement')
    })

    it("affiche le nom complet de l'auteur", () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.author__name').text()).toContain('Marie')
      expect(wrapper.find('.author__name').text()).toContain('Dupont')
    })

    it("affiche le poste de l'auteur", () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.author__role').text()).toBe('Responsable RH - TechCorp')
    })

    it("affiche les initiales de l'auteur dans l'avatar", () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.author__avatar').text()).toBe('MD')
    })

    it('affiche les guillemets décoratifs', () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.reco-featured__quote-icon').text()).toContain('❝')
    })
  })

  // ── Grille secondaire ──────────────────────────────────────────────────────
  describe('Grille de recommandations secondaires', () => {
    it("n'affiche pas la grille si une seule reco", () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.reco-grid').exists()).toBe(false)
    })

    it('affiche la grille si au moins 2 recos', () => {
      const wrapper = mountComponent({ recos: [RECO_1, RECO_2] })
      expect(wrapper.find('.reco-grid').exists()).toBe(true)
    })

    it('affiche au maximum 2 cartes secondaires (recos[1] et recos[2])', () => {
      const wrapper = mountComponent({ recos: [RECO_1, RECO_2, RECO_3] })
      expect(wrapper.findAll('.reco-card')).toHaveLength(2)
    })

    it('affiche le texte de la deuxième recommandation dans la grille', () => {
      const wrapper = mountComponent({ recos: [RECO_1, RECO_2] })
      expect(wrapper.find('.reco-card__text').text()).toContain('Excellent travail')
    })

    it('affiche le label "Repost" sur chaque carte secondaire', () => {
      const wrapper = mountComponent({ recos: [RECO_1, RECO_2] })
      expect(wrapper.find('.reco-card__repost').text()).toBe('Repost')
    })
  })

  // ── getInitials ────────────────────────────────────────────────────────────
  describe('Génération des initiales', () => {
    it('génère les initiales prénom + nom en majuscules', () => {
      const wrapper = mountComponent({ recos: [RECO_1] })
      expect(wrapper.find('.author__avatar').text()).toBe('MD')
    })

    it("gère un auteur sans nom gracieusement", () => {
      const reco = {
        ...RECO_1,
        auteur: { nom: '', prenom: 'Marie', poste: 'RH' },
      }
      const wrapper = mountComponent({ recos: [reco] })
      expect(wrapper.find('.author__avatar').text()).toBe('M')
    })

    it("gère un auteur sans prénom gracieusement", () => {
      const reco = {
        ...RECO_1,
        auteur: { nom: 'Dupont', prenom: '', poste: 'RH' },
      }
      const wrapper = mountComponent({ recos: [reco] })
      expect(wrapper.find('.author__avatar').text()).toBe('D')
    })
  })
})