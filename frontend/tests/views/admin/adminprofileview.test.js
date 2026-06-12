import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/stores/authstore', () => ({ useAuthStore: vi.fn() }))
vi.mock('vue-router',         () => ({ useRouter:    vi.fn() }))
vi.mock('@/services/api',     () => ({ default: { patch: vi.fn().mockResolvedValue({}) } }))

import { useAuthStore } from '@/stores/authstore'
import { useRouter }    from 'vue-router'
import api              from '@/services/api'
import AdminProfile     from '@/views/admin/AdminProfile.vue'

const MOCK_USER = {
  id:            1,
  prenom:        'Fatine',
  nom:           'Bendiher',
  email:         'fatine@admin.ma',
  telephone:     '+212600000001',
  role:          'ADMINISTRATEUR',
  ecole:         'ENSA Tanger',
  status_compte: 'ACTIF',
}

let mockReplace
let mockAuthStore

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  mockReplace  = vi.fn()
  mockAuthStore = { user: { ...MOCK_USER } }
  useRouter.mockReturnValue({ push: vi.fn(), replace: mockReplace })
  useAuthStore.mockReturnValue(mockAuthStore)
})

const mountView = async (userOverrides = {}) => {
  mockAuthStore = { user: userOverrides === null ? null : { ...MOCK_USER, ...userOverrides } }
  useAuthStore.mockReturnValue(mockAuthStore)
  const wrapper = mount(AdminProfile)
  await flushPromises()
  return wrapper
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — AdminProfile
// ═══════════════════════════════════════════════════════

describe('AdminProfile.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', async () => {
    expect((await mountView()).exists()).toBe(true)
  })

  it('2 — affiche "Mon Profil" dans .page__title', async () => {
    expect((await mountView()).find('.page__title').text()).toBe('Mon Profil')
  })

  it('3 — affiche le sous-titre "Informations personnelles"', async () => {
    expect((await mountView()).find('.page__subtitle').text()).toContain('Informations personnelles')
  })

  it('4 — affiche le bouton "Enregistrer"', async () => {
    expect((await mountView()).find('.btn.btn--primary').text()).toBe('Enregistrer')
  })

  it('5 — affiche "Informations" dans le 1er .card__title', async () => {
    const titles = (await mountView()).findAll('.card__title')
    expect(titles[0].text()).toBe('Informations')
  })

  it('6 — affiche "Rôle & Statut" dans le 2ème .card__title', async () => {
    const titles = (await mountView()).findAll('.card__title')
    expect(titles[1].text()).toBe('Rôle & Statut')
  })

  it('7 — le champ Prénom est pré-rempli avec la valeur de auth.user', async () => {
    const inputs = (await mountView()).findAll('input[type="text"]')
    expect(inputs[0].element.value).toBe('Fatine')
  })

  it('8 — le champ Nom est pré-rempli avec la valeur de auth.user', async () => {
    const inputs = (await mountView()).findAll('input[type="text"]')
    expect(inputs[1].element.value).toBe('Bendiher')
  })

  it('9 — le champ Email est pré-rempli avec la valeur de auth.user', async () => {
    expect((await mountView()).find('input[type="email"]').element.value).toBe('fatine@admin.ma')
  })

  it('10 — le champ Téléphone est pré-rempli avec la valeur de auth.user', async () => {
    expect((await mountView()).find('input[type="tel"]').element.value).toBe('+212600000001')
  })

  it('11 — affiche "Administrateur" dans .info-grid pour le rôle ADMINISTRATEUR', async () => {
    expect((await mountView()).find('.info-grid').text()).toContain('Administrateur')
  })

  it('12 — affiche l\'école dans .info-grid', async () => {
    expect((await mountView()).find('.info-grid').text()).toContain('ENSA Tanger')
  })

  it('13 — affiche le statut "ACTIF" dans .info-grid', async () => {
    expect((await mountView()).find('.info-grid').text()).toContain('ACTIF')
  })

  it('14 — n\'affiche pas de message .msg par défaut', async () => {
    expect((await mountView()).find('.msg').exists()).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — AdminProfile
// ═══════════════════════════════════════════════════════

describe('AdminProfile.vue — Tests d\'Intégration', () => {

  it('15 — si rôle !== ADMINISTRATEUR, router.replace("/login") est appelé', async () => {
    useAuthStore.mockReturnValue({ user: { role: 'ETUDIANT' } })
    mount(AdminProfile)
    await flushPromises()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('16 — si user = null, router.replace("/login") est appelé', async () => {
    useAuthStore.mockReturnValue({ user: null })
    mount(AdminProfile)
    await flushPromises()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('17 — clic sur Enregistrer appelle api.patch("/utilisateurs/profil")', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn.btn--primary').trigger('click')
    await flushPromises()
    expect(api.patch).toHaveBeenCalledWith('/utilisateurs/profil', expect.any(Object))
  })

  it('18 — api.patch est appelé avec les données du formulaire', async () => {
    const wrapper = await mountView()
    await wrapper.findAll('input[type="text"]')[0].setValue('Nouvelle')
    await wrapper.findAll('input[type="text"]')[1].setValue('Valeur')
    await wrapper.find('.btn.btn--primary').trigger('click')
    await flushPromises()
    expect(api.patch).toHaveBeenCalledWith('/utilisateurs/profil', expect.objectContaining({
      prenom: 'Nouvelle',
      nom:    'Valeur',
    }))
  })

  it('19 — après sauvegarde réussie, affiche "Profil mis à jour" dans .msg.msg--ok', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn.btn--primary').trigger('click')
    await flushPromises()
    expect(wrapper.find('.msg.msg--ok').text()).toContain('Profil mis à jour')
  })

  it('20 — après erreur API, affiche .msg.msg--error', async () => {
    api.patch.mockRejectedValueOnce({ response: { data: { message: 'Accès refusé' } } })
    const wrapper = await mountView()
    await wrapper.find('.btn.btn--primary').trigger('click')
    await flushPromises()
    expect(wrapper.find('.msg.msg--error').exists()).toBe(true)
    expect(wrapper.find('.msg.msg--error').text()).toContain('Accès refusé')
  })

  it('21 — pendant la sauvegarde, le bouton affiche "Enregistrement…"', async () => {
    api.patch.mockImplementation(() => new Promise(() => {}))
    const wrapper = await mountView()
    wrapper.find('.btn.btn--primary').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.btn.btn--primary').text()).toBe('Enregistrement…')
  })

  it('22 — pendant la sauvegarde, le bouton est désactivé', async () => {
    api.patch.mockImplementation(() => new Promise(() => {}))
    const wrapper = await mountView()
    wrapper.find('.btn.btn--primary').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.btn.btn--primary').attributes('disabled')).toBeDefined()
  })
})
