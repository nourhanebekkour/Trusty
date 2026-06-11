import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ProfessorStudentDetail from '@/components/professor/ProfessorStudentDetail.vue'

vi.mock('@/services/professorApi', () => ({
  getStudentDetails: vi.fn(),
}))

import { getStudentDetails } from '@/services/professorApi'

const MOCK_DATA = {
  competences: [
    { id_competence: 1, competence: { nom: 'Vue.js' } },
    { id_competence: 2, competence: { nom: 'Node.js' } },
    { id_competence: 3, competence: { nom: 'Python' } },
  ],
  badges: [
    { id_badge: 1, badge: { nom: 'Badge Or',     description: 'Excellent travail' } },
    { id_badge: 2, badge: { nom: 'Badge Argent', description: 'Bonne progression' } },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  getStudentDetails.mockResolvedValue(MOCK_DATA)
})

const mountDetail = (props = {}) => mount(ProfessorStudentDetail, {
  props: { studentId: '42', studentName: 'Alice Dupont', ...props },
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ProfessorStudentDetail
// ═══════════════════════════════════════════════════════

describe('ProfessorStudentDetail.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountDetail().exists()).toBe(true)
  })

  it('2 — affiche l\'état de chargement "Chargement..." au montage', async () => {
    let resolveLoad
    getStudentDetails.mockReturnValueOnce(new Promise(r => { resolveLoad = r }))
    const wrapper = mountDetail()
    await nextTick()
    expect(wrapper.find('.prof-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Chargement')
    resolveLoad(MOCK_DATA)
  })

  it('3 — affiche le nom de l\'étudiant dans le header', () => {
    const wrapper = mountDetail()
    expect(wrapper.find('h2').text()).toBe('Alice Dupont')
  })

  it('4 — affiche le sous-titre "Compétences et badges"', () => {
    const wrapper = mountDetail()
    expect(wrapper.text()).toContain('Compétences et badges')
  })

  it('5 — contient la modale .prof-modal-backdrop', () => {
    const wrapper = mountDetail()
    expect(wrapper.find('.prof-modal-backdrop').exists()).toBe(true)
  })

  it('6 — contient le bouton de fermeture .prof-modal-close', () => {
    const wrapper = mountDetail()
    expect(wrapper.find('.prof-modal-close').exists()).toBe(true)
  })

  it('7 — après chargement : affiche la section "Compétences"', async () => {
    const wrapper = mountDetail()
    await flushPromises()
    expect(wrapper.text()).toContain('Compétences')
  })

  it('8 — après chargement : affiche les noms des compétences', async () => {
    const wrapper = mountDetail()
    await flushPromises()
    expect(wrapper.text()).toContain('Vue.js')
    expect(wrapper.text()).toContain('Node.js')
    expect(wrapper.text()).toContain('Python')
  })

  it('9 — après chargement : affiche la section "Badges (2)"', async () => {
    const wrapper = mountDetail()
    await flushPromises()
    expect(wrapper.text()).toContain('Badges (2)')
  })

  it('10 — après chargement : affiche les noms des badges', async () => {
    const wrapper = mountDetail()
    await flushPromises()
    expect(wrapper.text()).toContain('Badge Or')
    expect(wrapper.text()).toContain('Badge Argent')
  })

  it('11 — affiche les .tag pour chaque compétence', async () => {
    const wrapper = mountDetail()
    await flushPromises()
    expect(wrapper.findAll('.tag').length).toBe(3)
  })

  it('12 — appelle getStudentDetails avec le bon studentId', async () => {
    mountDetail({ studentId: '99' })
    await flushPromises()
    expect(getStudentDetails).toHaveBeenCalledWith('99')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ProfessorStudentDetail
// ═══════════════════════════════════════════════════════

describe('ProfessorStudentDetail.vue — Tests d\'Intégration', () => {

  it('13 — clic sur .prof-modal-close émet "close"', async () => {
    const wrapper = mountDetail()
    await wrapper.find('.prof-modal-close').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('14 — clic sur le backdrop .prof-modal-backdrop émet "close"', async () => {
    const wrapper = mountDetail()
    await wrapper.find('.prof-modal-backdrop').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('15 — affiche un message d\'erreur si getStudentDetails rejette', async () => {
    getStudentDetails.mockRejectedValueOnce(new Error('Erreur réseau'))
    const wrapper = mountDetail()
    await flushPromises()
    expect(wrapper.find('.prof-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Impossible de charger les détails')
  })
})
