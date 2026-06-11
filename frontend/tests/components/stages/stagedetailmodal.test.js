import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'

vi.mock('@/services/stageService', () => ({
  fetchStageById: vi.fn(),
}))

vi.mock('@/stores/stageStore', () => ({
  initiales:    (s) => (s ?? '').slice(0, 2).toUpperCase(),
  logoColor:    ()  => '#3B82F6',
  formatDate:   (d) => d ?? '—',
  badgeClass:   (s) => `badge--${(s ?? '').toLowerCase()}`,
  labelStatut:  (s) => s ?? '—',
  useStageStore: vi.fn(),
}))

import { fetchStageById } from '@/services/stageService'
import StageDetailModal from '@/components/stages/StageDetailModal.vue'

const MOCK_STAGE = {
  id_stage:                7,
  entreprise:              'TechCorp Maroc',
  poste:                   'Développeur Full Stack',
  status_validation:       'VALIDE',
  est_public:              true,
  date_debut:              '2024-02-01',
  date_fin:                '2024-07-31',
  duree_semaines:          26,
  adresse_entreprise:      'Casablanca, Maroc',
  encadrant_professionnel: 'M. Alami',
  encadrant_academique:    'Dr. Benali',
  missions:                'Développement d\'une API REST avec Node.js.',
  rapport:                 null,
  validateur:              null,
  technologies:            [],
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchStageById.mockResolvedValue(MOCK_STAGE)
})

const mountModal  = (props = {}) =>
  mount(StageDetailModal, { props: { modelValue: true, stageId: null, ...props } })

const mountHidden = () =>
  mount(StageDetailModal, { props: { modelValue: false, stageId: null } })

const mountAndLoad = async (stageOverrides = {}) => {
  fetchStageById.mockResolvedValue({ ...MOCK_STAGE, ...stageOverrides })
  const wrapper = mount(StageDetailModal, { props: { modelValue: false, stageId: 7 } })
  await wrapper.setProps({ modelValue: true })
  await flushPromises()
  return wrapper
}

// ═══════════════════════════════════════════════════════
// TESTS UNITAIRES — StageDetailModal
// ═══════════════════════════════════════════════════════

describe('StageDetailModal.vue — Tests Unitaires', () => {

  it('1 — se monte sans erreur', () => {
    expect(mountModal().exists()).toBe(true)
  })

  it('2 — ne rend pas .detail-modal si modelValue = false', () => {
    expect(mountHidden().find('.detail-modal').exists()).toBe(false)
  })

  it('3 — rend .modal-overlay si modelValue = true', () => {
    expect(mountModal().find('.modal-overlay').exists()).toBe(true)
  })

  it('4 — rend .detail-modal si modelValue = true', () => {
    expect(mountModal().find('.detail-modal').exists()).toBe(true)
  })

  it('5 — affiche "Détail du stage" dans .detail-title', () => {
    expect(mountModal().find('.detail-title').text()).toBe('Détail du stage')
  })

  it('6 — affiche .detail-loading pendant le chargement', async () => {
    fetchStageById.mockImplementation(() => new Promise(() => {}))
    const wrapper = mount(StageDetailModal, { props: { modelValue: false, stageId: 7 } })
    await wrapper.setProps({ modelValue: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.detail-loading').exists()).toBe(true)
  })

  it('7 — affiche "Chargement des informations…" pendant le chargement', async () => {
    fetchStageById.mockImplementation(() => new Promise(() => {}))
    const wrapper = mount(StageDetailModal, { props: { modelValue: false, stageId: 7 } })
    await wrapper.setProps({ modelValue: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.detail-loading').text()).toContain('Chargement des informations')
  })

  it('8 — le bouton .btn-cancel affiche "Fermer"', () => {
    expect(mountModal().find('.btn-cancel').text()).toBe('Fermer')
  })

  it('9 — le bouton .btn-new affiche "✎ Modifier ce stage"', () => {
    expect(mountModal().find('.btn-new').text()).toContain('Modifier ce stage')
  })

  it('10 — sans stageId, fetchStageById n\'est pas appelé même si modelValue change', async () => {
    const wrapper = mount(StageDetailModal, { props: { modelValue: false, stageId: null } })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    expect(fetchStageById).not.toHaveBeenCalled()
  })

  it('11 — .detail-scroll est absent si le stage n\'est pas encore chargé', () => {
    expect(mountModal().find('.detail-scroll').exists()).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════
// TESTS D'INTÉGRATION — StageDetailModal
// ═══════════════════════════════════════════════════════

describe('StageDetailModal.vue — Tests d\'Intégration', () => {

  it('12 — clic sur .modal-close émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.modal-close').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('13 — clic sur .btn-cancel émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('14 — clic sur .modal-overlay (backdrop) émet "update:modelValue" false', async () => {
    const wrapper = mountModal()
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('15 — l\'ouverture avec stageId appelle fetchStageById avec la bonne valeur', async () => {
    const wrapper = mount(StageDetailModal, { props: { modelValue: false, stageId: 7 } })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    expect(fetchStageById).toHaveBeenCalledWith(7)
  })

  it('16 — après chargement, affiche l\'entreprise dans .detail-hero-company', async () => {
    const wrapper = await mountAndLoad()
    expect(wrapper.find('.detail-hero-company').text()).toBe('TechCorp Maroc')
  })

  it('17 — après chargement, affiche le poste dans .detail-hero-poste', async () => {
    const wrapper = await mountAndLoad()
    expect(wrapper.find('.detail-hero-poste').text()).toBe('Développeur Full Stack')
  })

  it('18 — après chargement, affiche les missions dans .detail-missions-text', async () => {
    const wrapper = await mountAndLoad()
    expect(wrapper.find('.detail-missions-text').text()).toContain('Développement d\'une API REST avec Node.js.')
  })

  it('19 — après chargement, affiche "Public" pour est_public = true', async () => {
    const wrapper = await mountAndLoad()
    expect(wrapper.text()).toContain('Public')
  })

  it('20 — après chargement, affiche "Aucun rapport déposé." si rapport = null', async () => {
    const wrapper = await mountAndLoad()
    expect(wrapper.find('.detail-empty').text()).toBe('Aucun rapport déposé.')
  })

  it('21 — après chargement, affiche le lien rapport si rapportUrl est défini', async () => {
    const wrapper = await mountAndLoad({
      rapport: { url: 'https://example.com/rapport.pdf' },
    })
    expect(wrapper.find('.detail-rapport-link').exists()).toBe(true)
    expect(wrapper.find('.detail-rapport-link').text()).toContain('Voir le rapport')
  })

  it('22 — erreur API → affiche .detail-error avec le message', async () => {
    fetchStageById.mockRejectedValue({ response: { data: { message: 'Accès refusé' } } })
    const wrapper = mount(StageDetailModal, { props: { modelValue: false, stageId: 7 } })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    expect(wrapper.find('.detail-error').exists()).toBe(true)
    expect(wrapper.find('.detail-error').text()).toContain('Accès refusé')
  })

  it('23 — clic sur .btn-new après chargement émet "edit" avec le stage', async () => {
    const wrapper = await mountAndLoad()
    await wrapper.find('.btn-new').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0][0].id_stage).toBe(7)
    expect(wrapper.emitted('edit')[0][0].entreprise).toBe('TechCorp Maroc')
  })

  it('24 — clic sur .btn-new émet aussi "update:modelValue" false (ferme le modal)', async () => {
    const wrapper = await mountAndLoad()
    await wrapper.find('.btn-new').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
