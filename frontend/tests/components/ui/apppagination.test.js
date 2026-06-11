import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppPagination from '@/components/ui/AppPagination.vue'

describe('AppPagination.vue', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 25,
    perPage: 5,
  }

  it('affiche les informations de pagination correctement', () => {
    const wrapper = mount(AppPagination, { props: defaultProps })
    expect(wrapper.find('.pagination__info').text()).toContain('1-5 sur 25')
  })

  it('calcule correctement "from" et "to" sur la dernière page', () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 5 },
    })
    expect(wrapper.find('.pagination__info').text()).toContain('21-25 sur 25')
  })

  it('calcule "to" correctement quand la dernière page est incomplète', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 3, totalPages: 3, totalItems: 13, perPage: 5 },
    })
    expect(wrapper.find('.pagination__info').text()).toContain('11-13 sur 13')
  })

  it('désactive le bouton Précédent sur la première page', () => {
    const wrapper = mount(AppPagination, { props: defaultProps })
    const prevBtn = wrapper.findAll('button').find(b => b.text() === 'Précédent')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('désactive le bouton Suivant sur la dernière page', () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 5 },
    })
    const nextBtn = wrapper.findAll('button').find(b => b.text() === 'Suivant')
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('active les deux boutons sur une page intermédiaire', () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 3 },
    })
    const prevBtn = wrapper.findAll('button').find(b => b.text() === 'Précédent')
    const nextBtn = wrapper.findAll('button').find(b => b.text() === 'Suivant')
    expect(prevBtn.attributes('disabled')).toBeUndefined()
    expect(nextBtn.attributes('disabled')).toBeUndefined()
  })

  it("émet 'page-change' avec la page précédente en cliquant Précédent", async () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 3 },
    })
    const prevBtn = wrapper.findAll('button').find(b => b.text() === 'Précédent')
    await prevBtn.trigger('click')
    expect(wrapper.emitted('page-change')?.[0]).toEqual([2])
  })

  it("émet 'page-change' avec la page suivante en cliquant Suivant", async () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 2 },
    })
    const nextBtn = wrapper.findAll('button').find(b => b.text() === 'Suivant')
    await nextBtn.trigger('click')
    expect(wrapper.emitted('page-change')?.[0]).toEqual([3])
  })

  it("émet 'page-change' avec le bon numéro en cliquant un numéro de page", async () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 1 },
    })
    const pageBtn = wrapper.findAll('button').find(b => b.text() === '3')
    await pageBtn.trigger('click')
    expect(wrapper.emitted('page-change')?.[0]).toEqual([3])
  })

  it('applique la classe active sur la page courante', () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, currentPage: 2 },
    })
    const activeBtn = wrapper.find('button.active')
    expect(activeBtn.text()).toBe('2')
  })

  it('affiche des points de suspension pour beaucoup de pages', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 5, totalPages: 10, totalItems: 100, perPage: 10 },
    })
    const dots = wrapper.findAll('.pagination__dots')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('affiche toutes les pages quand totalPages ≤ 5', () => {
    const wrapper = mount(AppPagination, { props: defaultProps })
    const pageButtons = wrapper
      .findAll('button')
      .filter(b => !['Précédent', 'Suivant'].includes(b.text()))
    expect(pageButtons.length).toBe(5)
  })

  it("affiche le label d'éléments personnalisé", () => {
    const wrapper = mount(AppPagination, {
      props: { ...defaultProps, itemLabel: 'utilisateurs' },
    })
    expect(wrapper.find('.pagination__info').text()).toContain('utilisateurs')
  })
})