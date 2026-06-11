import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileEditModal from '@/components/profile/ProfileEditModal.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  prenom:    'Yassine',
  nom:       'Benali',
  email:     'yassine@test.com',
  telephone: '+212 6 12 34 56 78',
  etudiant:  { ville: 'Fès', pays: 'Maroc' },
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

  afterEach(() => {
    wrapper?.unmount()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Modifier le profil"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.modal-header h3').text()).toBe('Modifier le profil')
    })

    it('affiche 7 inputs éditables (hors radio de visibilité)', () => {
      wrapper = mountComponent()
      const inputs = wrapper.findAll('input:not([type="radio"])')
      expect(inputs).toHaveLength(7)
    })

    it('affiche le bouton Annuler', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.btn-cancel').text()).toBe('Annuler')
    })

    it('affiche le bouton Enregistrer quand saving=false', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.btn-save').text()).toContain('Enregistrer')
    })

    it('affiche "Enregistrement..." quand saving=true', () => {
      wrapper = mountComponent(makeUser(), true)
      expect(wrapper.find('.btn-save').text()).toContain('Enregistrement...')
    })

    it('désactive le bouton Enregistrer quand saving=true', () => {
      wrapper = mountComponent(makeUser(), true)
      expect(wrapper.find('.btn-save').attributes('disabled')).toBeDefined()
    })

    it('active le bouton Enregistrer quand saving=false', () => {
      wrapper = mountComponent(makeUser(), false)
      expect(wrapper.find('.btn-save').attributes('disabled')).toBeUndefined()
    })
  })

  // ── Champs verrouillés (prénom, nom, email, téléphone) ─────────────────────
  // Ces champs sont en lecture seule (.locked-value) — non modifiables via input
  describe('Champs verrouillés', () => {
    it('affiche le prénom dans .locked-value', () => {
      wrapper = mountComponent()
      const values = wrapper.findAll('.locked-value')
      expect(values[0].text()).toBe('Yassine')
    })

    it('affiche le nom dans .locked-value', () => {
      wrapper = mountComponent()
      const values = wrapper.findAll('.locked-value')
      expect(values[1].text()).toBe('Benali')
    })

    it('affiche le téléphone dans .locked-value', () => {
      wrapper = mountComponent()
      const values = wrapper.findAll('.locked-value')
      expect(values.some(v => v.text().includes('+212 6 12 34 56 78'))).toBe(true)
    })

    it('affiche "—" si téléphone est null', () => {
      wrapper = mountComponent(makeUser({ telephone: null }))
      const values = wrapper.findAll('.locked-value')
      expect(values.some(v => v.text() === '—')).toBe(true)
    })
  })

  // ── Initialisation du formulaire éditable ─────────────────────────────────
  describe('Initialisation du formulaire depuis les props', () => {
    it('pré-remplit le champ ville', () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Tanger, Rabat..."]')
      expect(input.element.value).toBe('Fès')
    })

    it('pré-remplit le champ pays', () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Maroc"]')
      expect(input.element.value).toBe('Maroc')
    })

    it('utilise une chaîne vide si ville est null/undefined', () => {
      wrapper = mountComponent(makeUser({ etudiant: { ville: undefined } }))
      const input = wrapper.find('input[placeholder="Tanger, Rabat..."]')
      expect(input.element.value).toBe('')
    })

    it('initialise le formulaire selon les props reçues', () => {
      const user = makeUser({ etudiant: { ville: 'Agadir', pays: 'Maroc' } })
      wrapper = mountComponent(user)
      const villeInput = wrapper.find('input[placeholder="Tanger, Rabat..."]')
      expect(villeInput.element.value).toBe('Agadir')
    })
  })

  // ── Réactivité des champs éditables ───────────────────────────────────────
  describe('Réactivité des champs', () => {
    it('met à jour la ville quand l\'utilisateur tape', async () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="Tanger, Rabat..."]')
      await input.setValue('Rabat')
      expect(input.element.value).toBe('Rabat')
    })

    it('met à jour le username GitHub quand l\'utilisateur tape', async () => {
      wrapper = mountComponent()
      const input = wrapper.find('input[placeholder="votre-username"]')
      await input.setValue('myhandle')
      expect(input.element.value).toBe('myhandle')
    })
  })

  // ── Événements émis ──────────────────────────────────────────────────────
  describe('Événements', () => {
    it('émet "close" au clic sur le bouton ✕', async () => {
      wrapper = mountComponent()
      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "close" au clic sur le bouton Annuler', async () => {
      wrapper = mountComponent()
      await wrapper.find('.btn-cancel').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('émet "save" au clic sur Enregistrer', async () => {
      wrapper = mountComponent()
      await wrapper.find('.btn-save').trigger('click')
      expect(wrapper.emitted('save')).toBeTruthy()
    })

    it('n\'émet pas "save" quand saving=true (bouton désactivé)', async () => {
      wrapper = mountComponent(makeUser(), true)
      await wrapper.find('.btn-save').trigger('click')
      expect(wrapper.emitted('save')).toBeFalsy()
    })

    it('émet "save" avec la ville mise à jour', async () => {
      wrapper = mountComponent()
      await wrapper.find('input[placeholder="Tanger, Rabat..."]').setValue('Marrakech')
      await wrapper.find('.btn-save').trigger('click')
      const emitted = wrapper.emitted('save')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toMatchObject({ ville: 'Marrakech' })
    })
  })

  // ── Labels du formulaire ─────────────────────────────────────────────────
  describe('Labels du formulaire éditable', () => {
    it('affiche les labels des champs éditables', () => {
      wrapper = mountComponent()
      const labels = wrapper.findAll('label')
      const texts = labels.map(l => l.text())
      expect(texts).toContain('Ville')
      expect(texts).toContain('Pays')
    })

    it('affiche les labels des champs verrouillés', () => {
      wrapper = mountComponent()
      const lockedLabels = wrapper.findAll('.locked-label')
      const texts = lockedLabels.map(l => l.text())
      expect(texts).toContain('Prénom')
      expect(texts).toContain('Nom')
      expect(texts).toContain('Téléphone')
    })
  })
})
