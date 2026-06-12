import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconEcosystem from '@/components/icons/IconEcosystem.vue'

describe('IconEcosystem.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(IconEcosystem)
    expect(wrapper.exists()).toBe(true)
  })

  it('contient un élément SVG', () => {
    const wrapper = mount(IconEcosystem)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
