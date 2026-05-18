import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SkillModal from '@/components/profile/SkillModal.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeUser = (competences = []) => ({
  etudiant: {
    competences: competences.map(nom => ({ competence: { id_competence: Math.random(), nom } })),
  },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('SkillModal.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser()) =>
    mount(SkillModal, {
      props: { user },
      attachTo: document.body,
    })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    wrapper?.unmount()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Ajouter une compétence"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-modal-title').text()).toBe('Ajouter une compétence')
    })

    it('affiche le sous-titre', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-modal-subtitle').exists()).toBe(true)
    })

    it('affiche le champ de saisie', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-input').exists()).toBe(true)
    })

    it('affiche le bouton Annuler', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-btn-cancel').text()).toBe('Annuler')
    })

    it('affiche le bouton "+ Ajouter au profil"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-btn-submit').text()).toBe('+ Ajouter au profil')
    })

    it('affiche la section suggestions', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-suggestions').exists()).toBe(true)
    })

    it('affiche les tags de suggestion', () => {
      wrapper = mountComponent()
      const tags = wrapper.findAll('.skill-tag-btn')
      expect(tags.length).toBeGreaterThan(0)
    })
  })

  // ── Suggestions ──────────────────────────────────────────────────────────────
  describe('Tags de suggestion', () => {
    const expected = ['Vue.js', 'JavaScript', 'PHP', 'Laravel', 'CSS', 'HTML', 'Python', 'Git', 'Machine Learning']

    it('affiche exactement les 9 suggestions', () => {
      wrapper = mountComponent()
      expect(wrapper.findAll('.skill-tag-btn')).toHaveLength(9)
    })

    expected.forEach(tag => {
      it(`affiche le tag "${tag}"`, () => {
        wrapper = mountComponent()
        const tags = wrapper.findAll('.skill-tag-btn')
        expect(tags.some(t => t.text() === tag)).toBe(true)
      })
    })

    it('renseigne l\'input au clic sur un tag', async () => {
      wrapper = mountComponent()
      const vueTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'Vue.js')
      await vueTag.trigger('click')
      expect(wrapper.find('.skill-input').element.value).toBe('Vue.js')
    })

    it('ajoute la classe "active" au tag sélectionné', async () => {
      wrapper = mountComponent()
      const jsTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'JavaScript')
      await jsTag.trigger('click')
      expect(jsTag.classes()).toContain('active')
    })

    it('retire la classe "active" des autres tags', async () => {
      wrapper = mountComponent()
      const tags = wrapper.findAll('.skill-tag-btn')
      await tags[0].trigger('click')
      await tags[1].trigger('click')
      expect(tags[0].classes()).not.toContain('active')
      expect(tags[1].classes()).toContain('active')
    })
  })

  // ── Bouton submit ─────────────────────────────────────────────────────────────
  describe('État du bouton Ajouter', () => {
    it('est désactivé si le champ est vide', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.skill-btn-submit').attributes('disabled')).toBeDefined()
    })

    it('est désactivé si le champ ne contient que des espaces', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('   ')
      expect(wrapper.find('.skill-btn-submit').attributes('disabled')).toBeDefined()
    })

    it('est activé si le champ contient du texte', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('React')
      expect(wrapper.find('.skill-btn-submit').attributes('disabled')).toBeUndefined()
    })
  })

  // ── Soumission ────────────────────────────────────────────────────────────────
  describe('Soumission', () => {
    it('émet "added" avec le nom de la compétence', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('Docker')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.emitted('added')).toBeTruthy()
      expect(wrapper.emitted('added')[0][0]).toBe('Docker')
    })

    it('vide le champ après ajout', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('Docker')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.find('.skill-input').element.value).toBe('')
    })

    it('affiche le message de succès après ajout', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('Docker')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.find('.skill-success').exists()).toBe(true)
      expect(wrapper.find('.skill-success').text()).toContain('Docker')
    })

    it('cache le message de succès après 3 secondes', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('Docker')
      await wrapper.find('.skill-btn-submit').trigger('click')
      vi.advanceTimersByTime(3001)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.skill-success').exists()).toBe(false)
    })

    it('soumet via la touche Enter', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('Kubernetes')
      await wrapper.find('.skill-input').trigger('keyup.enter')
      expect(wrapper.emitted('added')).toBeTruthy()
      expect(wrapper.emitted('added')[0][0]).toBe('Kubernetes')
    })

    it('n\'émet pas "added" si le champ est vide', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('')
      await wrapper.find('.skill-input').trigger('keyup.enter')
      expect(wrapper.emitted('added')).toBeFalsy()
    })

    it('n\'émet pas "added" si la compétence existe déjà', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      wrapper = mountComponent(makeUser(['Vue.js']))
      await wrapper.find('.skill-input').setValue('Vue.js')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.emitted('added')).toBeFalsy()
      expect(alertMock).toHaveBeenCalledWith('Cette compétence est déjà dans votre profil.')
      alertMock.mockRestore()
    })

    it('vide le champ si la compétence existe déjà', async () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {})
      wrapper = mountComponent(makeUser(['PHP']))
      await wrapper.find('.skill-input').setValue('PHP')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.find('.skill-input').element.value).toBe('')
    })

    it('trimme les espaces avant soumission', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-input').setValue('  React  ')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.emitted('added')[0][0]).toBe('React')
    })
  })

  // ── Événements de fermeture ───────────────────────────────────────────────────
  describe('Fermeture du modal', () => {
    it('émet "close" au clic sur le bouton Annuler', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-btn-cancel').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur le bouton ✕ (close)', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-modal-close').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur l\'overlay', async () => {
      wrapper = mountComponent()
      await wrapper.find('.modal-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('n\'émet pas "close" au clic à l\'intérieur du modal', async () => {
      wrapper = mountComponent()
      await wrapper.find('.skill-modal').trigger('click')
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })
})