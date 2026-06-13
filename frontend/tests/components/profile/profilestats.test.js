import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import ProfileStats from '@/components/profile/ProfileStats.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeProjet = (status_validation = 'VALIDE') => ({
  projet: { id_projet: Math.random().toString(), status_validation },
})

const makeUser = ({ projets = [], badges = [] } = {}) => ({
  etudiant: {
    participations_projets: projets,
    badges,
  },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileStats.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser()) =>
    mount(ProfileStats, { props: { user } })

  beforeEach(() => {
    wrapper = null
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le label "STATISTIQUES D\'ACTIVITÉ"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.stats-label').text()).toBe('STATISTIQUES D\'ACTIVITÉ')
    })

    it('affiche la grille de stats', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.stats-grid').exists()).toBe(true)
    })

    it('affiche quatre stat-box (Projets, Validés, Compétences, Badges)', () => {
      wrapper = mountComponent()
      expect(wrapper.findAll('.stat-box')).toHaveLength(4)
    })

    it('affiche le label "Projets"', () => {
      wrapper = mountComponent()
      const descs = wrapper.findAll('.stat-desc')
      expect(descs.some(d => d.text() === 'Projets')).toBe(true)
    })

    it('affiche le label "Validés"', () => {
      wrapper = mountComponent()
      const descs = wrapper.findAll('.stat-desc')
      expect(descs.some(d => d.text() === 'Validés')).toBe(true)
    })
  })

  // ── Compteurs ─────────────────────────────────────────────────────────────────
  describe('Compteurs dynamiques', () => {
    it('affiche 0 projets total quand la liste est vide', () => {
      wrapper = mountComponent(makeUser({ projets: [], badges: [] }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('0')
    })

    it('affiche 0 projets validés quand la liste est vide', () => {
      wrapper = mountComponent(makeUser({ projets: [], badges: [] }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('0')
    })

    it('affiche le bon nombre de projets total', () => {
      wrapper = mountComponent(makeUser({
        projets: [makeProjet('VALIDE'), makeProjet('EN_ATTENTE'), makeProjet('REJETE')],
      }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('3')
    })

    it('affiche le bon nombre de projets validés', () => {
      wrapper = mountComponent(makeUser({
        projets: [makeProjet('VALIDE'), makeProjet('VALIDE'), makeProjet('EN_ATTENTE')],
      }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('2')
    })

    it('affiche les deux compteurs simultanément', () => {
      wrapper = mountComponent(makeUser({
        projets: [makeProjet('VALIDE'), makeProjet('VALIDE'), makeProjet('EN_ATTENTE')],
      }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('3')
      expect(numbers[1].text()).toBe('2')
    })
  })

  // ── Valeurs par défaut (nullsafety) ──────────────────────────────────────────
  describe('Nullsafety', () => {
    it('affiche 0 projets total quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('0')
    })

    it('affiche 0 projets validés quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('0')
    })

    it('affiche 0 quand participations_projets est undefined', () => {
      wrapper = mountComponent({ etudiant: { badges: [] } })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('0')
    })

    it('affiche 0 projets validés quand participations_projets est undefined', () => {
      wrapper = mountComponent({ etudiant: { badges: [] } })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('0')
    })
  })

  // ── Props ─────────────────────────────────────────────────────────────────────
  describe('Props', () => {
    it('accepte la prop user de type Object', () => {
      const user = makeUser()
      wrapper = mountComponent(user)
      expect(wrapper.props('user')).toEqual(user)
    })
  })
})
