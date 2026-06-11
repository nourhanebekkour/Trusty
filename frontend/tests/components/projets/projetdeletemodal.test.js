import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetDeleteModal from '@/components/projets/projetDeleteModal.vue'

const PROJET = { id_projet: '1', titre: 'Mon projet' }

describe('ProjetDeleteModal.vue — visibilité', () => {
  it('s\'affiche quand modelValue est true', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('ne s\'affiche pas quand modelValue est false', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: false, projet: PROJET } })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })
})

describe('ProjetDeleteModal.vue — contenu', () => {
  it('affiche le titre du projet à supprimer', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    expect(wrapper.text()).toContain('Mon projet')
  })

  it('affiche le message de confirmation', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    expect(wrapper.text()).toContain('irréversible')
  })

  it('affiche le bouton Supprimer', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    expect(wrapper.find('.btn-delete').exists()).toBe(true)
  })

  it('affiche le bouton Annuler', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    expect(wrapper.find('.btn-cancel').exists()).toBe(true)
  })
})

describe('ProjetDeleteModal.vue — événements', () => {
  it('émet confirm au clic sur Supprimer', async () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET, submitting: false } })
    await wrapper.find('.btn-delete').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('émet update:modelValue=false au clic sur Annuler', async () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('émet update:modelValue=false au clic sur ×', async () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET } })
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('désactive le bouton Supprimer pendant submitting', () => {
    const wrapper = mount(ProjetDeleteModal, { props: { modelValue: true, projet: PROJET, submitting: true } })
    expect(wrapper.find('.btn-delete').attributes('disabled')).toBeDefined()
  })
})
