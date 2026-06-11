import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ProfileRepos from '@/components/profile/ProfileRepos.vue'

// ─── Helpers ───────────────────────────────────────────────────────────────────
// Le composant fetch directement l'API GitHub (pas de module api).
// On mock le global fetch pour simuler les réponses.

const makeGithubRepo = (overrides = {}) => ({
  id: 1,
  name:              'mon-projet',
  html_url:          'https://github.com/user/mon-projet',
  description:       'Un super projet',
  language:          'JavaScript',
  stargazers_count:  5,
  forks_count:       2,
  pushed_at:         '2024-05-01T10:00:00Z',
  topics:            [],
  fork:              false,
  ...overrides,
})

const mockFetch = (repos = []) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   true,
    json: vi.fn().mockResolvedValue(repos),
  }))
}

const makeUser = (githubUsername = null) => ({
  etudiant: { github_username: githubUsername },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileRepos.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.unstubAllGlobals()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Dépôts GitHub"', () => {
      mockFetch([])
      wrapper = mount(ProfileRepos, { props: { user: makeUser() } })
      expect(wrapper.find('.section-header h3').text()).toBe('Dépôts GitHub')
    })

    it('affiche le lien "Voir profil ↗" si github_username est défini', async () => {
      mockFetch([])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.add-btn').text()).toContain('Voir profil')
    })

    it('n\'affiche pas le lien profil si github_username est null', async () => {
      mockFetch([])
      wrapper = mount(ProfileRepos, { props: { user: makeUser(null) } })
      await flushPromises()
      expect(wrapper.find('.add-btn').exists()).toBe(false)
    })
  })

  // ── État vide — pas de username ───────────────────────────────────────────────
  describe('État vide (pas de github_username)', () => {
    it('affiche le message "Aucun compte GitHub lié" quand github_username est null', async () => {
      wrapper = mount(ProfileRepos, { props: { user: makeUser(null) } })
      await flushPromises()
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
      expect(wrapper.find('.empty-msg').text()).toContain('Aucun compte GitHub lié')
    })

    it('n\'affiche pas la liste quand pas de username', async () => {
      wrapper = mount(ProfileRepos, { props: { user: makeUser(null) } })
      await flushPromises()
      expect(wrapper.find('.repo-list').exists()).toBe(false)
    })

    it('affiche le message vide quand etudiant est undefined', async () => {
      wrapper = mount(ProfileRepos, { props: { user: { etudiant: undefined } } })
      await flushPromises()
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })
  })

  // ── État vide — username OK mais aucun dépôt ─────────────────────────────────
  describe('État vide (username OK, aucun dépôt)', () => {
    it('affiche "Aucun dépôt public trouvé." quand la liste est vide', async () => {
      mockFetch([])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.empty-msg').text()).toContain('Aucun dépôt public trouvé')
    })

    it('n\'affiche pas la liste quand vide', async () => {
      mockFetch([])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-list').exists()).toBe(false)
    })
  })

  // ── Affichage des dépôts ──────────────────────────────────────────────────────
  describe('Affichage des dépôts', () => {
    it('affiche la liste quand des dépôts existent', async () => {
      mockFetch([makeGithubRepo()])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-list').exists()).toBe(true)
      expect(wrapper.find('.empty-msg').exists()).toBe(false)
    })

    it('affiche le bon nombre de repo-item', async () => {
      mockFetch([
        makeGithubRepo({ id: 1, name: 'repo-1' }),
        makeGithubRepo({ id: 2, name: 'repo-2' }),
      ])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.findAll('.repo-item')).toHaveLength(2)
    })

    it('affiche le nom du dépôt', async () => {
      mockFetch([makeGithubRepo({ name: 'awesome-app' })])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-name').text()).toContain('awesome-app')
    })

    it('affiche le lien GitHub avec la bonne URL', async () => {
      mockFetch([makeGithubRepo({ html_url: 'https://github.com/test/repo' })])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-name').attributes('href')).toBe('https://github.com/test/repo')
    })

    it('affiche le lien en target="_blank"', async () => {
      mockFetch([makeGithubRepo()])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-name').attributes('target')).toBe('_blank')
    })

    it('affiche la description du dépôt', async () => {
      mockFetch([makeGithubRepo({ description: 'API REST en Node.js' })])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-desc').text()).toBe('API REST en Node.js')
    })

    it('affiche le langage principal', async () => {
      mockFetch([makeGithubRepo({ language: 'Python' })])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.repo-lang').text()).toContain('Python')
    })

    it('affiche le lien external ↗', async () => {
      mockFetch([makeGithubRepo()])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      expect(wrapper.find('.ext-link').text()).toBe('↗')
    })
  })

  // ── Couleurs des langages ─────────────────────────────────────────────────────
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r}, ${g}, ${b})`
  }

  const dotStyle = (wrapper) => {
    const dot = wrapper.find('.lang-dot')
    return dot.element.style.background || dot.element.style.backgroundColor || dot.attributes('style') || ''
  }

  describe('Couleurs des langages', () => {
    const langCases = [
      { lang: 'JavaScript', color: '#f0db4f' },
      { lang: 'TypeScript', color: '#3178c6' },
      { lang: 'Python',     color: '#3572A5' },
      { lang: 'Vue',        color: '#42b883' },
      { lang: 'PHP',        color: '#777bb3' },
      { lang: 'Java',       color: '#b07219' },
      { lang: 'CSS',        color: '#563d7c' },
      { lang: 'HTML',       color: '#e34c26' },
    ]

    langCases.forEach(({ lang, color }) => {
      it(`applique la couleur ${color} pour le langage ${lang}`, async () => {
        mockFetch([makeGithubRepo({ language: lang })])
        wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
        await flushPromises()
        const style = dotStyle(wrapper)
        const rgb = hexToRgb(color)
        expect(style.includes(color) || style.includes(rgb) || style.replace(/\s/g, '').includes(rgb.replace(/\s/g, ''))).toBe(true)
      })
    })

    it('applique la couleur par défaut #6b7280 pour un langage inconnu', async () => {
      mockFetch([makeGithubRepo({ language: 'COBOL' })])
      wrapper = mount(ProfileRepos, { props: { user: makeUser('myuser') } })
      await flushPromises()
      const style = dotStyle(wrapper)
      const rgb = hexToRgb('#6b7280')
      expect(style.includes('#6b7280') || style.includes(rgb) || style.replace(/\s/g, '').includes(rgb.replace(/\s/g, ''))).toBe(true)
    })
  })
})
