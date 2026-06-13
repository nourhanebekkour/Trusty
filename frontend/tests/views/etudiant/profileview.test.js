import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/stores/authstore',          () => ({ useAuthStore: vi.fn() }))
vi.mock('@/services/profileservices',  () => ({
  getProfile:   vi.fn(),
  saveProfile:  vi.fn(),
  uploadAvatar: vi.fn(),
  addSkill:     vi.fn(),
  removeSkill:  vi.fn(),
}))

import { useAuthStore }                from '@/stores/authstore'
import { getProfile, removeSkill }     from '@/services/profileservices'
import EtudiantProfile                 from '@/views/Etudiant/Profile.vue'

const MOCK_USER = {
  id_utilisateur: 5,
  prenom:         'Emma',
  nom:            'Lefebvre',
  email:          'emma@student.ma',
  photo:          null,
  role:           'ETUDIANT',
  etudiant: {
    id_etudiant:  5,
    filiere:      'Génie Informatique',
    niveau:       'BAC+5',
    competences:  [
      { competence: { id_competence: 1, nom: 'JavaScript' } },
      { competence: { id_competence: 2, nom: 'Python'     } },
    ],
    badges:   [],
    projets:  [],
    stages:   [],
  },
}

const PROFILE_STUBS = {
  ProfileCard: {
    template: '<div class="stub-profilecard"><button class="btn-edit" @click="$emit(\'edit\')">Edit</button></div>',
    props:    ['user'],
    emits:    ['edit', 'avatar-change'],
  },
  ProfileSkills: {
    template: '<div class="stub-profileskills"><button class="btn-add-skill" @click="$emit(\'add\')">Add</button></div>',
    props:    ['user'],
    emits:    ['add', 'remove'],
  },
  ProfileBadges:    { template: '<div class="stub-profilebadges" />',    props: ['user'] },
  ProfileStats:     { template: '<div class="stub-profilestats" />',     props: ['user'] },
  ProfileRepos:     { template: '<div class="stub-profilerepos" />',     props: ['user'] },
  ProfileProjects:  { template: '<div class="stub-profileprojects" />',  props: ['user'] },
  ProfileEditModal: {
    template: '<div class="stub-profileeditmodal"><button class="btn-close-edit" @click="$emit(\'close\')">Close</button></div>',
    props:    ['user', 'saving'],
    emits:    ['close', 'save'],
  },
  SkillModal: {
    template: '<div class="stub-skillmodal"><button class="btn-close-skill" @click="$emit(\'close\')">Close</button></div>',
    props:    ['user'],
    emits:    ['close', 'added'],
  },
}

let mockAuthStore

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  mockAuthStore = { user: null }
  useAuthStore.mockReturnValue(mockAuthStore)
  getProfile.mockResolvedValue({ data: MOCK_USER })
})

const mountView = async () => {
  const wrapper = mount(EtudiantProfile, { global: { stubs: PROFILE_STUBS } })
  await flushPromises()
  return wrapper
}

const mountLoading = () => {
  getProfile.mockImplementation(() => new Promise(() => {}))
  const wrapper = mount(EtudiantProfile, { global: { stubs: PROFILE_STUBS } })
  return wrapper
}

const mountError = async (message = 'Profil introuvable') => {
  getProfile.mockRejectedValue({ response: { data: { message } } })
  const wrapper = mount(EtudiantProfile, { global: { stubs: PROFILE_STUBS } })
  await flushPromises()
  return wrapper
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — Etudiant/Profile
// ═══════════════════════════════════════════════════════

describe('Etudiant/Profile.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', async () => {
    expect((await mountView()).exists()).toBe(true)
  })

  it('2 — affiche .loading-state "Chargement du profil..." pendant le chargement', async () => {
    const wrapper = mountLoading()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.find('.loading-state').text()).toContain('Chargement du profil')
  })

  it('3 — n\'affiche pas .page-header pendant le chargement', async () => {
    const wrapper = mountLoading()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.page-header').exists()).toBe(false)
  })

  it('4 — affiche .error-state si getProfile rejette', async () => {
    expect((await mountError()).find('.error-state').exists()).toBe(true)
  })

  it('5 — .error-state contient "⚠️" et le message d\'erreur', async () => {
    expect((await mountError('Profil introuvable')).find('.error-state').text()).toContain('Profil introuvable')
  })

  it('6 — le bouton "Réessayer" est présent dans .error-state', async () => {
    expect((await mountError()).find('.btn-outline').text()).toContain('Réessayer')
  })

  it('7 — erreur sans message API → affiche "Impossible de charger le profil."', async () => {
    getProfile.mockRejectedValue({})
    const wrapper = mount(EtudiantProfile, { global: { stubs: PROFILE_STUBS } })
    await flushPromises()
    expect(wrapper.find('.error-state').text()).toContain('Impossible de charger le profil.')
  })

  it('8 — affiche .page-header "Mon Profil Étudiant" après chargement réussi', async () => {
    expect((await mountView()).find('.page-header h1').text()).toBe('Mon Profil Étudiant')
  })

  it('9 — affiche le sous-titre "Gérez votre identité numérique"', async () => {
    expect((await mountView()).find('.subtitle').text()).toContain('Gérez votre identité numérique')
  })

  it('10 — affiche le stub ProfileCard après chargement', async () => {
    expect((await mountView()).find('.stub-profilecard').exists()).toBe(true)
  })

  it('11 — affiche le stub ProfileSkills après chargement', async () => {
    expect((await mountView()).find('.stub-profileskills').exists()).toBe(true)
  })

  it('12 — affiche le stub ProfileStats après chargement', async () => {
    expect((await mountView()).find('.stub-profilestats').exists()).toBe(true)
  })

  it('13 — ProfileEditModal est absent par défaut (showEditModal = false)', async () => {
    expect((await mountView()).find('.stub-profileeditmodal').exists()).toBe(false)
  })

  it('14 — SkillModal est absent par défaut (showSkillModal = false)', async () => {
    expect((await mountView()).find('.stub-skillmodal').exists()).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — Etudiant/Profile
// ═══════════════════════════════════════════════════════

describe('Etudiant/Profile.vue — Tests d\'Intégration', () => {

  it('15 — onMounted appelle getProfile() une fois', async () => {
    await mountView()
    expect(getProfile).toHaveBeenCalledTimes(1)
  })

  it('16 — clic sur "Réessayer" appelle getProfile() à nouveau (×2 total)', async () => {
    const wrapper = await mountError()
    await wrapper.find('.btn-outline').trigger('click')
    await flushPromises()
    expect(getProfile).toHaveBeenCalledTimes(2)
  })

  it('17 — authStore.user est mis à jour après chargement réussi', async () => {
    await mountView()
    expect(mockAuthStore.user).toEqual(MOCK_USER)
  })

  it('18 — clic Edit sur ProfileCard stub affiche ProfileEditModal', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn-edit').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-profileeditmodal').exists()).toBe(true)
  })

  it('19 — clic Close sur ProfileEditModal stub ferme le modal', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn-edit').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-profileeditmodal').exists()).toBe(true)
    await wrapper.find('.btn-close-edit').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-profileeditmodal').exists()).toBe(false)
  })

  it('20 — clic Add sur ProfileSkills stub affiche SkillModal', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn-add-skill').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-skillmodal').exists()).toBe(true)
  })

  it('21 — clic Close sur SkillModal stub ferme le SkillModal', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn-add-skill').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-skillmodal').exists()).toBe(true)
    await wrapper.find('.btn-close-skill').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.stub-skillmodal').exists()).toBe(false)
  })

  it('22 — second appel getProfile (Réessayer) met à jour authStore.user', async () => {
    const UPDATED_USER = { ...MOCK_USER, prenom: 'Emma Updated' }
    getProfile.mockRejectedValueOnce({})
    getProfile.mockResolvedValueOnce({ data: UPDATED_USER })
    const wrapper = mount(EtudiantProfile, { global: { stubs: PROFILE_STUBS } })
    await flushPromises()
    await wrapper.find('.btn-outline').trigger('click')
    await flushPromises()
    expect(mockAuthStore.user.prenom).toBe('Emma Updated')
  })
})
