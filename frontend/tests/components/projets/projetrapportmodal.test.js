import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetRapportModal from '@/components/projets/ProjetRapportModal.vue'

beforeEach(() => vi.clearAllMocks())

const mountModal  = () => mount(ProjetRapportModal, { props: { modelValue: true  } })
const mountHidden = () => mount(ProjetRapportModal, { props: { modelValue: false } })

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProjetRapportModal
// ═══════════════════════════════════════════════════════

describe('ProjetRapportModal.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountModal().exists()).toBe(true)
  })

  it('2 — .rapport-modal est caché si modelValue = false', () => {
    expect(mountHidden().find('.rapport-modal').exists()).toBe(false)
  })

  it('3 — .rapport-modal est visible si modelValue = true', () => {
    expect(mountModal().find('.rapport-modal').exists()).toBe(true)
  })

  it('4 — affiche le titre "Joindre un rapport" dans .rapport-title', () => {
    expect(mountModal().find('.rapport-title').text()).toBe('Joindre un rapport')
  })

  it('5 — affiche le hint exact dans .rapport-hint', () => {
    expect(mountModal().find('.rapport-hint').text()).toContain(
      'Téléversez un fichier ou collez une URL publique vers votre rapport.'
    )
  })

  it('6 — affiche la zone de dépôt .upload-zone', () => {
    expect(mountModal().find('.upload-zone').exists()).toBe(true)
  })

  it('7 — le bouton .btn-save est désactivé par défaut (aucune sélection)', () => {
    expect(mountModal().find('.btn-save').attributes('disabled')).toBeDefined()
  })

  it('8 — le bouton .btn-cancel affiche "Annuler"', () => {
    expect(mountModal().find('.btn-cancel').text()).toBe('Annuler')
  })

  it('9 — affiche le champ URL .form-input', () => {
    expect(mountModal().find('.form-input').exists()).toBe(true)
  })

  it('10 — affiche le label "URL du rapport"', () => {
    expect(mountModal().text()).toContain('URL du rapport')
  })

  it('11 — .rapport-overlay est absent si modelValue = false', () => {
    expect(mountHidden().find('.modal-overlay').exists()).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProjetRapportModal
// ═══════════════════════════════════════════════════════

describe('ProjetRapportModal.vue — Tests d\'Intégration', () => {

  it('12 — clic sur .rapport-close émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.rapport-close').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('13 — clic sur .btn-cancel émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('14 — saisie d\'une URL active le bouton .btn-save', async () => {
    const wrapper = mountModal()
    await wrapper.find('.form-input').setValue('https://drive.google.com/rapport.pdf')
    expect(wrapper.find('.btn-save').attributes('disabled')).toBeUndefined()
  })

  it('15 — clic sur .btn-save avec URL émet "save" avec type = "url"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.form-input').setValue('https://drive.google.com/rapport.pdf')
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0][0].type).toBe('url')
  })

  it('16 — clic sur .btn-save avec URL émet "save" avec l\'url correcte', async () => {
    const wrapper = mountModal()
    await wrapper.find('.form-input').setValue('https://drive.google.com/rapport.pdf')
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')[0][0].url).toBe('https://drive.google.com/rapport.pdf')
  })

  it('17 — save émet aussi "update:modelValue" false (ferme le modal)', async () => {
    const wrapper = mountModal()
    await wrapper.find('.form-input').setValue('https://example.com/rapport.pdf')
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('18 — le .btn-save reste désactivé tant que l\'URL est vide', async () => {
    const wrapper = mountModal()
    await wrapper.find('.form-input').setValue('   ')
    expect(wrapper.find('.btn-save').attributes('disabled')).toBeDefined()
  })

  it('19 — après fermeture puis réouverture, le champ URL est réinitialisé', async () => {
    const wrapper = mountModal()
    await wrapper.find('.form-input').setValue('https://drive.google.com/rapport.pdf')
    expect(wrapper.find('.btn-save').attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.find('.btn-save').attributes('disabled')).toBeDefined()
  })
})
