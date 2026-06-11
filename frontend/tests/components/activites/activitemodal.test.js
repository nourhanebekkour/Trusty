import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ActiviteModal from '@/components/activites/ActiviteModal.vue'

const MOCK_ACTIVITE = {
  type_activite: 'HACKATHON',
  nom_activite:  'Hackathon IA Maroc',
  organisation:  'ENSA Tanger',
  role:          'Participant',
  description:   'Compétition IA nationale',
  est_public:    true,
  date_debut:    '2024-03-01',
  date_fin:      '2024-03-31',
}

beforeEach(() => vi.clearAllMocks())

const mountModal    = (activite = null) => mount(ActiviteModal, { props: { activite }, attachTo: document.body })
const mountModalEdit = ()               => mount(ActiviteModal, { props: { activite: MOCK_ACTIVITE }, attachTo: document.body })

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ActiviteModal (création)
// ═══════════════════════════════════════════════════════

describe('ActiviteModal.vue — Tests Unitaires (mode création)', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountModal().exists()).toBe(true)
  })

  it('2 — affiche le titre "Nouvelle activité" en mode création', () => {
    expect(mountModal().find('.modal-header h2').text()).toBe('Nouvelle activité')
  })

  it('3 — le bouton submit affiche "Ajouter" en mode création', () => {
    expect(mountModal().find('.btn-submit').text()).toBe('Ajouter')
  })

  it('4 — le bouton submit est désactivé si les champs requis sont vides', () => {
    expect(mountModal().find('.btn-submit').attributes('disabled')).toBeDefined()
  })

  it('5 — le select contient l\'option CLUB', () => {
    const values = mountModal().findAll('select option').map(o => o.element.value)
    expect(values).toContain('CLUB')
  })

  it('6 — le select contient l\'option EVENEMENT', () => {
    const values = mountModal().findAll('select option').map(o => o.element.value)
    expect(values).toContain('EVENEMENT')
  })

  it('7 — le select contient l\'option HACKATHON', () => {
    const values = mountModal().findAll('select option').map(o => o.element.value)
    expect(values).toContain('HACKATHON')
  })

  it('8 — le select contient l\'option COMPETITION', () => {
    const values = mountModal().findAll('select option').map(o => o.element.value)
    expect(values).toContain('COMPETITION')
  })

  it('9 — le select contient l\'option ENGAGEMENT', () => {
    const values = mountModal().findAll('select option').map(o => o.element.value)
    expect(values).toContain('ENGAGEMENT')
  })

  it('10 — le select contient exactement 5 types (+ option vide)', () => {
    const options = mountModal().findAll('select option')
    expect(options.length).toBe(6)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — ActiviteModal (édition)
// ═══════════════════════════════════════════════════════

describe('ActiviteModal.vue — Tests Unitaires (mode édition)', () => {

  it('11 — affiche le titre "Modifier l\'activité" en mode édition', () => {
    expect(mountModalEdit().find('.modal-header h2').text()).toBe("Modifier l'activité")
  })

  it('12 — le bouton submit affiche "Enregistrer" en mode édition', () => {
    expect(mountModalEdit().find('.btn-submit').text()).toBe('Enregistrer')
  })

  it('13 — pré-remplit le nom de l\'activité', () => {
    const input = mountModalEdit().find('input[placeholder*="Hackathon"]')
    expect(input.element.value).toBe('Hackathon IA Maroc')
  })

  it('14 — le bouton submit est actif quand les champs requis sont remplis', () => {
    expect(mountModalEdit().find('.btn-submit').attributes('disabled')).toBeUndefined()
  })

  it('15 — affiche la description pré-remplie', () => {
    expect(mountModalEdit().find('textarea').element.value).toBe('Compétition IA nationale')
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — ActiviteModal
// ═══════════════════════════════════════════════════════

describe('ActiviteModal.vue — Tests d\'Intégration', () => {

  it('16 — clic sur Annuler (.btn-cancel) émet "close"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('17 — clic sur la croix (.close-btn) émet "close"', async () => {
    const wrapper = mountModal()
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('18 — saisie des champs requis active le bouton submit', async () => {
    const wrapper = mountModal()
    await wrapper.find('select').setValue('HACKATHON')
    await wrapper.find('input[placeholder*="Hackathon"]').setValue('Mon Hackathon')
    await wrapper.findAll('input[placeholder]')[1].setValue('ENSA Tanger')
    await wrapper.findAll('input[placeholder]')[2].setValue('Participant')
    expect(wrapper.find('.btn-submit').attributes('disabled')).toBeUndefined()
  })

  it('19 — submit émet "submit" avec type_activite correct', async () => {
    const wrapper = mountModal()
    await wrapper.find('select').setValue('CLUB')
    await wrapper.find('input[placeholder*="Hackathon"]').setValue('Club Robotique')
    await wrapper.findAll('input[placeholder]')[1].setValue('ENIS Sfax')
    await wrapper.findAll('input[placeholder]')[2].setValue('Président')
    await wrapper.find('.btn-submit').trigger('click')
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0].type_activite).toBe('CLUB')
  })

  it('20 — submit émet "submit" avec nom_activite correct', async () => {
    const wrapper = mountModal()
    await wrapper.find('select').setValue('EVENEMENT')
    await wrapper.find('input[placeholder*="Hackathon"]').setValue('Forum Tech')
    await wrapper.findAll('input[placeholder]')[1].setValue('INSAT')
    await wrapper.findAll('input[placeholder]')[2].setValue('Speaker')
    await wrapper.find('.btn-submit').trigger('click')
    expect(wrapper.emitted('submit')[0][0].nom_activite).toBe('Forum Tech')
  })

  it('21 — n\'émet pas "submit" si les champs requis sont vides', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-submit').trigger('click')
    expect(wrapper.emitted('submit')).toBeFalsy()
  })
})
