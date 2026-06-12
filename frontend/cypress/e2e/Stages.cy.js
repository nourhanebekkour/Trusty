const ETUDIANT = { email: 'etudiant@test.com', password: 'Password123!' }

const loginSession = () => {
  cy.session([ETUDIANT.email], () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { ...ETUDIANT, remember: false } })
  })
}

before(() => {
  cy.task('dbSeed')
})

after(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ============================================================
// 1. RENDU UI
// ============================================================
describe('E2E – Stages – Rendu UI', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/stage')
  })

  it('affiche le titre "Gestion des Stages"', () => {
    cy.contains('Gestion des stages').should('be.visible')
  })

  it('affiche le sous-titre', () => {
    cy.contains('Suivez vos expériences professionnelles').should('be.visible')
  })

  it('affiche le bouton "Nouveau stage"', () => {
    cy.contains('Nouveau stage').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Stages – Appels API', () => {
  it('charge les stages au chargement de la page', () => {
    loginSession()
    cy.intercept('GET', '**/stages/**').as('listeStages')
    cy.visit('/stage')
    cy.wait('@listeStages').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. CRÉATION
// ============================================================
describe('E2E – Stages – Création', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/stage')
  })

  it('ouvre la modale de création au clic sur "Nouveau stage"', () => {
    cy.contains('Nouveau stage').click()
    cy.get('.modal-overlay, .modal-box, [class*="modal"]').should('be.visible')
  })

  it('ferme la modale en cliquant sur Annuler', () => {
    cy.contains('Nouveau stage').click()
    cy.contains('button', /annuler/i).click()
    cy.get('.modal-overlay, .modal-box, [class*="modal"]').should('not.exist')
  })
})

// ============================================================
// 4. AUTH GUARD
// ============================================================
describe('E2E – Stages – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/stage')
    cy.url().should('include', '/login')
  })
})
