import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'

// ── fixtures ─────────────────────────────────────────────────────────────────
const STATS_MOCK = {
  projetsCertifies: 4,
  credibilite:      78,
  vuesProfil:       123,
  recommandations:  6,
}

// ── helper ───────────────────────────────────────────────────────────────────
const mountComponent = (props = {}) =>
  mount(DashboardStats, {
    props: { stats: null, ...props },
  })

// ─────────────────────────────────────────────────────────────────────────────
describe('DashboardStats.vue', () => {

  // ── Structure ──────────────────────────────────────────────────────────────
  describe('Structure', () => {
    it('affiche exactement 4 cartes statistiques', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      expect(wrapper.findAll('.stat-card')).toHaveLength(4)
    })

    it('contient un conteneur stats-grid', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      expect(wrapper.find('.stats-grid').exists()).toBe(true)
    })
  })

  // ── Labels ─────────────────────────────────────────────────────────────────
  describe('Labels des statistiques', () => {
    it('affiche le label PROJETS CERTIFIÉS', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const labels = wrapper.findAll('.stat-card__label').map(l => l.text())
      expect(labels).toContain('PROJETS CERTIFIÉS')
    })

    it('affiche le label CRÉDIBILITÉ PORTFOLIO', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const labels = wrapper.findAll('.stat-card__label').map(l => l.text())
      expect(labels).toContain('CRÉDIBILITÉ PORTFOLIO')
    })

    it('affiche le label VUES PROFIL (30J)', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const labels = wrapper.findAll('.stat-card__label').map(l => l.text())
      expect(labels).toContain('VUES PROFIL (30J)')
    })

    it('affiche le label RECOMMANDATIONS', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const labels = wrapper.findAll('.stat-card__label').map(l => l.text())
      expect(labels).toContain('RECOMMANDATIONS')
    })
  })

  // ── Valeurs avec stats fournies ────────────────────────────────────────────
  describe('Valeurs (stats fournies)', () => {
    it('affiche le nombre de projets certifiés', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const values = wrapper.findAll('.stat-card__value').map(v => v.text())
      expect(values).toContain('4')
    })

    it('affiche la crédibilité avec le suffixe /100', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const values = wrapper.findAll('.stat-card__value').map(v => v.text())
      expect(values).toContain('78/100')
    })

    it('affiche les vues profil', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const values = wrapper.findAll('.stat-card__value').map(v => v.text())
      expect(values).toContain('123')
    })

    it('affiche le nombre de recommandations', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      const values = wrapper.findAll('.stat-card__value').map(v => v.text())
      expect(values).toContain('6')
    })
  })

  // ── État loading (stats = null) ────────────────────────────────────────────
  describe('État loading (stats = null)', () => {
    it("affiche des squelettes à la place des valeurs quand stats est null", () => {
      const wrapper = mountComponent({ stats: null })
      expect(wrapper.findAll('.skeleton--value')).toHaveLength(4)
    })

    it("n'affiche pas de stat-card__value quand stats est null", () => {
      const wrapper = mountComponent({ stats: null })
      expect(wrapper.find('.stat-card__value').exists()).toBe(false)
    })

    it('affiche quand même les 4 cartes en mode skeleton', () => {
      const wrapper = mountComponent({ stats: null })
      expect(wrapper.findAll('.stat-card')).toHaveLength(4)
    })

    it('affiche quand même les labels en mode skeleton', () => {
      const wrapper = mountComponent({ stats: null })
      expect(wrapper.findAll('.stat-card__label')).toHaveLength(4)
    })
  })

  // ── Icônes ─────────────────────────────────────────────────────────────────
  describe('Icônes', () => {
    it('affiche une icône par carte stat', () => {
      const wrapper = mountComponent({ stats: STATS_MOCK })
      expect(wrapper.findAll('.icon--md')).toHaveLength(4)
    })
  })

  // ── Valeurs limites ────────────────────────────────────────────────────────
  describe('Valeurs limites', () => {
    it('affiche 0 correctement pour toutes les statistiques', () => {
      const zeroStats = {
        projetsCertifies: 0,
        credibilite:      0,
        vuesProfil:       0,
        recommandations:  0,
      }
      const wrapper = mountComponent({ stats: zeroStats })
      const values = wrapper.findAll('.stat-card__value').map(v => v.text())
      expect(values).toContain('0')
      expect(values).toContain('0/100')
    })
  })
})