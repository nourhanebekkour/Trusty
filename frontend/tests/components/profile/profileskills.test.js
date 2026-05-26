import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileSkills from '@/components/profile/ProfileSkills.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeCompetence = (id, nom) => ({
  competence: { id_competence: id, nom },
})

const makeUser = (competences = []) => ({
  etudiant: { competences },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileSkills.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser()) =>
    mount(ProfileSkills, { props: { user } })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Compétences"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.section-header h3').text()).toBe('Compétences')
    })

    it('affiche le bouton "+ Ajouter"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.add-btn').text()).toBe('+ Ajouter')
    })
  })

  // ── État vide ────────────────────────────────────────────────────────────────
  describe('État vide', () => {
    it('affiche le message "Aucune compétence ajoutée." quand la liste est vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.empty-msg').text()).toBe('Aucune compétence ajoutée.')
    })

    it('n\'affiche pas les tags quand la liste est vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.tags').exists()).toBe(false)
    })

    it('affiche le message vide quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })

    it('affiche le message vide quand competences est undefined', () => {
      wrapper = mountComponent({ etudiant: {} })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })
  })

  // ── Affichage des compétences ─────────────────────────────────────────────────
  describe('Affichage des compétences', () => {
    it('affiche les tags quand des compétences existent', () => {
      wrapper = mountComponent(makeUser([makeCompetence(1, 'Vue.js')]))
      expect(wrapper.find('.tags').exists()).toBe(true)
      expect(wrapper.find('.empty-msg').exists()).toBe(false)
    })

    it('affiche le bon nombre de tags', () => {
      const competences = [
        makeCompetence(1, 'Vue.js'),
        makeCompetence(2, 'JavaScript'),
        makeCompetence(3, 'PHP'),
      ]
      wrapper = mountComponent(makeUser(competences))
      expect(wrapper.findAll('.tag')).toHaveLength(3)
    })

    it('affiche le nom de chaque compétence', () => {
      wrapper = mountComponent(makeUser([
        makeCompetence(1, 'Vue.js'),
        makeCompetence(2, 'Laravel'),
      ]))
      const tags = wrapper.findAll('.tag')
      expect(tags[0].text()).toBe('Vue.js')
      expect(tags[1].text()).toBe('Laravel')
    })

    it('utilise id_competence comme clé unique (pas de doublons visuels)', () => {
      const competences = [
        makeCompetence(10, 'Python'),
        makeCompetence(20, 'Django'),
      ]
      wrapper = mountComponent(makeUser(competences))
      const tags = wrapper.findAll('.tag')
      expect(tags).toHaveLength(2)
    })
  })

  // ── Événements ────────────────────────────────────────────────────────────────
  describe('Événements', () => {
    it('émet "add" au clic sur le bouton "+ Ajouter"', async () => {
      wrapper = mountComponent()
      await wrapper.find('.add-btn').trigger('click')
      expect(wrapper.emitted('add')).toBeTruthy()
      expect(wrapper.emitted('add')).toHaveLength(1)
    })

    it('n\'émet qu\'une seule fois par clic', async () => {
      wrapper = mountComponent()
      await wrapper.find('.add-btn').trigger('click')
      await wrapper.find('.add-btn').trigger('click')
      expect(wrapper.emitted('add')).toHaveLength(2)
    })
  })

  // ── Props ─────────────────────────────────────────────────────────────────────
  describe('Props', () => {
    it('accepte la prop user de type Object', () => {
      const user = makeUser([makeCompetence(1, 'Git')])
      wrapper = mountComponent(user)
      expect(wrapper.props('user')).toEqual(user)
    })
  })
})