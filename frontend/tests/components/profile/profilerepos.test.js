import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileRepos from '@/components/profile/ProfileRepos.vue'

// ─── Factories ─────────────────────────────────────────────────────────────────
const makeRepo = (overrides = {}) => ({
  id_depot: 1,
  nom_depot: 'mon-projet',
  url_github: 'https://github.com/user/mon-projet',
  description_github: 'Un super projet',
  langage_principal: 'JavaScript',
  ...overrides,
})

const makeUser = (repos = []) => ({
  etudiant: { depots_github: repos },
})

// ─── Suite ────────────────────────────────────────────────────────────────────
describe('ProfileRepos.vue', () => {
  let wrapper

  const mountComponent = (user = makeUser()) =>
    mount(ProfileRepos, { props: { user } })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendu de base ────────────────────────────────────────────────────────────
  describe('Rendu de base', () => {
    it('affiche le titre "Dépôts GitHub"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.section-header h3').text()).toBe('Dépôts GitHub')
    })

    it('affiche le bouton "+ Ajouter"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.add-btn').text()).toBe('+ Ajouter')
    })

    it('affiche le bouton "Lier un nouveau dépôt"', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.link-btn').text()).toBe('Lier un nouveau dépôt')
    })
  })

  // ── État vide ────────────────────────────────────────────────────────────────
  describe('État vide', () => {
    it('affiche le message "Aucun dépôt lié." quand la liste est vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.empty-msg').text()).toBe('Aucun dépôt lié.')
    })

    it('n\'affiche pas la liste quand vide', () => {
      wrapper = mountComponent(makeUser([]))
      expect(wrapper.find('.repo-list').exists()).toBe(false)
    })

    it('affiche le message vide quand etudiant est undefined', () => {
      wrapper = mountComponent({ etudiant: undefined })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })

    it('affiche le message vide quand depots_github est undefined', () => {
      wrapper = mountComponent({ etudiant: {} })
      expect(wrapper.find('.empty-msg').exists()).toBe(true)
    })
  })

  // ── Affichage des dépôts ──────────────────────────────────────────────────────
  describe('Affichage des dépôts', () => {
    it('affiche la liste quand des dépôts existent', () => {
      wrapper = mountComponent(makeUser([makeRepo()]))
      expect(wrapper.find('.repo-list').exists()).toBe(true)
      expect(wrapper.find('.empty-msg').exists()).toBe(false)
    })

    it('affiche le bon nombre de repo-item', () => {
      const repos = [
        makeRepo({ id_depot: 1, nom_depot: 'repo-1' }),
        makeRepo({ id_depot: 2, nom_depot: 'repo-2' }),
      ]
      wrapper = mountComponent(makeUser(repos))
      expect(wrapper.findAll('.repo-item')).toHaveLength(2)
    })

    it('affiche le nom du dépôt', () => {
      wrapper = mountComponent(makeUser([makeRepo({ nom_depot: 'awesome-app' })]))
      expect(wrapper.find('.repo-name').text()).toBe('awesome-app')
    })

    it('affiche le lien GitHub avec la bonne URL', () => {
      wrapper = mountComponent(makeUser([makeRepo({ url_github: 'https://github.com/test/repo' })]))
      expect(wrapper.find('.repo-name').attributes('href')).toBe('https://github.com/test/repo')
    })

    it('utilise "#" comme href si url_github est null', () => {
      wrapper = mountComponent(makeUser([makeRepo({ url_github: null })]))
      expect(wrapper.find('.repo-name').attributes('href')).toBe('#')
    })

    it('affiche le lien en target="_blank"', () => {
      wrapper = mountComponent(makeUser([makeRepo()]))
      expect(wrapper.find('.repo-name').attributes('target')).toBe('_blank')
    })

    it('affiche la description du dépôt', () => {
      wrapper = mountComponent(makeUser([makeRepo({ description_github: 'API REST en Node.js' })]))
      expect(wrapper.find('.repo-desc').text()).toBe('API REST en Node.js')
    })

    it('affiche le langage principal', () => {
      wrapper = mountComponent(makeUser([makeRepo({ langage_principal: 'Python' })]))
      expect(wrapper.find('.repo-lang').text()).toContain('Python')
    })

    it('affiche l\'icône ⚙', () => {
      wrapper = mountComponent(makeUser([makeRepo()]))
      expect(wrapper.find('.repo-icon').text()).toBe('⚙')
    })

    it('affiche le lien external ↗', () => {
      wrapper = mountComponent(makeUser([makeRepo()]))
      expect(wrapper.find('.ext-link').text()).toBe('↗')
    })
  })

  // ── Couleurs des langages ─────────────────────────────────────────────────────
  // Vue normalise les hex en rgb() dans element.style — on accepte les deux formes.
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r}, ${g}, ${b})`
  }

  const dotStyle = (wrapper) => {
    const dot = wrapper.find('.lang-dot')
    // Lire la valeur brute depuis element.style.background
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
      it(`applique la couleur ${color} pour le langage ${lang}`, () => {
        wrapper = mountComponent(makeUser([makeRepo({ langage_principal: lang })]))
        const style = dotStyle(wrapper)
        const rgb = hexToRgb(color)
        expect(style.includes(color) || style.includes(rgb) || style.replace(/\s/g, '').includes(rgb.replace(/\s/g, ''))).toBe(true)
      })
    })

    it('applique la couleur par défaut #6b7280 pour un langage inconnu', () => {
      wrapper = mountComponent(makeUser([makeRepo({ langage_principal: 'COBOL' })]))
      const style = dotStyle(wrapper)
      const rgb = hexToRgb('#6b7280')
      expect(style.includes('#6b7280') || style.includes(rgb) || style.replace(/\s/g, '').includes(rgb.replace(/\s/g, ''))).toBe(true)
    })
  })
})