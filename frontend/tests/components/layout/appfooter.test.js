import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '@/components/layout/AppFooter.vue'

describe('AppFooter — Tests Unitaires', () => {
  it('1 — se monte sans erreur', () => {
    expect(mount(AppFooter).exists()).toBe(true)
  })
})
