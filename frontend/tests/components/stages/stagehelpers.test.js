import { describe, it, expect } from 'vitest'
import {
  emptyForm, buildPayload, formatStatut, formatDate,
  niveauLabel, niveauClass, initials,
} from '@/components/stages/stageHelpers'

describe('emptyForm()', () => {
  it('retourne un objet avec toutes les clés', () => {
    const form = emptyForm()
    expect(form).toHaveProperty('entreprise', '')
    expect(form).toHaveProperty('poste', '')
    expect(form).toHaveProperty('est_public', true)
    expect(form).toHaveProperty('id_validateur', null)
  })
})

describe('buildPayload()', () => {
  it('supprime les champs optionnels vides', () => {
    const form = emptyForm()
    form.entreprise = 'Google'
    form.poste = 'Dev'
    const payload = buildPayload(form)
    expect(payload).not.toHaveProperty('date_fin')
    expect(payload).not.toHaveProperty('adresse_entreprise')
    expect(payload).not.toHaveProperty('id_validateur')
  })

  it('conserve les champs renseignés', () => {
    const form = emptyForm()
    form.entreprise = 'Google'
    form.missions = 'Développement backend'
    const payload = buildPayload(form)
    expect(payload.entreprise).toBe('Google')
    expect(payload.missions).toBe('Développement backend')
  })
})

describe('formatStatut()', () => {
  it('traduit VALIDE → Validé',         () => expect(formatStatut('VALIDE')).toBe('Validé'))
  it('traduit EN_ATTENTE → En attente', () => expect(formatStatut('EN_ATTENTE')).toBe('En attente'))
  it('traduit REJETE → Refusé',         () => expect(formatStatut('REJETE')).toBe('Refusé'))
  it('retourne la valeur brute si inconnue', () => expect(formatStatut('X')).toBe('X'))
})

describe('formatDate()', () => {
  it('retourne "—" si null',             () => expect(formatDate(null)).toBe('—'))
  it('retourne "—" si undefined',        () => expect(formatDate(undefined)).toBe('—'))
  it('retourne une date lisible en fr',  () => {
    const result = formatDate('2026-06-15')
    expect(result).toContain('2026')
  })
})

describe('niveauLabel()', () => {
  it('traduit DEBUTANT → Débutant',           () => expect(niveauLabel('DEBUTANT')).toBe('Débutant'))
  it('traduit INTERMEDIAIRE → Intermédiaire', () => expect(niveauLabel('INTERMEDIAIRE')).toBe('Intermédiaire'))
  it('traduit AVANCE → Avancé',               () => expect(niveauLabel('AVANCE')).toBe('Avancé'))
  it('traduit EXPERT → Expert',               () => expect(niveauLabel('EXPERT')).toBe('Expert'))
})

describe('niveauClass()', () => {
  it('retourne lvl-green pour DEBUTANT',      () => expect(niveauClass('DEBUTANT')).toBe('lvl-green'))
  it('retourne lvl-yellow pour INTERMEDIAIRE', () => expect(niveauClass('INTERMEDIAIRE')).toBe('lvl-yellow'))
  it('retourne lvl-orange pour AVANCE',       () => expect(niveauClass('AVANCE')).toBe('lvl-orange'))
  it('retourne lvl-red pour EXPERT',          () => expect(niveauClass('EXPERT')).toBe('lvl-red'))
})

describe('initials()', () => {
  it('retourne "?" si null',             () => expect(initials(null)).toBe('?'))
  it('retourne les initiales en majuscules', () => {
    expect(initials({ prenom: 'Alice', nom: 'Martin' })).toBe('AM')
  })
})
