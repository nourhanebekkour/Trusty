import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock du service compétences (chargé au onMounted) ─────────────────────────
// SkillModal appelle getCompetence() au montage. Sans mock, la liste est vide.
vi.mock('@/services/competence.service', () => ({
  getCompetence: vi.fn(),
}))

import { getCompetence } from '@/services/competence.service'
import SkillModal from '@/components/profile/SkillModal.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const MOCK_COMPETENCES = [
  { id_competence: '1', nom: 'Vue.js',          type: 'TECHNIQUE' },
  { id_competence: '2', nom: 'JavaScript',       type: 'TECHNIQUE' },
  { id_competence: '3', nom: 'PHP',              type: 'TECHNIQUE' },
  { id_competence: '4', nom: 'Laravel',          type: 'TECHNIQUE' },
  { id_competence: '5', nom: 'CSS',              type: 'TECHNIQUE' },
  { id_competence: '6', nom: 'HTML',             type: 'TECHNIQUE' },
  { id_competence: '7', nom: 'Python',           type: 'TECHNIQUE' },
  { id_competence: '8', nom: 'Git',              type: 'OUTIL' },
  { id_competence: '9', nom: 'Machine Learning', type: 'TECHNIQUE' },
]

const makeUser = (competenceNoms = []) => ({
  etudiant: {
    competences: competenceNoms.map(nom => {
      // Utilise le même id_competence que dans MOCK_COMPETENCES pour que le filtre fonctionne
      const match = MOCK_COMPETENCES.find(c => c.nom === nom)
      return { competence: { id_competence: match?.id_competence ?? nom, nom } }
    }),
  },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('SkillModal.vue', () => {
  let wrapper

  const mountComponent = async (user = makeUser()) => {
    getCompetence.mockResolvedValue(MOCK_COMPETENCES)
    const w = mount(SkillModal, { props: { user }, attachTo: document.body })
    await flushPromises()
    return w
  }

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
    it('affiche le titre "Ajouter une compétence"', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-modal-title').text()).toBe('Ajouter une compétence')
    })

    it('affiche le sous-titre', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-modal-subtitle').exists()).toBe(true)
    })

    it('affiche le champ de saisie', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-input').exists()).toBe(true)
    })

    it('affiche le bouton Annuler', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-btn-cancel').text()).toBe('Annuler')
    })

    it('affiche le bouton "+ Ajouter au profil"', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-btn-submit').text()).toContain('Ajouter au profil')
    })

    it('affiche la section suggestions', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-suggestions').exists()).toBe(true)
    })

    it('affiche les tags de suggestion après chargement', async () => {
      wrapper = await mountComponent()
      const tags = wrapper.findAll('.skill-tag-btn')
      expect(tags.length).toBeGreaterThan(0)
    })
  })

  // ── Suggestions chargées depuis l'API ─────────────────────────────────────────
  describe('Tags de suggestion', () => {
    it('affiche exactement les 9 compétences mockées', async () => {
      wrapper = await mountComponent()
      expect(wrapper.findAll('.skill-tag-btn')).toHaveLength(9)
    })

    it('affiche "Vue.js" dans les suggestions', async () => {
      wrapper = await mountComponent()
      const tags = wrapper.findAll('.skill-tag-btn')
      expect(tags.some(t => t.text() === 'Vue.js')).toBe(true)
    })

    it('ajoute la classe "active" au tag sélectionné', async () => {
      wrapper = await mountComponent()
      const jsTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'JavaScript')
      await jsTag.trigger('click')
      expect(jsTag.classes()).toContain('active')
    })

    it('retire la classe "active" des autres tags au changement de sélection', async () => {
      wrapper = await mountComponent()
      const tags = wrapper.findAll('.skill-tag-btn')
      await tags[0].trigger('click')
      await tags[1].trigger('click')
      expect(tags[0].classes()).not.toContain('active')
      expect(tags[1].classes()).toContain('active')
    })

    it('exclut les compétences déjà possédées', async () => {
      wrapper = await mountComponent(makeUser(['Vue.js']))
      const tags = wrapper.findAll('.skill-tag-btn')
      expect(tags.some(t => t.text() === 'Vue.js')).toBe(false)
      expect(tags).toHaveLength(8)
    })

    it('filtre les tags selon la recherche', async () => {
      wrapper = await mountComponent()
      await wrapper.find('.skill-input').setValue('python')
      const tags = wrapper.findAll('.skill-tag-btn')
      expect(tags.length).toBe(1)
      expect(tags[0].text()).toBe('Python')
    })
  })

  // ── Bouton submit ─────────────────────────────────────────────────────────────
  describe('État du bouton Ajouter', () => {
    it('est désactivé si aucune compétence n\'est sélectionnée', async () => {
      wrapper = await mountComponent()
      expect(wrapper.find('.skill-btn-submit').attributes('disabled')).toBeDefined()
    })

    it('est activé quand une compétence est sélectionnée depuis la liste', async () => {
      wrapper = await mountComponent()
      const tag = wrapper.findAll('.skill-tag-btn')[0]
      await tag.trigger('click')
      expect(wrapper.find('.skill-btn-submit').attributes('disabled')).toBeUndefined()
    })
  })

  // ── Soumission ────────────────────────────────────────────────────────────────
  describe('Soumission', () => {
    it('émet "added" avec la compétence sélectionnée et le niveau', async () => {
      wrapper = await mountComponent()
      const vueTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'Vue.js')
      await vueTag.trigger('click')
      await wrapper.find('.skill-btn-submit').trigger('click')
      const emitted = wrapper.emitted('added')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0].competence.nom).toBe('Vue.js')
      expect(emitted[0][0].niveau_maitrise).toBe('DEBUTANT')
    })

    it('remet la sélection à zéro après soumission', async () => {
      wrapper = await mountComponent()
      const vueTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'Vue.js')
      await vueTag.trigger('click')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.find('.skill-selected-badge').exists()).toBe(false)
    })

    it('affiche le message de succès après soumission', async () => {
      wrapper = await mountComponent()
      const vueTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'Vue.js')
      await vueTag.trigger('click')
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.find('.skill-success').exists()).toBe(true)
      expect(wrapper.find('.skill-success').text()).toContain('Vue.js')
    })

    it('cache le message de succès après 3 secondes', async () => {
      wrapper = await mountComponent()
      const vueTag = wrapper.findAll('.skill-tag-btn').find(t => t.text() === 'Vue.js')
      await vueTag.trigger('click')
      await wrapper.find('.skill-btn-submit').trigger('click')
      vi.advanceTimersByTime(3001)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.skill-success').exists()).toBe(false)
    })

    it('n\'émet pas "added" si aucune compétence n\'est sélectionnée', async () => {
      wrapper = await mountComponent()
      await wrapper.find('.skill-btn-submit').trigger('click')
      expect(wrapper.emitted('added')).toBeFalsy()
    })
  })

  // ── Événements de fermeture ───────────────────────────────────────────────────
  describe('Fermeture du modal', () => {
    it('émet "close" au clic sur le bouton Annuler', async () => {
      wrapper = await mountComponent()
      await wrapper.find('.skill-btn-cancel').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur le bouton de fermeture', async () => {
      wrapper = await mountComponent()
      await wrapper.find('.skill-modal-close').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur l\'overlay', async () => {
      wrapper = await mountComponent()
      await wrapper.find('.modal-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('n\'émet pas "close" au clic à l\'intérieur du modal', async () => {
      wrapper = await mountComponent()
      await wrapper.find('.skill-modal').trigger('click')
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })
})
