import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '@/components/ui/StatCard.vue'

describe('StatCard.vue', () => {
  it('affiche le label correctement', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total utilisateurs', value: 42 },
    })
    expect(wrapper.find('.stat-card__label').text()).toBe('Total utilisateurs')
  })

  it('affiche la valeur numérique correctement', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Score', value: 99 },
    })
    expect(wrapper.find('.stat-card__value').text()).toBe('99')
  })

  it('affiche la valeur string correctement', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Statut', value: 'Actif' },
    })
    expect(wrapper.find('.stat-card__value').text()).toBe('Actif')
  })

  it('affiche le sous-texte quand fourni', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 10, sub: '+5% ce mois' },
    })
    expect(wrapper.find('.stat-card__sub').exists()).toBe(true)
    expect(wrapper.find('.stat-card__sub').text()).toBe('+5% ce mois')
  })

  it("n'affiche pas le sous-texte par défaut", () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 10 },
    })
    expect(wrapper.find('.stat-card__sub').exists()).toBe(false)
  })

  it("n'applique pas la classe highlight par défaut", () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 10 },
    })
    expect(wrapper.find('.stat-card').classes()).not.toContain('stat-card--highlight')
  })

  it('applique la classe highlight quand highlight est true', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 10, highlight: true },
    })
    expect(wrapper.find('.stat-card').classes()).toContain('stat-card--highlight')
  })

  it('affiche le slot icon quand fourni', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Total', value: 10 },
      slots: { icon: '<svg class="test-icon" />' },
    })
    expect(wrapper.find('.test-icon').exists()).toBe(true)
  })
})