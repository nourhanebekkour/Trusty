const ETUDIANT = { email: 'etudiant@test.com', password: 'Password123!' }

const loginRequest = () =>
  cy.request({ method: 'POST', url: '/api/auth/login', body: { ...ETUDIANT, remember: false } })

before(() => {
  cy.task('dbSeed')
  loginRequest()
})

after(() => {
  cy.request({ url: '/api/auth/logout', method: 'POST', failOnStatusCode: false })
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ============================================================
// 1. RENDU UI
// ============================================================
describe('E2E – Recommandations – Rendu UI', () => {
  beforeEach(() => cy.visit('/recommendations'))

  it('affiche le titre "Recommandations"', () => {
    cy.contains('Recommandations').should('be.visible')
  })

  it('affiche le sous-titre', () => {
    cy.contains('Gérez les recommandations').should('be.visible')
  })

  it('affiche les onglets de filtrage', () => {
    cy.contains('Toutes').should('be.visible')
    cy.contains('En attente').should('be.visible')
    cy.contains('Validées').should('be.visible')
    cy.contains('Rejetées').should('be.visible')
  })

  it('affiche les cartes de statistiques', () => {
    cy.contains('TOTAL REÇUES').should('be.visible')
    cy.contains('VALIDÉES').should('be.visible')
    cy.contains('EN ATTENTE').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Recommandations – Appels API', () => {
  it('charge les recommandations au chargement', () => {
    cy.intercept('GET', '**/recommandations**').as('listeRecos')
    cy.visit('/recommendations')
    cy.wait('@listeRecos').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. ONGLETS
// ============================================================
describe('E2E – Recommandations – Onglets', () => {
  beforeEach(() => cy.visit('/recommendations'))

  it('bascule sur l\'onglet "En attente"', () => {
    cy.contains('button', 'En attente').click()
    cy.contains('button', 'En attente').should('have.class', /active|selected|tab-active/)
  })

  it('bascule sur l\'onglet "Validées"', () => {
    cy.contains('button', 'Validées').click()
    cy.contains('button', 'Validées').should('have.class', /active|selected|tab-active/)
  })

  it('bascule sur l\'onglet "Rejetées"', () => {
    cy.contains('button', 'Rejetées').click()
    cy.contains('button', 'Rejetées').should('have.class', /active|selected|tab-active/)
  })

  it('revient sur l\'onglet "Toutes"', () => {
    cy.contains('button', 'Rejetées').click()
    cy.contains('button', 'Toutes').click()
    cy.contains('button', 'Toutes').should('have.class', /active|selected|tab-active/)
  })
})

// ============================================================
// 4. AUTH GUARD
// ============================================================
describe('E2E – Recommandations – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/recommendations')
    cy.url().should('include', '/login')
  })
})
