import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconTooling from '@/components/icons/IconTooling.vue'

describe('IconTooling.vue — rendu', () => {
  it('se monte sans erreur', () => {
    const wrapper = mount(IconTooling)
    expect(wrapper.exists()).toBe(true)
  })

  it('contient un élément SVG', () => {
    const wrapper = mount(IconTooling)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
