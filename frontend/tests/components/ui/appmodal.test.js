import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppModal from '@/components/ui/AppModal.vue'

describe('AppModal.vue', () => {
  const defaultProps = {
    show: true,
    title: 'Titre test',
  }

  it('ne rend rien quand show est false', () => {
    const wrapper = mount(AppModal, {
      props: { ...defaultProps, show: false },
    })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('affiche le modal quand show est true', () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('affiche le titre correctement', () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.modal__title').text()).toBe('Titre test')
  })

  it('affiche le sous-titre quand fourni', () => {
    const wrapper = mount(AppModal, {
      props: { ...defaultProps, subtitle: 'Sous-titre test' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.modal__subtitle').exists()).toBe(true)
    expect(wrapper.find('.modal__subtitle').text()).toBe('Sous-titre test')
  })

  it("n'affiche pas le sous-titre par défaut", () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.modal__subtitle').exists()).toBe(false)
  })

  it("émet 'close' en cliquant sur le bouton ✕", async () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.modal__close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it("émet 'close' en cliquant sur l'overlay", async () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it("émet 'close' en cliquant sur Annuler", async () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    const cancelBtn = wrapper.findAll('.btn').find(b => b.text() === 'Annuler')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it("émet 'confirm' en cliquant sur le bouton primary", async () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.btn--primary').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('affiche le slot par défaut dans le body', () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      slots: { default: '<p class="slot-content">Contenu slot</p>' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.slot-content').exists()).toBe(true)
  })

  it('affiche le slot confirm-label personnalisé', () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      slots: { 'confirm-label': 'Valider' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.btn--primary').text()).toBe('Valider')
  })

  it('affiche "Enregistrer le profil" par défaut dans le bouton confirm', () => {
    const wrapper = mount(AppModal, {
      props: defaultProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.btn--primary').text()).toBe('Enregistrer le profil')
  })
})