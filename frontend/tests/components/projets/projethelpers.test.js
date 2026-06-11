import { describe, it, expect } from 'vitest'
import {
  nomComplet, initiales, formatType, formatStatut, formatNiveau,
  formatDate, emptyForm, buildPayload, badgeClass,
  participantsList, firstParticipantInitials,
} from '@/components/projets/projetHelpers'

describe('nomComplet()', () => {
  it('retourne "—" si null', () => expect(nomComplet(null)).toBe('—'))

  it('retourne prénom + nom depuis utilisateur', () => {
    expect(nomComplet({ utilisateur: { prenom: 'Alice', nom: 'Martin' } })).toBe('Alice Martin')
  })

  it('retourne @username si pas d\'utilisateur', () => {
    expect(nomComplet({ github_username: 'alicemartin' })).toBe('@alicemartin')
  })
})

describe('initiales()', () => {
  it('retourne "?" si null', () => expect(initiales(null)).toBe('?'))

  it('retourne les initiales en majuscules', () => {
    expect(initiales({ utilisateur: { prenom: 'Alice', nom: 'Martin' } })).toBe('AM')
  })
})

describe('formatType()', () => {
  it('traduit MODULE → Module',      () => expect(formatType('MODULE')).toBe('Module'))
  it('traduit PFA → PFA',            () => expect(formatType('PFA')).toBe('PFA'))
  it('traduit HACKATHON → Hackathon', () => expect(formatType('HACKATHON')).toBe('Hackathon'))
  it('retourne la valeur brute si inconnue', () => expect(formatType('INCONNU')).toBe('INCONNU'))
})

describe('formatStatut()', () => {
  it('traduit VALIDE → Validé',       () => expect(formatStatut('VALIDE')).toBe('Validé'))
  it('traduit EN_ATTENTE → En attente', () => expect(formatStatut('EN_ATTENTE')).toBe('En attente'))
  it('traduit REJETE → Refusé',       () => expect(formatStatut('REJETE')).toBe('Refusé'))
})

describe('formatNiveau()', () => {
  it('traduit DEBUTANT → Débutant',         () => expect(formatNiveau('DEBUTANT')).toBe('Débutant'))
  it('traduit INTERMEDIAIRE → Intermédiaire', () => expect(formatNiveau('INTERMEDIAIRE')).toBe('Intermédiaire'))
  it('traduit AVANCE → Avancé',             () => expect(formatNiveau('AVANCE')).toBe('Avancé'))
})

describe('formatDate()', () => {
  it('retourne "—" si null', () => expect(formatDate(null)).toBe('—'))
  it('retourne une date lisible', () => {
    const result = formatDate('2026-01-15')
    expect(result).toMatch(/janv|jan/i)
    expect(result).toContain('2026')
  })
})

describe('badgeClass()', () => {
  it('retourne badge--valide pour VALIDE',       () => expect(badgeClass('VALIDE')).toBe('badge--valide'))
  it('retourne badge--attente pour EN_ATTENTE', () => expect(badgeClass('EN_ATTENTE')).toBe('badge--attente'))
  it('retourne badge--rejete pour REJETE',      () => expect(badgeClass('REJETE')).toBe('badge--rejete'))
  it('retourne "" pour statut inconnu',         () => expect(badgeClass('AUTRE')).toBe(''))
})

describe('emptyForm()', () => {
  it('retourne un objet avec toutes les clés requises', () => {
    const form = emptyForm()
    expect(form).toHaveProperty('titre', '')
    expect(form).toHaveProperty('type_projet', '')
    expect(form).toHaveProperty('est_public', true)
  })
})

describe('buildPayload()', () => {
  it('supprime les champs optionnels vides', () => {
    const form = { ...emptyForm(), titre: 'Test', type_projet: 'PFA' }
    const payload = buildPayload(form)
    expect(payload).not.toHaveProperty('lien_github')
    expect(payload).not.toHaveProperty('date_fin')
  })

  it('conserve les champs renseignés', () => {
    const form = { ...emptyForm(), titre: 'Test', lien_github: 'https://github.com/test' }
    const payload = buildPayload(form)
    expect(payload.lien_github).toBe('https://github.com/test')
  })
})

describe('participantsList()', () => {
  it('retourne "—" si participations vide', () => {
    expect(participantsList([])).toBe('—')
  })

  it('retourne les noms séparés par des virgules', () => {
    const participations = [
      { etudiant: { utilisateur: { prenom: 'Alice', nom: 'Martin' } } },
      { etudiant: { utilisateur: { prenom: 'Bob', nom: 'Dupont' } } },
    ]
    expect(participantsList(participations)).toBe('Alice Martin, Bob Dupont')
  })
})
