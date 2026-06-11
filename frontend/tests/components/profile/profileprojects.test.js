import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileProjects from '@/components/profile/ProfileProjects.vue'

// ─── Mock du router ────────────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeProjet = (overrides = {}) => ({
  projet: {
    id_projet: 1,
    titre: 'Projet Test',
    description: 'Description du projet test',
    status_validation: 'VALIDE',
    ...overrides.projet,
  },
  ...overrides,
})

const makeUser = (projets = []) => ({
  etudiant: { participations_projets: projets },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileProjects.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser()) =>
    mount(ProfileProjects, {
      props: { user },
      global: {
        mocks: { $router: { push: mockPush } },
      },
    })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Projets Académiques"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.section-header h3').text()).toBe('Projets Académiques')
    })

    it('affiche le bouton "+ Ajouter"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.add-btn').text()).toBe('+ Ajouter')
    })

    it('affiche le lien "Voir tous les projets"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.link-btn').text()).toContain('Voir tous les projets')
    })
  })

  // ── État vide ────────────────────────────────────────────────────────────────
  describe('État vide', () => {
    it('affiche le message vide quand la liste est vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.empty-msg').text()).toBe('Aucun projet académique.')
    })

    it('n\'affiche pas la liste de projets quand vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.project-list').exists()).toBe(false)
    })

    it('affiche le message vide quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })

    it('affiche le message vide quand participations_projets est undefined', () => {
      wrapper = mountComponent({ etudiant: {} })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })
  })

  // ── Affichage des projets ─────────────────────────────────────────────────────
  describe('Affichage des projets', () => {
    it('affiche la liste quand des projets existent', () => {
      wrapper = mountComponent(makeUser([makeProjet()]))
      expect(wrapper.find('.project-list').exists()).toBe(true)
      expect(wrapper.find('.empty-msg').exists()).toBe(false)
    })

    it('affiche le bon nombre de project-row', () => {
      const projets = [
        makeProjet({ projet: { id_projet: 1, titre: 'P1', description: 'D1', status_validation: 'VALIDE' } }),
        makeProjet({ projet: { id_projet: 2, titre: 'P2', description: 'D2', status_validation: 'EN_ATTENTE' } }),
        makeProjet({ projet: { id_projet: 3, titre: 'P3', description: 'D3', status_validation: 'REJETE' } }),
      ]
      wrapper = mountComponent(makeUser(projets))
      expect(wrapper.findAll('.project-row')).toHaveLength(3)
    })

    it('affiche le titre du projet', () => {
      wrapper = mountComponent(makeUser([makeProjet({ projet: { id_projet: 1, titre: 'Système de vote', description: 'App web', status_validation: 'VALIDE' } })]))
      expect(wrapper.find('.project-title').text()).toBe('Système de vote')
    })

    it('affiche la description du projet', () => {
      wrapper = mountComponent(makeUser([makeProjet({ projet: { id_projet: 1, titre: 'Test', description: 'Ma description', status_validation: 'VALIDE' } })]))
      // Le composant a deux .project-desc : [0] = type_projet, [1] = description
      const descs = wrapper.findAll('.project-desc')
      expect(descs.some(d => d.text().includes('Ma description'))).toBe(true)
    })

    it('affiche l\'icône 📁', () => {
      wrapper = mountComponent(makeUser([makeProjet()]))
      expect(wrapper.find('.project-icon').text()).toBe('📁')
    })
  })

  // ── Statuts ───────────────────────────────────────────────────────────────────
  describe('Formatage et classes des statuts', () => {
    const cases = [
      { status: 'VALIDE',     label: 'Validé',     cssClass: 'status-green' },
      { status: 'EN_ATTENTE', label: 'En attente', cssClass: 'status-amber' },
      { status: 'REJETE',     label: 'Rejeté',     cssClass: 'status-gray'  },
    ]

    cases.forEach(({ status, label, cssClass }) => {
      it(`affiche le label "${label}" pour le statut ${status}`, () => {
        wrapper = mountComponent(makeUser([makeProjet({ projet: { id_projet: 1, titre: 'P', description: 'D', status_validation: status } })]))
        expect(wrapper.find('.status').text()).toBe(label)
      })

      it(`applique la classe "${cssClass}" pour le statut ${status}`, () => {
        wrapper = mountComponent(makeUser([makeProjet({ projet: { id_projet: 1, titre: 'P', description: 'D', status_validation: status } })]))
        expect(wrapper.find('.status').classes()).toContain(cssClass)
      })
    })

    it('affiche le statut brut si la valeur est inconnue', () => {
      wrapper = mountComponent(makeUser([makeProjet({ projet: { id_projet: 1, titre: 'P', description: 'D', status_validation: 'INCONNU' } })]))
      expect(wrapper.find('.status').text()).toBe('INCONNU')
    })
  })

  // ── Navigation ────────────────────────────────────────────────────────────────
  describe('Navigation vers /projets', () => {
    it('navigue vers /projets au clic sur "Voir tous les projets"', async () => {
      wrapper = mountComponent()
      await wrapper.find('.link-btn').trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/projets')
    })
  })
})