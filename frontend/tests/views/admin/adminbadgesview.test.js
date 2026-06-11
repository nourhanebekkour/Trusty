import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/stores/adminStore', () => ({ useAdminStore: vi.fn() }))
vi.mock('@/stores/authstore',  () => ({ useAuthStore:  vi.fn() }))
vi.mock('vue-router',          () => ({ useRouter:     vi.fn() }))
vi.mock('@/services/api',      () => ({ default: { post: vi.fn().mockResolvedValue({}) } }))
vi.mock('@/components/ui/StatCard.vue', () => ({
  default: {
    template: '<div class="stat-card"><span class="stat-label">{{ label }}</span><span class="stat-value">{{ value }}</span></div>',
    props: ['label', 'value'],
  },
}))
vi.mock('@/components/ui/AppModal.vue', () => ({
  default: {
    template: '<div v-if="show" class="app-modal-stub"><slot /><button class="modal-confirm-btn" @click="$emit(\'confirm\')">Confirmer</button></div>',
    props: ['show', 'title'],
    emits: ['close', 'confirm'],
  },
}))

import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore }  from '@/stores/authstore'
import { useRouter }     from 'vue-router'
import api               from '@/services/api'
import AdminBadges       from '@/views/admin/AdminBadges.vue'

const MOCK_USER = { id: 1, prenom: 'Admin', nom: 'Test', role: 'ADMINISTRATEUR' }

const MOCK_CERT_HISTORY = [
  {
    id_historique: 1,
    action:        'CERTIFICATION',
    utilisateur:   { prenom: 'Alice', nom: 'Martin' },
    date_action:   '2024-03-15T10:00:00',
    description:   'Portfolio certifié',
  },
  {
    id_historique: 2,
    action:        'REVOCATION',
    utilisateur:   { prenom: 'Bob', nom: 'Dupont' },
    date_action:   '2024-04-01T14:30:00',
    description:   'Badge révoqué',
  },
]

const MOCK_STUDENTS = [{ id_etudiant: 'stu-1', prenom: 'Alice', nom: 'Martin' }]

let mockFetchCertHistory
let mockFetchStudents
let mockReplace

function makeMockAdminStore(overrides = {}) {
  mockFetchCertHistory = vi.fn().mockResolvedValue(undefined)
  mockFetchStudents    = vi.fn().mockResolvedValue(undefined)
  return {
    loading:          false,
    error:            null,
    certHistory:      [],
    students:         [],
    fetchCertHistory: mockFetchCertHistory,
    fetchStudents:    mockFetchStudents,
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
  const wrapper = mount(AdminBadges)
  await flushPromises()
  return wrapper
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — AdminBadges
// ═══════════════════════════════════════════════════════

describe('AdminBadges.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', async () => {
    expect((await mountView()).exists()).toBe(true)
  })

  it('2 — affiche le titre "Badges & Certifications" dans .page__title', async () => {
    expect((await mountView()).find('.page__title').text()).toBe('Badges & Certifications')
  })

  it('3 — affiche le sous-titre dans .page__subtitle', async () => {
    expect((await mountView()).find('.page__subtitle').text()).toContain('Gérez les badges')
  })

  it('4 — affiche le bouton "Créer un badge"', async () => {
    const wrapper = await mountView()
    expect(wrapper.find('.btn.btn--primary').text()).toContain('Créer un badge')
  })

  it('5 — affiche 2 stat-cards dans .stats-row', async () => {
    expect((await mountView()).findAll('.stat-card').length).toBe(2)
  })

  it('6 — la 1ère stat-card a le label "Certifications"', async () => {
    const labels = (await mountView()).findAll('.stat-label')
    expect(labels[0].text()).toBe('Certifications')
  })

  it('7 — la 2ème stat-card a le label "Étudiants certifiés"', async () => {
    const labels = (await mountView()).findAll('.stat-label')
    expect(labels[1].text()).toBe('Étudiants certifiés')
  })

  it('8 — affiche le titre "Historique des certifications" dans .card__title', async () => {
    expect((await mountView()).find('.card__title').text()).toBe('Historique des certifications')
  })

  it('9 — les 4 colonnes du tableau sont présentes (Action, Utilisateur, Date, Détail)', async () => {
    const headers = (await mountView()).findAll('thead th').map(th => th.text())
    expect(headers).toContain('Action')
    expect(headers).toContain('Utilisateur')
    expect(headers).toContain('Date')
    expect(headers).toContain('Détail')
  })

  it('10 — affiche "Aucun historique disponible" quand certHistory = []', async () => {
    expect((await mountView()).text()).toContain('Aucun historique disponible')
  })

  it('11 — affiche "Chargement…" quand admin.loading = true', async () => {
    const wrapper = await mountView({ loading: true })
    expect(wrapper.find('.state-msg').text()).toContain('Chargement')
  })

  it('12 — affiche exactement 2 lignes de données avec MOCK_CERT_HISTORY', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    const rows = wrapper.findAll('tbody tr').filter(r => !r.text().includes('Aucun historique'))
    expect(rows.length).toBe(2)
  })

  it('13 — chaque ligne affiche l\'action de la certification', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    expect(wrapper.text()).toContain('CERTIFICATION')
    expect(wrapper.text()).toContain('REVOCATION')
  })

  it('14 — chaque ligne affiche le nom de l\'utilisateur', async () => {
    const wrapper = await mountView({ certHistory: MOCK_CERT_HISTORY })
    expect(wrapper.text()).toContain('Alice Martin')
    expect(wrapper.text()).toContain('Bob Dupont')
  })

  it('15 — affiche .error-banner si admin.error est défini', async () => {
    const wrapper = await mountView({ error: 'Erreur serveur' })
    expect(wrapper.find('.error-banner').exists()).toBe(true)
    expect(wrapper.find('.error-banner').text()).toContain('Erreur serveur')
  })

  it('16 — la valeur "2" est affichée pour Certifications avec 2 entrées', async () => {
    const values = (await mountView({ certHistory: MOCK_CERT_HISTORY })).findAll('.stat-value')
    expect(values[0].text()).toBe('2')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — AdminBadges
// ═══════════════════════════════════════════════════════

describe('AdminBadges.vue — Tests d\'Intégration', () => {

  it('17 — onMounted appelle fetchCertHistory()', async () => {
    await mountView()
    expect(mockFetchCertHistory).toHaveBeenCalledTimes(1)
  })

  it('18 — onMounted appelle fetchStudents()', async () => {
    await mountView()
    expect(mockFetchStudents).toHaveBeenCalledTimes(1)
  })

  it('19 — si rôle !== ADMINISTRATEUR, router.replace("/login") est appelé', async () => {
    useAuthStore.mockReturnValue({ user: { role: 'ETUDIANT' } })
    mount(AdminBadges)
    await flushPromises()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('20 — si user = null, router.replace("/login") est appelé', async () => {
    useAuthStore.mockReturnValue({ user: null })
    mount(AdminBadges)
    await flushPromises()
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('21 — clic sur "Créer un badge" affiche le modal (.app-modal-stub)', async () => {
    const wrapper = await mountView()
    expect(wrapper.find('.app-modal-stub').exists()).toBe(false)
    await wrapper.find('.btn.btn--primary').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.app-modal-stub').exists()).toBe(true)
  })

  it('22 — handleCreate appelle api.post avec les bonnes données', async () => {
    useAdminStore.mockReturnValue(makeMockAdminStore({ students: MOCK_STUDENTS }))
    const wrapper = mount(AdminBadges)
    await flushPromises()
    await wrapper.find('.btn.btn--primary').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('select').setValue('stu-1')
    await wrapper.find('input[type="text"]').setValue('Badge Expert')
    await wrapper.find('.modal-confirm-btn').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/badges', expect.objectContaining({
      id_etudiant: 'stu-1',
      nom: 'Badge Expert',
    }))
  })

  it('23 — handleCreate affiche "Badge créé avec succès" après succès', async () => {
    useAdminStore.mockReturnValue(makeMockAdminStore({ students: MOCK_STUDENTS }))
    const wrapper = mount(AdminBadges)
    await flushPromises()
    await wrapper.find('.btn.btn--primary').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('select').setValue('stu-1')
    await wrapper.find('input[type="text"]').setValue('Badge Expert')
    await wrapper.find('.modal-confirm-btn').trigger('click')
    await flushPromises()
    expect(wrapper.find('.msg.msg--ok').text()).toContain('Badge créé avec succès')
  })
})
