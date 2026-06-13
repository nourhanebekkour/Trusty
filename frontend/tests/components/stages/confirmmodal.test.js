import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '@/components/stages/ConfirmModal.vue'

beforeEach(() => vi.clearAllMocks())

const PROPS_DEFAULT = {
  modelValue:  true,
  title:       'Supprimer le stage',
  message:     'Cette action est irréversible.',
  confirmText: 'Supprimer',
}

const mountModal  = (props = {}) => mount(ConfirmModal, { props: { ...PROPS_DEFAULT, ...props } })
const mountHidden = ()            => mount(ConfirmModal, { props: { ...PROPS_DEFAULT, modelValue: false } })

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ConfirmModal
// ═══════════════════════════════════════════════════════

describe('ConfirmModal.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountModal().exists()).toBe(true)
  })

  it('2 — ne rend pas .confirm-modal si modelValue = false', () => {
    expect(mountHidden().find('.confirm-modal').exists()).toBe(false)
  })

  it('3 — rend .confirm-overlay si modelValue = true', () => {
    expect(mountModal().find('.confirm-overlay').exists()).toBe(true)
  })

  it('4 — rend .confirm-modal si modelValue = true', () => {
    expect(mountModal().find('.confirm-modal').exists()).toBe(true)
  })

  it('5 — affiche le titre dans .confirm-title', () => {
    expect(mountModal().find('.confirm-title').text()).toBe('Supprimer le stage')
  })

  it('6 — affiche le message dans .confirm-message', () => {
    expect(mountModal().find('.confirm-message').text()).toBe('Cette action est irréversible.')
  })

  it('7 — affiche le texte confirmText dans .btn-danger', () => {
    expect(mountModal().find('.btn-danger').text()).toBe('Supprimer')
  })

  it('8 — .btn-cancel affiche "Annuler"', () => {
    expect(mountModal().find('.btn-cancel').text()).toBe('Annuler')
  })

  it('9 — affiche un élément dans .confirm-icon', () => {
    // Source uses AppIcon component (not literal ⚠ emoji text)
    expect(mountModal().find('.confirm-icon').exists()).toBe(true)
  })

  it('10 — title par défaut est "Confirmer"', () => {
    const wrapper = mount(ConfirmModal, { props: { modelValue: true } })
    expect(wrapper.find('.confirm-title').text()).toBe('Confirmer')
  })

  it('11 — message par défaut est "Êtes-vous sûr ?"', () => {
    const wrapper = mount(ConfirmModal, { props: { modelValue: true } })
    expect(wrapper.find('.confirm-message').text()).toBe('Êtes-vous sûr ?')
  })

  it('12 — confirmText par défaut est "Confirmer"', () => {
    const wrapper = mount(ConfirmModal, { props: { modelValue: true } })
    expect(wrapper.find('.btn-danger').text()).toBe('Confirmer')
  })

  it('13 — un titre personnalisé différent s\'affiche correctement', () => {
    const wrapper = mountModal({ title: 'Archiver la candidature' })
    expect(wrapper.find('.confirm-title').text()).toBe('Archiver la candidature')
  })

  it('14 — un message personnalisé s\'affiche correctement', () => {
    const wrapper = mountModal({ message: 'Le stage sera définitivement supprimé.' })
    expect(wrapper.find('.confirm-message').text()).toBe('Le stage sera définitivement supprimé.')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ConfirmModal
// ═══════════════════════════════════════════════════════

describe('ConfirmModal.vue — Tests d\'Intégration', () => {

  it('15 — clic sur .btn-danger émet "confirm"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-danger').trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('16 — clic sur .btn-danger émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-danger').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('17 — clic sur .btn-cancel émet "cancel"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('18 — clic sur .btn-cancel émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('19 — clic sur .confirm-overlay (backdrop) émet "cancel"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.confirm-overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('20 — clic sur .confirm-overlay (backdrop) émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.confirm-overlay').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('21 — confirmer n\'émet pas "cancel"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-danger').trigger('click')
    expect(wrapper.emitted('cancel')).toBeFalsy()
  })

  it('22 — annuler n\'émet pas "confirm"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('confirm')).toBeFalsy()
  })
})
