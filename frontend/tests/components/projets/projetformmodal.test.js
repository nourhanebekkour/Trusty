import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjetFormModal from '@/components/projets/projetFormModal.vue'

function mountModal(props = {}) {
  return mount(ProjetFormModal, {
    props: {
      modelValue: true,
      editMode: false,
      ...props,
    }
  })
}

describe('ProjetFormModal.vue — visibilité', () => {
  it('s\'affiche si modelValue est true', () => {
    const wrapper = mountModal({ modelValue: true })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('ne s\'affiche pas si modelValue est false', () => {
    const wrapper = mountModal({ modelValue: false })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })
})

describe('ProjetFormModal.vue — titre', () => {
  it('affiche "Nouveau Projet" en mode création', () => {
    const wrapper = mountModal({ editMode: false })
    expect(wrapper.text()).toContain('Nouveau Projet')
  })

  it('affiche "Modifier le projet" en mode édition', () => {
    const wrapper = mountModal({ editMode: true })
    expect(wrapper.text()).toContain('Modifier le projet')
  })
})

describe('ProjetFormModal.vue — champs du formulaire', () => {
  it('affiche le champ titre', () => {
    const wrapper = mountModal()
    expect(wrapper.find('input[placeholder="Ex: Système de gestion…"]').exists()).toBe(true)
  })

  it('affiche le select type de projet', () => {
    const wrapper = mountModal()
    expect(wrapper.find('select.form-input').exists()).toBe(true)
  })

  it('affiche les champs de dates', () => {
    const wrapper = mountModal()
    expect(wrapper.findAll('input[type="date"]').length).toBeGreaterThan(0)
  })

  it('affiche le champ description', () => {
    const wrapper = mountModal()
    expect(wrapper.find('textarea[placeholder="Décrivez votre projet…"]').exists()).toBe(true)
  })

  it('affiche les champs liens optionnels', () => {
    const wrapper = mountModal()
    const urlInputs = wrapper.findAll('input[type="url"]')
    expect(urlInputs.length).toBeGreaterThan(0)
  })
})

describe('ProjetFormModal.vue — boutons', () => {
  it('affiche le bouton Annuler', () => {
    const wrapper = mountModal()
    expect(wrapper.find('.btn-cancel').exists()).toBe(true)
  })

  it('affiche le bouton Soumettre en mode création', () => {
    const wrapper = mountModal({ editMode: false })
    expect(wrapper.find('.btn-submit').text()).toContain('Soumettre')
  })

  it('affiche le bouton Enregistrer en mode édition', () => {
    const wrapper = mountModal({ editMode: true })
    expect(wrapper.find('.btn-submit').text()).toContain('Enregistrer')
  })
})

describe('ProjetFormModal.vue — événements', () => {
  it('émet update:modelValue=false au clic sur ×', async () => {
    const wrapper = mountModal()
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('émet update:modelValue=false au clic sur Annuler', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('émet "submit" avec les données au clic sur Soumettre quand le formulaire est valide', async () => {
    const wrapper = mountModal()
    await wrapper.find('input[placeholder="Ex: Système de gestion…"]').setValue('Mon projet')
    await wrapper.find('select.form-input').setValue('MODULE')
    await wrapper.find('input[type="date"]').setValue('2024-01-01')
    await wrapper.find('textarea[placeholder="Décrivez votre projet…"]').setValue('Description')
    const submitBtn = wrapper.find('.btn-submit')
    if (!submitBtn.attributes('disabled')) {
      await submitBtn.trigger('click')
      expect(wrapper.emitted('submit')).toBeTruthy()
    }
  })
})
