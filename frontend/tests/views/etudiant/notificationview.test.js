import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationView from '@/views/Etudiant/Notification.vue'

describe('NotificationView — Tests Unitaires', () => {
  it('1 — se monte sans erreur', () => {
    expect(mount(NotificationView).exists()).toBe(true)
  })

  it('2 — affiche un contenu visible', () => {
    expect(mount(NotificationView).text().length).toBeGreaterThan(0)
  })

  it('3 — contient un élément racine div', () => {
    expect(mount(NotificationView).find('div').exists()).toBe(true)
  })
})
