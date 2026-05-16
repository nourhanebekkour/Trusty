import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import ProfileStats from '@/components/profile/ProfileStats.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
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

    it('affiche deux stat-box', () => {
      wrapper = mountComponent()
      expect(wrapper.findAll('.stat-box')).toHaveLength(2)
    })

    it('affiche le label "Projets Validés"', () => {
      wrapper = mountComponent()
      const descs = wrapper.findAll('.stat-desc')
      expect(descs.some(d => d.text() === 'Projets Validés')).toBe(true)
    })

    it('affiche le label "Badges"', () => {
      wrapper = mountComponent()
      const descs = wrapper.findAll('.stat-desc')
      expect(descs.some(d => d.text() === 'Badges')).toBe(true)
    })
  })

  // ── Compteurs ─────────────────────────────────────────────────────────────────
  describe('Compteurs dynamiques', () => {
    it('affiche 0 projets quand la liste est vide', () => {
      wrapper = mountComponent(makeUser({ projets: [], badges: [] }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('0')
    })

    it('affiche 0 badges quand la liste est vide', () => {
      wrapper = mountComponent(makeUser({ projets: [], badges: [] }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('0')
    })

    it('affiche le bon nombre de projets', () => {
      wrapper = mountComponent(makeUser({
        projets: [{ projet: { id_projet: 1 } }, { projet: { id_projet: 2 } }, { projet: { id_projet: 3 } }],
        badges: [],
      }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('3')
    })

    it('affiche le bon nombre de badges', () => {
      wrapper = mountComponent(makeUser({
        projets: [],
        badges: [{ badge: { id_badge: 1 } }, { badge: { id_badge: 2 } }],
      }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('2')
    })

    it('affiche les deux compteurs simultanément', () => {
      wrapper = mountComponent(makeUser({
        projets: [{ projet: { id_projet: 1 } }, { projet: { id_projet: 2 } }],
        badges: [{ badge: { id_badge: 1 } }],
      }))
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('2')
      expect(numbers[1].text()).toBe('1')
    })
  })

  // ── Valeurs par défaut (nullsafety) ──────────────────────────────────────────
  describe('Nullsafety', () => {
    it('affiche 0 projets quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('0')
    })

    it('affiche 0 badges quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[1].text()).toBe('0')
    })

    it('affiche 0 quand participations_projets est undefined', () => {
      wrapper = mountComponent({ etudiant: { badges: [{ badge: { id_badge: 1 } }] } })
      const numbers = wrapper.findAll('.stat-number')
      expect(numbers[0].text()).toBe('0')
    })

    it('affiche 0 quand badges est undefined', () => {
      wrapper = mountComponent({ etudiant: { participations_projets: [{ projet: { id_projet: 1 } }] } })
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