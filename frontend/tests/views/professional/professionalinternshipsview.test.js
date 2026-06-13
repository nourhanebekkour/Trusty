import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/professionalApi', () => ({
  getProfessionalInternships: vi.fn(),
}))

import { getProfessionalInternships } from '@/services/professionalApi'
import ProfessionalInternships from '@/views/Professional/ProfessionalInternships.vue'

const MOCK_INTERNSHIPS = [
  {
    id: 1,
    poste: 'Développeur Full Stack',
    entreprise: 'TechCorp',
    etudiant: { utilisateur: { prenom: 'Alice', nom: 'Martin' } },
    date_debut: '2024-01-01',
    date_fin: '2024-06-30',
    status_validation: 'VALIDE',
  },
  {
    id: 2,
    poste: 'Data Engineer',
    entreprise: 'DataLab',
    etudiant: { utilisateur: { prenom: 'Bob', nom: 'Dupont' } },
    date_debut: '2024-03-01',
    date_fin: '2024-08-31',
    status_validation: 'EN_ATTENTE',
  },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  getProfessionalInternships.mockResolvedValue(MOCK_INTERNSHIPS)
})

const mountView = async () => {
  const wrapper = mount(ProfessionalInternships)
  await flushPromises()
  return wrapper
}

const mountLoading = () => {
  getProfessionalInternships.mockImplementation(() => new Promise(() => {}))
  return mount(ProfessionalInternships)
}

const mountError = async () => {
  getProfessionalInternships.mockRejectedValue(new Error('fail'))
  const wrapper = mount(ProfessionalInternships)
  await flushPromises()
  return wrapper
}

const mountEmpty = async () => {
  getProfessionalInternships.mockResolvedValue([])
  const wrapper = mount(ProfessionalInternships)
  await flushPromises()
  return wrapper
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — Professional/ProfessionalInternships
// ═══════════════════════════════════════════════════════

describe('Professional/ProfessionalInternships.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', async () => {
    expect((await mountView()).exists()).toBe(true)
  })

  it('2 — affiche "Stages" dans h1', async () => {
    expect((await mountView()).find('h1').text()).toContain('Stages')
  })

  it('3 — affiche "Consultez les stages liés à votre entreprise." dans .prof-page-head p', async () => {
    expect((await mountView()).find('.prof-page-head p').text()).toContain('Consultez les stages liés à votre entreprise.')
  })

  it('4 — affiche .prof-state-box "Chargement des stages..." pendant le chargement', async () => {
    const wrapper = mountLoading()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.prof-state-box').exists()).toBe(true)
    expect(wrapper.find('.prof-state-box').text()).toContain('Chargement des stages...')
  })

  it('5 — n\'affiche pas .prof-state-box après chargement réussi', async () => {
    expect((await mountView()).find('.prof-state-box').exists()).toBe(false)
  })

  it('6 — affiche .prof-state-error si erreur API', async () => {
    expect((await mountError()).find('.prof-state-box.prof-state-error').exists()).toBe(true)
  })

  it('7 — affiche "Impossible de charger les stages." dans .prof-state-error', async () => {
    expect((await mountError()).find('.prof-state-error').text()).toContain('Impossible de charger les stages.')
  })

  it('8 — affiche le bouton "Réessayer" dans l\'état d\'erreur', async () => {
    expect((await mountError()).find('.btn-ghost').text()).toContain('Réessayer')
  })

  it('9 — affiche .prof-empty-card si aucun stage retourné', async () => {
    expect((await mountEmpty()).find('.prof-empty-card').exists()).toBe(true)
  })

  it('10 — affiche "Aucun stage" dans .empty-title', async () => {
    expect((await mountEmpty()).find('.empty-title').text()).toBe('Aucun stage')
  })

  it('11 — affiche .prof-card-grid quand des stages sont présents', async () => {
    expect((await mountView()).find('.prof-card-grid').exists()).toBe(true)
  })

  it('12 — affiche 2 .prof-info-card avec MOCK_INTERNSHIPS', async () => {
    expect((await mountView()).findAll('.prof-info-card').length).toBe(2)
  })

  it('13 — la 1ère carte affiche le poste "Développeur Full Stack" dans h3', async () => {
    expect((await mountView()).findAll('.prof-info-card')[0].find('h3').text()).toBe('Développeur Full Stack')
  })

  it('14 — la 2ème carte affiche le poste "Data Engineer" dans h3', async () => {
    expect((await mountView()).findAll('.prof-info-card')[1].find('h3').text()).toBe('Data Engineer')
  })

  it('15 — la 1ère carte affiche l\'entreprise "TechCorp"', async () => {
    expect((await mountView()).findAll('.prof-info-card')[0].text()).toContain('TechCorp')
  })

  it('16 — la 1ère carte a la classe pill-valide pour status VALIDE', async () => {
    expect((await mountView()).findAll('.prof-info-card')[0].find('.status-pill').classes()).toContain('pill-valide')
  })

  it('17 — la 2ème carte a la classe pill-pending pour status EN_ATTENTE', async () => {
    expect((await mountView()).findAll('.prof-info-card')[1].find('.status-pill').classes()).toContain('pill-pending')
  })

  it('18 — affiche .lecture-only contenant "Lecture seule"', async () => {
    expect((await mountView()).find('.lecture-only').text()).toContain('Lecture seule')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — Professional/ProfessionalInternships
// ═══════════════════════════════════════════════════════

describe('Professional/ProfessionalInternships.vue — Tests d\'Intégration', () => {

  it('19 — onMounted appelle getProfessionalInternships() une fois', async () => {
    await mountView()
    expect(getProfessionalInternships).toHaveBeenCalledTimes(1)
  })

  it('20 — erreur API → .prof-state-error visible, .prof-card-grid absent', async () => {
    const wrapper = await mountError()
    expect(wrapper.find('.prof-state-error').exists()).toBe(true)
    expect(wrapper.find('.prof-card-grid').exists()).toBe(false)
  })

  it('21 — clic "Réessayer" appelle getProfessionalInternships() à nouveau (×2 total)', async () => {
    const wrapper = await mountError()
    getProfessionalInternships.mockResolvedValue(MOCK_INTERNSHIPS)
    await wrapper.find('.btn-ghost').trigger('click')
    await flushPromises()
    expect(getProfessionalInternships).toHaveBeenCalledTimes(2)
  })

  it('22 — clic "Réessayer" remplace l\'erreur par les 2 cartes', async () => {
    const wrapper = await mountError()
    getProfessionalInternships.mockResolvedValue(MOCK_INTERNSHIPS)
    await wrapper.find('.btn-ghost').trigger('click')
    await flushPromises()
    expect(wrapper.find('.prof-state-error').exists()).toBe(false)
    expect(wrapper.findAll('.prof-info-card').length).toBe(2)
  })

  it('23 — la 1ère carte affiche le nom de l\'étudiant "Alice Martin"', async () => {
    expect((await mountView()).findAll('.prof-info-card')[0].text()).toContain('Alice Martin')
  })

  it('24 — la 2ème carte affiche le nom de l\'étudiant "Bob Dupont"', async () => {
    expect((await mountView()).findAll('.prof-info-card')[1].text()).toContain('Bob Dupont')
  })
})
