import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileCard from '@/components/profile/ProfileCard.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  prenom: 'Yassine',
  nom: 'Benali',
  email: 'yassine@example.com',
  role: 'Étudiant',
  specialite: 'Informatique',
  telephone: '+212 6 12 34 56 78',
  ville: 'Fès',
  date_creation: '2022-09-01T00:00:00Z',
  avatar: null,
  ...overrides,
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileCard.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser(), options = {}) =>
    mount(ProfileCard, {
      props: { user },
      global: { stubs: { RouterLink: true }, ...options.global },
    })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le prénom et le nom', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.profile-info h2').text()).toBe('Yassine Benali')
    })

    it('affiche l\'email', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.info-row').text()).toContain('yassine@example.com')
    })

    it('affiche le bouton "Modifier le profil"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.btn-outline').text()).toContain('Modifier le profil')
    })

    it('affiche le cover-banner', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.cover-banner').exists()).toBe(true)
    })

    it('affiche le conteneur avatar-wrapper', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.avatar-wrapper').exists()).toBe(true)
    })
  })

  // ── Avatar ────────────────────────────────────────────────────────────────────
  describe('Avatar', () => {
    it('affiche l\'image si user.avatar est défini', () => {
      wrapper = mountComponent(makeUser({ avatar: 'https://example.com/photo.jpg' }))
      const img = wrapper.find('.avatar img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/photo.jpg')
      expect(img.attributes('alt')).toBe('Yassine Benali')
    })

    it('n\'affiche pas le span des initiales si avatar est défini', () => {
      wrapper = mountComponent(makeUser({ avatar: 'https://example.com/photo.jpg' }))
      expect(wrapper.find('.avatar span:not(.online-dot)').exists()).toBe(false)
    })

    it('affiche les initiales si user.avatar est null', () => {
      wrapper = mountComponent(makeUser({ avatar: null }))
      expect(wrapper.find('.avatar img').exists()).toBe(false)
      const initials = wrapper.find('.avatar span:not(.online-dot)')
      expect(initials.text()).toBe('YB')
    })

    it('affiche max 2 initiales', () => {
      wrapper = mountComponent(makeUser({ prenom: 'Ali', nom: 'Ben Omar', avatar: null }))
      const initials = wrapper.find('.avatar span:not(.online-dot)')
      expect(initials.text()).toHaveLength(2)
    })

    it('affiche le point online-dot', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.online-dot').exists()).toBe(true)
    })
  })

  // ── Role / Spécialité ─────────────────────────────────────────────────────────
  describe('Role et spécialité', () => {
    it('affiche role si défini', () => {
      wrapper = mountComponent(makeUser({ role: 'Étudiant', specialite: 'Informatique' }))
      expect(wrapper.find('.role').text()).toBe('Étudiant')
    })

    it('affiche specialite si role est null/undefined', () => {
      wrapper = mountComponent(makeUser({ role: null, specialite: 'Génie Logiciel' }))
      expect(wrapper.find('.role').text()).toBe('Génie Logiciel')
    })

    it('n\'affiche pas .role si ni role ni specialite', () => {
      wrapper = mountComponent(makeUser({ role: null, specialite: null }))
      expect(wrapper.find('.role').exists()).toBe(false)
    })
  })

  // ── Champs optionnels ────────────────────────────────────────────────────────
  describe('Champs optionnels', () => {
    it('affiche le téléphone si défini', () => {
      wrapper = mountComponent(makeUser({ telephone: '+212 6 00 00 00 00' }))
      const rows = wrapper.findAll('.info-row')
      const phoneRow = rows.find(r => r.text().includes('+212'))
      expect(phoneRow).toBeTruthy()
    })

    it('n\'affiche pas le téléphone si undefined', () => {
      wrapper = mountComponent(makeUser({ telephone: undefined }))
      const rows = wrapper.findAll('.info-row')
      const phoneRow = rows.find(r => r.text().includes('📞'))
      expect(phoneRow).toBeUndefined()
    })

    it('affiche la ville si définie', () => {
      wrapper = mountComponent(makeUser({ ville: 'Casablanca' }))
      const rows = wrapper.findAll('.info-row')
      const villeRow = rows.find(r => r.text().includes('Casablanca'))
      expect(villeRow).toBeTruthy()
    })

    it('n\'affiche pas la ville si undefined', () => {
      wrapper = mountComponent(makeUser({ ville: undefined }))
      const rows = wrapper.findAll('.info-row')
      expect(rows.find(r => r.text().includes('📍'))).toBeUndefined()
    })

    it('affiche la date d\'inscription si définie', () => {
      wrapper = mountComponent(makeUser({ date_creation: '2022-09-01T00:00:00Z' }))
      const rows = wrapper.findAll('.info-row')
      const dateRow = rows.find(r => r.text().includes('📅'))
      expect(dateRow).toBeTruthy()
      expect(dateRow.text()).toContain('2022')
    })

    it('n\'affiche pas la date si date_creation est undefined', () => {
      wrapper = mountComponent(makeUser({ date_creation: undefined }))
      const rows = wrapper.findAll('.info-row')
      expect(rows.find(r => r.text().includes('📅'))).toBeUndefined()
    })
  })

  // ── Événements ────────────────────────────────────────────────────────────────
  describe('Événements', () => {
    it('émet "edit" au clic sur le bouton Modifier', async () => {
      wrapper = mountComponent()
      await wrapper.find('.btn-outline').trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')).toHaveLength(1)
    })
  })

  // ── Helpers internes ──────────────────────────────────────────────────────────
  describe('Helpers', () => {
    it('formatDate retourne une chaîne avec le mois et l\'année en français', () => {
      wrapper = mountComponent(makeUser({ date_creation: '2023-03-01T00:00:00Z' }))
      const rows = wrapper.findAll('.info-row')
      const dateRow = rows.find(r => r.text().includes('📅'))
      // mars 2023 ou March 2023 selon locale, on vérifie l'année
      expect(dateRow.text()).toContain('2023')
    })

    it('getInitials gère un nom à un seul mot', () => {
      wrapper = mountComponent(makeUser({ prenom: 'Yassine', nom: '', avatar: null }))
      const initials = wrapper.find('.avatar span:not(.online-dot)')
      expect(initials.text()).toBe('Y')
    })
  })
})