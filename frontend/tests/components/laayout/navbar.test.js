import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NavBar from '@/components/laayout/NavBar.vue'

// ── Mocks assets ──────────────────────────────────────────────────────────────
vi.mock('@/assets/icons/trusty.svg',        { default: 'trusty.svg' })
vi.mock('@/assets/icons/notifications.svg', { default: 'notifications.svg' })

// ── Mock authStore ────────────────────────────────────────────────────────────
const mockFetchProfile = vi.fn()

vi.mock('@/stores/authstore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { name: 'Ali Ben', role: 'ETUDIANT', avatar: null },
    fetchProfile: mockFetchProfile,
  })),
}))

import { useAuthStore } from '@/stores/authstore'

function mountNavBar() {
  return mount(NavBar, {
    global: { stubs: { RouterLink: true } },
  })
}

describe('NavBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── Structure ─────────────────────────────────────────────────────────────

  it('affiche la navbar', () => {
    const wrapper = mountNavBar()
    expect(wrapper.find('.navbar').exists()).toBe(true)
  })

  it('affiche le logo TRUSTY', () => {
    const wrapper = mountNavBar()
    expect(wrapper.find('.logo-text').text()).toBe('TRUSTY')
  })

  it('affiche l\'icône logo', () => {
    const wrapper = mountNavBar()
    const img = wrapper.find('.logo-icon')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Trusty')
  })

  it('affiche l\'icône notifications', () => {
    const wrapper = mountNavBar()
    expect(wrapper.find('.notif-icon').exists()).toBe(true)
  })

  it('affiche le badge de notification', () => {
    const wrapper = mountNavBar()
    expect(wrapper.find('.notif-badge').exists()).toBe(true)
  })

  // ── Informations utilisateur ──────────────────────────────────────────────

  it('affiche le nom de l\'utilisateur', async () => {
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-name').text()).toBe('Ali Ben')
  })

  it('affiche le rôle de l\'utilisateur', async () => {
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('ETUDIANT')
  })

  it('affiche les initiales quand pas d\'avatar', async () => {
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-avatar').exists()).toBe(true)
    expect(wrapper.find('.user-avatar').text()).toBe('AB')
  })

  it('affiche l\'image avatar quand disponible', async () => {
    useAuthStore.mockReturnValue({
      user: { name: 'Ali Ben', role: 'ETUDIANT', avatar: 'http://example.com/photo.jpg' },
      fetchProfile: mockFetchProfile,
    })
    const wrapper = mountNavBar()
    await flushPromises()
    const avatarImg = wrapper.find('img.user-avatar--img')
    expect(avatarImg.exists()).toBe(true)
    expect(avatarImg.attributes('src')).toBe('http://example.com/photo.jpg')
  })

it("affiche une chaîne vide quand avatar est null", async () => {
  const wrapper = mountNavBar()
  await flushPromises()

  expect(wrapper.find('.user-avatar').exists()).toBe(true)
  expect(wrapper.find('.user-avatar').text()).toBe('')
})
  // ── Valeurs par défaut ────────────────────────────────────────────────────

  it('affiche "YEL" par défaut si user.name est absent', async () => {
    useAuthStore.mockReturnValue({
      user: null,
      fetchProfile: mockFetchProfile,
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-name').text()).toBe('YEL')
  })

  it("affiche 'Étudiant' par défaut si role et specialite sont absents", async () => {
    useAuthStore.mockReturnValue({
      user: { name: 'Test', role: null, specialite: null, avatar: null },
      fetchProfile: mockFetchProfile,
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('Étudiant')
  })

  it('affiche la specialite si role est absent', async () => {
    useAuthStore.mockReturnValue({
      user: { name: 'Test', role: null, specialite: 'Informatique', avatar: null },
      fetchProfile: mockFetchProfile,
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-role').text()).toBe('Informatique')
  })

  // ── onMounted ─────────────────────────────────────────────────────────────

  it('appelle fetchProfile si user est null au montage', async () => {
    useAuthStore.mockReturnValue({
      user: null,
      fetchProfile: mockFetchProfile,
    })
    mountNavBar()
    await flushPromises()
    expect(mockFetchProfile).toHaveBeenCalledTimes(1)
  })

  it("appelle fetchProfile au montage", async () => {
  mountNavBar()
  await flushPromises()

  expect(mockFetchProfile).toHaveBeenCalledTimes(1)
})

  // ── Initiales ─────────────────────────────────────────────────────────────

  it('calcule les initiales sur 2 caractères max', async () => {
    useAuthStore.mockReturnValue({
      user: { name: 'Ali Ben Youssef', role: 'ETUDIANT', avatar: null },
      fetchProfile: mockFetchProfile,
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-avatar').text()).toBe('AB')
  })

  it("affiche une chaîne vide pour les initiales si name est vide", async () => {
    useAuthStore.mockReturnValue({
      user: { name: '', role: 'ETUDIANT', avatar: null },
      fetchProfile: mockFetchProfile,
    })
    const wrapper = mountNavBar()
    await flushPromises()
    expect(wrapper.find('.user-avatar').text()).toBe('')
  })
})