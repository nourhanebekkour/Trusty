import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, nextTick } from 'vitest'
import ProfileEditModal from '@/components/profile/ProfileEditModal.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  prenom: 'Yassine',
  nom: 'Benali',
  telephone: '+212 6 12 34 56 78',
  etudiant: { ville: 'Fès' },
  ...overrides,
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileEditModal.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser(), saving = false) =>
    mount(ProfileEditModal, {
      props: { user, saving },
      attachTo: document.body,
    })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Modifier le profil"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.modal-header h3').text()).toBe('Modifier le profil')
    })

    it('affiche les 7 champs du formulaire', () => {
      wrapper = mountComponent()
      const inputs = wrapper.findAll('input')
      expect(inputs).toHaveLength(7)
    })

    it('affiche le bouton Annuler', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.btn-outline').text()).toBe('Annuler')
    })

    it('affiche le bouton Enregistrer quand saving=false', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.btn-primary').text()).toBe('Enregistrer')
    })

    it('affiche "Enregistrement..." quand saving=true', () => {
      wrapper = mountComponent(makeUser(), true)
      expect(wrapper.find('.btn-primary').text()).toBe('Enregistrement...')
    })

    it('désactive le bouton Enregistrer quand saving=true', () => {
      wrapper = mountComponent(makeUser(), true)
      expect(wrapper.find('.btn-primary').attributes('disabled')).toBeDefined()
    })

    it('active le bouton Enregistrer quand saving=false', () => {
      wrapper = mountComponent(makeUser(), false)
      expect(wrapper.find('.btn-primary').attributes('disabled')).toBeUndefined()
    })
  })

  // ── Initialisation du formulaire ──────────────────────────────────────────────
  describe('Initialisation du formulaire depuis les props', () => {
    it('pré-remplit le champ prénom', () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Prénom"]')
      expect(input.element.value).toBe('Yassine')
    })

    it('pré-remplit le champ nom', () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Nom"]')
      expect(input.element.value).toBe('Benali')
    })

    it('pré-remplit le champ téléphone', () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="+212 6 ..."]')
      expect(input.element.value).toBe('+212 6 12 34 56 78')
    })

    it('pré-remplit le champ ville', () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Fès, Maroc"]')
      expect(input.element.value).toBe('Fès')
    })

    it('utilise une chaîne vide si le champ est null/undefined', () => {
      wrapper = mountComponent(makeUser({ telephone: null, etudiant: { ville: undefined } }))
      const tel = wrapper.find('input[placeholder="+212 6 ..."]')
      const ville = wrapper.find('input[placeholder="Fès, Maroc"]')
      expect(tel.element.value).toBe('')
      expect(ville.element.value).toBe('')
    })
  })

  // ── Réactivité du formulaire ──────────────────────────────────────────────────
  describe('Réactivité des champs', () => {
    it('met à jour le modèle quand l\'utilisateur tape dans prénom', async () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Prénom"]')
      await input.setValue('Ahmed')
      expect(input.element.value).toBe('Ahmed')
    })

    it('met à jour le modèle quand l\'utilisateur tape dans ville', async () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Fès, Maroc"]')
      await input.setValue('Rabat')
      expect(input.element.value).toBe('Rabat')
    })
  })

  // ── Watch sur props.user ──────────────────────────────────────────────────────
  describe('Watch sur props.user', () => {
    it('initialise le formulaire avec un user différent au montage', () => {
      const newUser = makeUser({ prenom: 'Karim', nom: 'Alami', telephone: '+212 7 00 00 00 00', etudiant: { ville: 'Agadir' } })
      wrapper = mountComponent(newUser)
      expect(wrapper.find('input[placeholder="Prénom"]').element.value).toBe('Karim')
      expect(wrapper.find('input[placeholder="Nom"]').element.value).toBe('Alami')
      expect(wrapper.find('input[placeholder="+212 6 ..."]').element.value).toBe('+212 7 00 00 00 00')
      expect(wrapper.find('input[placeholder="Fès, Maroc"]').element.value).toBe('Agadir')
    })

    it('le formulaire reflète les champs de l\'objet user reçu', () => {
      const cases = [
        { prenom: 'Omar',  nom: 'Filali',  telephone: '+212 6 99 99 99 99', ville: 'Rabat'  },
        { prenom: 'Salma', nom: 'Tahiri',  telephone: '',                   ville: 'Agadir' },
        { prenom: 'Mehdi', nom: 'Idrissi', telephone: '+212 5 11 22 33 44', ville: 'Fès'    },
      ]
      cases.forEach(({ prenom, nom, telephone, ville }) => {
        wrapper = mountComponent(makeUser({ prenom, nom, telephone, etudiant: { ville } }))
        expect(wrapper.find('input[placeholder="Prénom"]').element.value).toBe(prenom)
        expect(wrapper.find('input[placeholder="Nom"]').element.value).toBe(nom)
        expect(wrapper.find('input[placeholder="Fès, Maroc"]').element.value).toBe(ville)
      })
    })
  })

  // ── Événements émis ──────────────────────────────────────────────────────────
  describe('Événements', () => {
    it('émet "close" au clic sur le bouton ✕', async () => {
      wrapper = mountComponent()
      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur le bouton Annuler', async () => {
      wrapper = mountComponent()
      await wrapper.find('.btn-outline').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur l\'overlay', async () => {
      wrapper = mountComponent()
      await wrapper.find('.modal-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('n\'émet pas "close" au clic à l\'intérieur du modal', async () => {
      wrapper = mountComponent()
      await wrapper.find('.modal').trigger('click')
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('émet "save" avec les données du formulaire au clic sur Enregistrer', async () => {
      wrapper = mountComponent()
      await wrapper.find('input[placeholder="Prénom"]').setValue('Omar')
      await wrapper.find('input[placeholder="Fès, Maroc"]').setValue('Marrakech')
      await wrapper.find('.btn-primary').trigger('click')

      const emitted = wrapper.emitted('save')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toMatchObject({
        prenom: 'Omar',
        nom: 'Benali',
        ville: 'Marrakech',
        telephone: '+212 6 12 34 56 78',
      })
    })

    it('n\'émet pas "save" quand saving=true (bouton désactivé)', async () => {
      wrapper = mountComponent(makeUser(), true)
      await wrapper.find('.btn-primary').trigger('click')
      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  // ── Labels ────────────────────────────────────────────────────────────────────
  describe('Labels du formulaire', () => {
    it('affiche les labels principaux', () => {
      wrapper = mountComponent()
      const labels = wrapper.findAll('label')
      const texts = labels.map(l => l.text())
      expect(texts).toContain('Prénom')
      expect(texts).toContain('Nom')
      expect(texts).toContain('Téléphone')
      expect(texts).toContain('Ville')
    })
  })
})
