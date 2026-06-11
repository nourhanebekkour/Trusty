import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Stats from '@/components/HomePage/Stats-HP.vue'

// ── Mock IntersectionObserver avec une vraie classe ES6 ──────────────────────

let observeSpy

class IntersectionObserverMock {
  constructor(cb) {
    observeSpy = vi.fn()
    this.observe    = observeSpy
    this.unobserve  = vi.fn()
    this.disconnect = vi.fn()
  }
}

beforeEach(() => {
  global.IntersectionObserver = IntersectionObserverMock
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Tests unitaires ──────────────────────────────────────────────────────────

describe('Stats-HP.vue', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(Stats)
    expect(wrapper.exists()).toBe(true)
  })

  it('affiche 4 statistiques', () => {
    const wrapper = mount(Stats)
    expect(wrapper.findAll('.stat-item')).toHaveLength(4)
  })

  it('affiche la stat "Étudiants Actifs" avec valeur 25k+', () => {
    const wrapper = mount(Stats)
    const text = wrapper.text()
    expect(text).toContain('25')
    expect(text).toContain('k+')
    expect(text).toContain('Étudiants Actifs')
  })

  it('affiche la stat "Partenaires" avec valeur 150+', () => {
    const wrapper = mount(Stats)
    const text = wrapper.text()
    expect(text).toContain('150')
    expect(text).toContain('Partenaires')
  })

  it('affiche la stat "Certifications" avec valeur 12k', () => {
    const wrapper = mount(Stats)
    const text = wrapper.text()
    expect(text).toContain('12')
    expect(text).toContain('Certifications')
  })

  it('affiche la stat "Taux d\'Embauche" avec valeur 94%', () => {
    const wrapper = mount(Stats)
    const text = wrapper.text()
    expect(text).toContain('94')
    expect(text).toContain('%')
    expect(text).toContain("Taux d'Embauche")
  })

  it('chaque stat-item possède la classe fade-in', () => {
    const wrapper = mount(Stats)
    wrapper.findAll('.stat-item').forEach(item => {
      expect(item.classes()).toContain('fade-in')
    })
  })

  it('chaque .stat-num contient un <span> pour le suffixe', () => {
    const wrapper = mount(Stats)
    const nums = wrapper.findAll('.stat-num')
    expect(nums).toHaveLength(4)
    nums.forEach(num => expect(num.find('span').exists()).toBe(true))
  })

  it('instancie l\'IntersectionObserver au montage', () => {
    const ctorSpy = vi.spyOn(global, 'IntersectionObserver')
    mount(Stats)
    expect(ctorSpy).toHaveBeenCalled()
  })

  it('appelle observe() sur chaque élément fade-in', () => {
    mount(Stats)
    // observeSpy est assigné dans le constructeur du mock
    expect(observeSpy).toHaveBeenCalled()
  })

  it('les données contiennent 4 entrées', () => {
    const wrapper = mount(Stats)
    expect(wrapper.vm.stats).toHaveLength(4)
  })

  it('chaque stat possède les champs value, suffix et label', () => {
    const wrapper = mount(Stats)
    wrapper.vm.stats.forEach(stat => {
      expect(stat).toHaveProperty('value')
      expect(stat).toHaveProperty('suffix')
      expect(stat).toHaveProperty('label')
    })
  })

  it('possède le bon nom de composant', () => {
    expect(Stats.name).toBe('StatsVue')
  })
})