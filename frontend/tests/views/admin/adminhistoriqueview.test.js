import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/stores/adminStore', () => ({ useAdminStore: vi.fn() }))
vi.mock('@/stores/authstore',  () => ({ useAuthStore:  vi.fn() }))
vi.mock('vue-router',          () => ({ useRouter:     vi.fn() }))

import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore }  from '@/stores/authstore'
import { useRouter }     from 'vue-router'
import AdminHistorique   from '@/views/admin/AdminHistorique.vue'

const MOCK_USER = { id: 1, prenom: 'Admin', nom: 'Test', role: 'ADMINISTRATEUR' }

const MOCK_CERT_HISTORY = [
  {
    id_historique: 1,
    action:        'CERTIFICATION',
    utilisateur:   { prenom: 'Alice', nom: 'Martin' },
    date_action:   '2024-03-15T10:00:00',
    description:   'Portfolio certifié avec mention',
  },
  {
    id_historique: 2,
    action:        'REVOCATION',
    utilisateur:   { prenom: 'Bob', nom: 'Dupont' },
    date_action:   '2024-04-01T14:30:00',
    description:   'Badge révoqué suite contrôle',
  },
  {
    id_historique: 3,
    action:        'VALIDATION_STAGE',
    utilisateur:   { prenom: 'Carla', nom: 'Durand' },
    date_action:   '2024-05-10T09:00:00',
    description:   'Stage validé par le responsable',
  },
]

let mockFetchCertHistory
let mockReplace

function makeMockAdminStore(overrides = {}) {
  mockFetchCertHistory = vi.fn().mockResolvedValue(undefined)
  return {
    loading:          false,
    error:            null,
    certHistory:      [],
    fetchCertHistory: mockFetchCertHistory,
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  mockReplace = vi.fn()
  useRouter.mockReturnValue({ push: vi.fn(), replace: mockReplace })
  useAuthStore.mockReturnValue({ user: MOCK_USER })
  useAdminStore.mockReturnValue(makeMockAdminStore())
})

const mountView = async (adminOverrides = {}) => {
  useAdminStore.mockReturnValue(makeMockAdminStore(adminOverrides))
  const wrapper = mount(AdminHistorique)
  await flushPromises()
  return wrapper
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — AdminHistorique
// ═══════════════════════════════════════════════════════

describe('AdminHistorique.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', async () => {
    expect((await mountView()).exists()).toBe(true)
  })

  it('2 — affiche "Historique des certifications" dans .page__title', async () => {
    expect((await mountView()).find('.page__title').text()).toBe('Historique des certifications')
  })

  it('3 — affiche le sous-titre dans .page__subtitle', async () => {
    expect((await mountView()).find('.page__subtitle').text()).toContain('Toutes les actions de certification')
  })

  it('4 — affiche le bouton "Rafraîchir"', async () => {
    expect((await mountView()).find('.btn.btn--secondary').text()).toContain('Rafraîchir')
  })

  it('5 — affiche "Audit complet" dans .card__title', async () => {
    expect((await mountView()).find('.card__title').text()).toBe('Audit complet')
  })

  it('6 — affiche le sous-titre de la carte .card__subtitle', async () => {
    expect((await mountView()).find('.card__subtitle').text()).toContain('Historique chronologique')
  })

  it('7 — les 4 colonnes du tableau sont présentes (Date, Action, Utilisateur, Détail)', async () => {
    const headers = (await mountView()).findAll('thead th').map(th => th.text())
    expect(headers).toContain('Date')
    expect(headers).toContain('Action')
    expect(headers).toContain('Utilisateur')
    expect(headers).toContain('Détail')
  })

  it('8 — affiche .state-msg "Chargement…" quand admin.loading = true', async () => {
    const wrapper = await mountView({ loading: true })
    expect(wrapper.find('.state-msg').text()).toContain('Chargement')
  })

  it('9 — affiche "Aucun historique disponible" quand certHistory = []', async () => {
    expect((await mountView()).text()).toContain('Aucun historique disponible')
  })

  it('10 — affiche exactement 3 lignes de données avec MOCK_CERT_HISTORY', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    const rows = wrapper.findAll('tbody tr').filter(r => !r.text().includes('Aucun historique'))
    expect(rows.length).toBe(3)
  })

  it('11 — chaque action est encapsulée dans un badge .badge', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    const badges = wrapper.findAll('.badge')
    expect(badges.length).toBe(3)
  })

  it('12 — la 1ère ligne affiche "CERTIFICATION" dans son badge', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    expect(wrapper.findAll('.badge')[0].text()).toBe('CERTIFICATION')
  })

  it('13 — la 2ème ligne affiche "REVOCATION" dans son badge', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    expect(wrapper.findAll('.badge')[1].text()).toBe('REVOCATION')
  })

  it('14 — chaque ligne affiche le nom de l\'utilisateur', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    expect(wrapper.text()).toContain('Alice Martin')
    expect(wrapper.text()).toContain('Bob Dupont')
    expect(wrapper.text()).toContain('Carla Durand')
  })

  it('15 — chaque ligne affiche la description', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    expect(wrapper.text()).toContain('Portfolio certifié avec mention')
    expect(wrapper.text()).toContain('Badge révoqué suite contrôle')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — AdminHistorique
// ═══════════════════════════════════════════════════════

describe('AdminHistorique.vue — Tests d\'Intégration', () => {

  it('16 — onMounted appelle fetchCertHistory() une fois', async () => {
    await mountView()
    expect(mockFetchCertHistory).toHaveBeenCalledTimes(1)
  })

  it('17 — si rôle !== ADMINISTRATEUR, router.replace("/login") est appelé', async () => {
    useAuthStore.mockReturnValue({ user: { role: 'PROFESSEUR' } })
    mount(AdminHistorique)
    await flushPromises()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('18 — si user = null, router.replace("/login") est appelé', async () => {
    useAuthStore.mockReturnValue({ user: null })
    mount(AdminHistorique)
    await flushPromises()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('19 — clic sur "Rafraîchir" appelle fetchCertHistory() à nouveau', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn.btn--secondary').trigger('click')
    await flushPromises()
    expect(mockFetchCertHistory).toHaveBeenCalledTimes(2)
  })

  it('20 — double clic sur "Rafraîchir" appelle fetchCertHistory() 3 fois au total', async () => {
    const wrapper = await mountView()
    await wrapper.find('.btn.btn--secondary').trigger('click')
    await wrapper.find('.btn.btn--secondary').trigger('click')
    await flushPromises()
    expect(mockFetchCertHistory).toHaveBeenCalledTimes(3)
  })

  it('21 — les données s\'affichent après rechargement (fetchCertHistory met à jour certHistory)', async () => {
    const store = makeMockAdminStore()
    useAdminStore.mockReturnValue(store)
    const wrapper = mount(AdminHistorique)
    await flushPromises()
    expect(wrapper.text()).toContain('Aucun historique disponible')
    store.certHistory = MOCK_CERT_HISTORY
    await wrapper.find('.btn.btn--secondary').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('CERTIFICATION')
  })
})
