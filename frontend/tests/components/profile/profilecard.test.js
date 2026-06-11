import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileCard from '@/components/profile/ProfileCard.vue'

// ── Factory ────────────────────────────────────────────────────────────────────
// Reflète la structure attendue par ProfileCard.vue :
//   user.photo          (pas avatar)
//   user.etudiant.filiere  (pas user.specialite)
//   user.etudiant.ville    (pas user.ville)
const makeUser = (overrides = {}) => ({
  prenom: 'Yassine',
  nom: 'Benali',
  email: 'yassine@example.com',
  role: 'Étudiant',
  telephone: '+212 6 12 34 56 78',
  date_creation: '2022-09-01T00:00:00Z',
  photo: null,
  etudiant: {
    filiere: 'Informatique',
    ville: 'Fès',
  },
  ...overrides,
})

// ── Suite ──────────────────────────────────────────────────────────────────────
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
      expect(wrapper.find('.btn-edit').text()).toContain('Modifier le profil')
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
    it('affiche l\'image si user.photo est défini', () => {
      wrapper = mountComponent(makeUser({ photo: 'https://example.com/photo.jpg' }))
      const img = wrapper.find('.avatar img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/photo.jpg')
      expect(img.attributes('alt')).toBe('Yassine Benali')
    })

    it('n\'affiche pas le span des initiales si photo est définie', () => {
      wrapper = mountComponent(makeUser({ photo: 'https://example.com/photo.jpg' }))
      expect(wrapper.find('.avatar .initials').exists()).toBe(false)
    })

    it('affiche les initiales si user.photo est null', () => {
      wrapper = mountComponent(makeUser({ photo: null }))
      expect(wrapper.find('.avatar img').exists()).toBe(false)
      const initials = wrapper.find('.avatar .initials')
      expect(initials.text()).toBe('YB')
    })

    it('affiche max 2 initiales', () => {
      wrapper = mountComponent(makeUser({ prenom: 'Ali', nom: 'Ben Omar', photo: null }))
      const initials = wrapper.find('.avatar .initials')
      expect(initials.text()).toHaveLength(2)
    })
  })

  // ── Role / Filière ────────────────────────────────────────────────────────────
  // Le composant sépare le rôle (.role-badge) et la filière (.filiere-line).
  describe('Role et filière', () => {
    it('affiche le role dans .role-badge', () => {
      wrapper = mountComponent(makeUser({ role: 'ETUDIANT', etudiant: { filiere: 'Informatique' } }))
      expect(wrapper.find('.role-badge').text()).toContain('Étudiant')
    })

    it('affiche la filiere dans .filiere-line', () => {
      wrapper = mountComponent(makeUser({ role: 'ETUDIANT', etudiant: { filiere: 'Informatique' } }))
      expect(wrapper.find('.filiere-line').text()).toContain('Informatique')
    })

    it('affiche la filière dans .filiere-line même si role est null', () => {
      wrapper = mountComponent(makeUser({ role: null, etudiant: { filiere: 'Génie Logiciel' } }))
      expect(wrapper.find('.filiere-line').text()).toContain('Génie Logiciel')
    })

    it('n\'affiche pas .filiere-line si filière est null', () => {
      wrapper = mountComponent(makeUser({ role: null, etudiant: { filiere: null } }))
      expect(wrapper.find('.filiere-line').exists()).toBe(false)
    })
  })

  // ── Champs optionnels ────────────────────────────────────────────────────────
  describe('Champs optionnels', () => {
    it('affiche le téléphone si défini', () => {
      wrapper = mountComponent(makeUser({ telephone: '+212 6 00 00 00 00' }))
      const rows = wrapper.findAll('.info-row')
      expect(rows.find(r => r.text().includes('+212'))).toBeTruthy()
    })

    it('n\'affiche pas le téléphone si undefined', () => {
      wrapper = mountComponent(makeUser({ telephone: undefined }))
      const rows = wrapper.findAll('.info-row')
      expect(rows.find(r => r.text().includes('📞'))).toBeUndefined()
    })

    it('affiche la ville si définie', () => {
      wrapper = mountComponent(makeUser({ etudiant: { ville: 'Casablanca' } }))
      const rows = wrapper.findAll('.info-row')
      expect(rows.find(r => r.text().includes('Casablanca'))).toBeTruthy()
    })

    it('n\'affiche pas la ville si undefined', () => {
      wrapper = mountComponent(makeUser({ etudiant: { ville: undefined } }))
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
      await wrapper.find('.btn-edit').trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')).toHaveLength(1)
    })
  })

  // ── Helpers internes ──────────────────────────────────────────────────────────
  describe('Helpers', () => {
    it('formatDate retourne une chaîne avec l\'année en français', () => {
      wrapper = mountComponent(makeUser({ date_creation: '2023-03-01T00:00:00Z' }))
      const rows = wrapper.findAll('.info-row')
      const dateRow = rows.find(r => r.text().includes('📅'))
      expect(dateRow.text()).toContain('2023')
    })

    it('getInitials gère un nom à un seul mot', () => {
      wrapper = mountComponent(makeUser({ prenom: 'Yassine', nom: '', photo: null }))
      const initials = wrapper.find('.avatar .initials')
      expect(initials.text()).toBe('Y')
    })
  })
})
