import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia }  from 'pinia'
import Profile from '@/views/Etudiant/Profile.vue'

// ─── Mocks des services ────────────────────────────────────────────────────────
vi.mock('@/services/profileservices', () => ({
  getProfile:   vi.fn(),
  saveProfile:  vi.fn(),
  addSkill:     vi.fn(),
  uploadAvatar: vi.fn(),
}))

// ─── Mocks des composants enfants (stubs légers) ──────────────────────────────
vi.mock('@/components/profile/ProfileCard.vue',      () => ({ default: { name: 'ProfileCard',      template: '<div class="stub-profile-card"      @click="$emit(\'edit\')"><slot/></div>', emits: ["edit"]  } }))
vi.mock('@/components/profile/ProfileStats.vue',     () => ({ default: { name: 'ProfileStats',     template: '<div class="stub-profile-stats"></div>'                                                       } }))
vi.mock('@/components/profile/ProfileSkills.vue',    () => ({ default: { name: 'ProfileSkills',    template: '<div class="stub-profile-skills"   @click="$emit(\'add\')"><slot/></div>', emits: ["add"]   } }))
vi.mock('@/components/profile/ProfileBadges.vue',    () => ({ default: { name: 'ProfileBadges',    template: '<div class="stub-profile-badges"></div>'                                                      } }))
vi.mock('@/components/profile/ProfileRepos.vue',     () => ({ default: { name: 'ProfileRepos',     template: '<div class="stub-profile-repos"></div>'                                                       } }))
vi.mock('@/components/profile/ProfileProjects.vue',  () => ({ default: { name: 'ProfileProjects',  template: '<div class="stub-profile-projects"></div>'                                                    } }))
vi.mock('@/components/profile/ProfileEditModal.vue', () => ({
  default: {
    name: 'ProfileEditModal',
    props: ['user', 'saving'],
    emits: ['close', 'save'],
    template: `
      <div class="stub-edit-modal">
        <button class="stub-close" @click="$emit('close')">close</button>
        <button class="stub-save"  @click="$emit('save', { prenom: 'Updated', nom: 'User', telephone: '', ville: 'Rabat' })">save</button>
      </div>`,
  },
}))
vi.mock('@/components/profile/SkillModal.vue', () => ({
  default: {
    name: 'SkillModal',
    props: ['user'],
    emits: ['close', 'added'],
    template: `
      <div class="stub-skill-modal">
        <button class="stub-close"    @click="$emit('close')">close</button>
        <button class="stub-add-skill" @click="$emit('added', 'Docker')">add</button>
      </div>`,
  },
}))

// ─── Mock du store Pinia ───────────────────────────────────────────────────────
vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({ user: null })),
}))

import { getProfile, saveProfile, addSkill } from '@/services/profileservices'
import { useAuthStore } from '@/stores/authstore'

// ─── Données de test ──────────────────────────────────────────────────────────
// Factory : deep clone à chaque appel pour éviter la mutation entre tests
const makeMockUser = () => ({
  id_utilisateur: 'user-001',
  prenom: 'Ahmed',
  nom:    'Benali',
  email:  'ahmed@test.ma',
  role:   'ETUDIANT',
  date_creation: '2023-09-01T00:00:00.000Z',
  etudiant: {
    ville: 'Fès',
    competences: [
      { competence: { id_competence: 'c1', nom: 'Vue.js' } },
    ],
    badges: [],
    depots_github: [],
    participations_projets: [],
  },
})
const MOCK_USER = makeMockUser()

const makeUpdatedUser = () => {
  const base = makeMockUser()
  return { ...base, prenom: 'Updated', nom: 'User', etudiant: { ...base.etudiant, ville: 'Rabat' } }
}
const UPDATED_USER = makeUpdatedUser()

// ─── Helper de montage ─────────────────────────────────────────────────────────
// authStore est créé une seule fois par test et partagé via la closure du beforeEach.
let _sharedAuthStore = { user: null }

const mountView = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  // Toujours retourner la MÊME référence pour que la vue et le test partagent l'objet
  useAuthStore.mockReturnValue(_sharedAuthStore)

  return mount(Profile, {
    global: {
      plugins: [pinia],
      stubs: { RouterLink: true },
    },
  })
}

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('Profile.vue (vue principale)', () => {
  let wrapper
  let authStore

  beforeEach(() => {
    vi.clearAllMocks()
    // Réinitialiser le store partagé ET la variable locale qui y pointe
    _sharedAuthStore = { user: null }
    authStore = _sharedAuthStore
    useAuthStore.mockReturnValue(_sharedAuthStore)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  // ════════════════════════════════════════════════════════════════════════════
  // État de chargement
  // ════════════════════════════════════════════════════════════════════════════
  describe('État de chargement', () => {
    it('affiche le spinner pendant le chargement', async () => {
      // Promesse qui ne résout jamais → loading reste true
      getProfile.mockReturnValue(new Promise(() => {}))
      wrapper = mountView()
      // Ne pas appeler flushPromises : on veut l'état PENDANT le chargement.
      // Vue exécute onMounted de façon synchrone dans JSDOM, loading passe à true
      // avant la résolution de la promesse. On force un tick DOM puis on vérifie.
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.loading-state').exists()).toBe(true)
      expect(wrapper.find('.spinner').exists()).toBe(true)
    })

    it('affiche le texte "Chargement du profil..."', async () => {
      getProfile.mockReturnValue(new Promise(() => {}))
      wrapper = mountView()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.loading-state p').text()).toContain('Chargement du profil')
    })

    it('masque le spinner après le chargement', async () => {
      getProfile.mockResolvedValue({ data: MOCK_USER })
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.loading-state').exists()).toBe(false)
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // État d'erreur
  // ════════════════════════════════════════════════════════════════════════════
  describe('État d\'erreur', () => {
    it('affiche le message d\'erreur si getProfile rejette', async () => {
      getProfile.mockRejectedValue({ response: { data: { message: 'Serveur indisponible' } } })
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.error-state').exists()).toBe(true)
      expect(wrapper.find('.error-state p').text()).toContain('Serveur indisponible')
    })

    it('affiche le message d\'erreur par défaut si pas de message serveur', async () => {
      getProfile.mockRejectedValue(new Error('Network Error'))
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.error-state p').text()).toContain('Impossible de charger le profil')
    })

    it('affiche un bouton "Réessayer"', async () => {
      getProfile.mockRejectedValue(new Error('fail'))
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.error-state .btn-outline').text()).toContain('Réessayer')
    })

    it('relance loadProfile au clic sur Réessayer', async () => {
      getProfile
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ data: MOCK_USER })
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.error-state .btn-outline').trigger('click')
      await flushPromises()
      expect(getProfile).toHaveBeenCalledTimes(2)
      expect(wrapper.find('.error-state').exists()).toBe(false)
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // Chargement réussi
  // ════════════════════════════════════════════════════════════════════════════
  describe('Chargement réussi', () => {
    beforeEach(() => {
      getProfile.mockResolvedValue({ data: MOCK_USER })
    })

    it('appelle getProfile au montage (onMounted)', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(getProfile).toHaveBeenCalledTimes(1)
    })

    it('affiche le header "Mon Profil Étudiant"', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.page-header h1').text()).toBe('Mon Profil Étudiant')
    })

    it('affiche le sous-titre', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.page-header .subtitle').exists()).toBe(true)
    })

    it('affiche la grille de profil', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.profile-grid').exists()).toBe(true)
    })

    it('affiche ProfileCard', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-profile-card').exists()).toBe(true)
    })

    it('affiche ProfileStats', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-profile-stats').exists()).toBe(true)
    })

    it('affiche ProfileSkills', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-profile-skills').exists()).toBe(true)
    })

    it('affiche ProfileBadges', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-profile-badges').exists()).toBe(true)
    })

    it('affiche ProfileRepos', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-profile-repos').exists()).toBe(true)
    })

    it('affiche ProfileProjects', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-profile-projects').exists()).toBe(true)
    })

    it('met à jour authStore.user après chargement', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(authStore.user).toEqual(MOCK_USER)
    })

    it('n\'affiche pas le modal d\'édition par défaut', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-edit-modal').exists()).toBe(false)
    })

    it('n\'affiche pas le modal de compétence par défaut', async () => {
      wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.stub-skill-modal').exists()).toBe(false)
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // Modal d'édition du profil
  // ════════════════════════════════════════════════════════════════════════════
  describe('Modal d\'édition du profil', () => {
    beforeEach(() => {
      getProfile.mockResolvedValue({ data: MOCK_USER })
    })

    it('ouvre le modal d\'édition quand ProfileCard émet "edit"', async () => {
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      expect(wrapper.find('.stub-edit-modal').exists()).toBe(true)
    })

    it('ferme le modal quand il émet "close"', async () => {
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      await wrapper.find('.stub-close').trigger('click')
      expect(wrapper.find('.stub-edit-modal').exists()).toBe(false)
    })

    it('appelle saveProfile avec l\'id utilisateur et le formData', async () => {
      saveProfile.mockResolvedValue({ data: UPDATED_USER })
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      await wrapper.find('.stub-save').trigger('click')
      await flushPromises()
      expect(saveProfile).toHaveBeenCalledWith('user-001', expect.objectContaining({ prenom: 'Updated' }))
    })

    it('met à jour user.value après sauvegarde réussie', async () => {
      saveProfile.mockResolvedValue({ data: UPDATED_USER })
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      await wrapper.find('.stub-save').trigger('click')
      await flushPromises()
      expect(authStore.user).toEqual(UPDATED_USER)
    })

    it('ferme le modal après sauvegarde réussie', async () => {
      saveProfile.mockResolvedValue({ data: UPDATED_USER })
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      await wrapper.find('.stub-save').trigger('click')
      await flushPromises()
      expect(wrapper.find('.stub-edit-modal').exists()).toBe(false)
    })

    it('affiche une alerte si saveProfile échoue', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      saveProfile.mockRejectedValue({ response: { data: { message: 'Erreur serveur' } } })
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      await wrapper.find('.stub-save').trigger('click')
      await flushPromises()
      expect(alertMock).toHaveBeenCalledWith('Erreur serveur')
      alertMock.mockRestore()
    })

    it('affiche l\'alerte par défaut si pas de message serveur', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      saveProfile.mockRejectedValue(new Error('fail'))
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-card').trigger('click')
      await wrapper.find('.stub-save').trigger('click')
      await flushPromises()
      expect(alertMock).toHaveBeenCalledWith('Erreur lors de la mise à jour.')
      alertMock.mockRestore()
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // Modal d'ajout de compétence
  // ════════════════════════════════════════════════════════════════════════════
  describe('Modal d\'ajout de compétence (SkillModal)', () => {
    beforeEach(() => {
      getProfile.mockResolvedValue({ data: MOCK_USER })
    })

    it('ouvre le modal de compétence quand ProfileSkills émet "add"', async () => {
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-skills').trigger('click')
      expect(wrapper.find('.stub-skill-modal').exists()).toBe(true)
    })

    it('ferme le modal de compétence quand il émet "close"', async () => {
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-skills').trigger('click')
      await wrapper.find('.stub-close').trigger('click')
      expect(wrapper.find('.stub-skill-modal').exists()).toBe(false)
    })

    it('appelle addSkill avec le nom de la compétence', async () => {
      addSkill.mockResolvedValue({ data: { competence: { id_competence: 'new-1', nom: 'Docker' } } })
      wrapper = mountView()
      await flushPromises()
      await wrapper.find('.stub-profile-skills').trigger('click')
      await wrapper.find('.stub-add-skill').trigger('click')
      await flushPromises()
      expect(addSkill).toHaveBeenCalledWith('user-001', 'Docker')
    })

    it('ajoute la compétence à user.etudiant.competences', async () => {
      // Fresh mock user pour ce test (évite la mutation des autres tests)
      getProfile.mockResolvedValue({ data: makeMockUser() })
      addSkill.mockResolvedValue({ data: { competence: { id_competence: 'new-1', nom: 'Docker' } } })
      wrapper = mountView()
      await flushPromises()
      const before = wrapper.vm.user.etudiant.competences.length
      await wrapper.find('.stub-profile-skills').trigger('click')
      await wrapper.find('.stub-add-skill').trigger('click')
      await flushPromises()
      expect(wrapper.vm.user.etudiant.competences).toHaveLength(before + 1)
      expect(wrapper.vm.user.etudiant.competences[before].competence.nom).toBe('Docker')
    })

    it('ajoute la compétence en fallback local si addSkill échoue', async () => {
      getProfile.mockResolvedValue({ data: makeMockUser() })
      addSkill.mockRejectedValue(new Error('API down'))
      wrapper = mountView()
      await flushPromises()
      const before = wrapper.vm.user.etudiant.competences.length
      await wrapper.find('.stub-profile-skills').trigger('click')
      await wrapper.find('.stub-add-skill').trigger('click')
      await flushPromises()
      // Fallback : compétence ajoutée localement
      expect(wrapper.vm.user.etudiant.competences).toHaveLength(before + 1)
      expect(wrapper.vm.user.etudiant.competences[before].competence.nom).toBe('Docker')
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // Intégration complète (scénario end-to-end dans la vue)
  // ════════════════════════════════════════════════════════════════════════════
  describe('Intégration : cycle de vie complet', () => {
    it('charge → édite → sauvegarde → affiche le profil mis à jour', async () => {
      getProfile.mockResolvedValue({ data: makeMockUser() })
      saveProfile.mockResolvedValue({ data: makeUpdatedUser() })

      wrapper = mountView()
      await flushPromises()

      // 1. Profil chargé
      expect(wrapper.find('.profile-grid').exists()).toBe(true)

      // 2. Ouvrir modal
      await wrapper.find('.stub-profile-card').trigger('click')
      expect(wrapper.find('.stub-edit-modal').exists()).toBe(true)

      // 3. Sauvegarder
      await wrapper.find('.stub-save').trigger('click')
      await flushPromises()

      // 4. Modal fermé, store mis à jour
      expect(wrapper.find('.stub-edit-modal').exists()).toBe(false)
      expect(authStore.user.prenom).toBe('Updated')
    })

    it('charge → ajoute compétence → liste mise à jour', async () => {
      getProfile.mockResolvedValue({ data: MOCK_USER })
      addSkill.mockResolvedValue({ data: { competence: { id_competence: 'new-1', nom: 'Docker' } } })

      wrapper = mountView()
      await flushPromises()

      const before = wrapper.vm.user.etudiant.competences.length

      await wrapper.find('.stub-profile-skills').trigger('click')
      await wrapper.find('.stub-add-skill').trigger('click')
      await flushPromises()

      expect(wrapper.vm.user.etudiant.competences.length).toBe(before + 1)
    })

    it('erreur → réessayer → affiche le profil', async () => {
      getProfile
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ data: MOCK_USER })

      wrapper = mountView()
      await flushPromises()

      expect(wrapper.find('.error-state').exists()).toBe(true)

      await wrapper.find('.error-state .btn-outline').trigger('click')
      await flushPromises()

      expect(wrapper.find('.profile-grid').exists()).toBe(true)
      expect(wrapper.find('.error-state').exists()).toBe(false)
    })
  })
})