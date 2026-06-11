import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/ui/StatusBadge.vue'

describe('StatusBadge.vue', () => {
  const statusCases = [
    { status: 'Certifié',      expectedClass: 'badge--success',  label: 'Certifié' },
    { status: 'Validé',        expectedClass: 'badge--success',  label: 'Validé' },
    { status: 'Actif',         expectedClass: 'badge--success',  label: 'Actif' },
    { status: 'En attente',    expectedClass: 'badge--warning',  label: 'En attente' },
    { status: 'En cours',      expectedClass: 'badge--info',     label: 'En cours' },
    { status: 'Brouillon',     expectedClass: 'badge--neutral',  label: 'Brouillon' },
    { status: 'Refusé',        expectedClass: 'badge--danger',   label: 'Refusé' },
    { status: 'Rejeté',        expectedClass: 'badge--danger',   label: 'Rejeté' },
    { status: 'Professeur',    expectedClass: 'badge--blue',     label: 'Professeur' },
    { status: 'Étudiant',      expectedClass: 'badge--neutral',  label: 'Étudiant' },
    { status: 'Professionnel', expectedClass: 'badge--purple',   label: 'Professionnel' },
  ]

  statusCases.forEach(({ status, expectedClass, label }) => {
    it(`applique la classe "${expectedClass}" et affiche "${label}" pour le statut "${status}"`, () => {
      const wrapper = mount(StatusBadge, { props: { status } })
      expect(wrapper.find('.badge').classes()).toContain(expectedClass)
      expect(wrapper.find('.badge').text()).toBe(label)
    })
  })

  it('applique badge--neutral pour un statut inconnu', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Inconnu' } })
    expect(wrapper.find('.badge').classes()).toContain('badge--neutral')
  })

  it('affiche le statut brut pour un statut inconnu', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'StatutInconnu' } })
    expect(wrapper.find('.badge').text()).toBe('StatutInconnu')
  })

  it('rend un élément span avec la classe badge', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Actif' } })
    expect(wrapper.find('span.badge').exists()).toBe(true)
  })
})