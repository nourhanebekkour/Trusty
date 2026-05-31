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
describe('E2E – Dashboard – Rendu UI', () => {
  beforeEach(() => cy.visit('/dashboard'))

  it('affiche le titre "Tableau de Bord Étudiant"', () => {
    cy.contains('Tableau de Bord Étudiant').should('be.visible')
  })

  it('affiche le sous-titre de gestion', () => {
    cy.contains('Gérez vos réalisations').should('be.visible')
  })

  it('affiche le bouton "Aperçu Public"', () => {
    cy.contains('Aperçu Public').should('be.visible')
  })

  it('affiche le bouton "Générer mon URL Certifiée"', () => {
    cy.contains('Générer mon URL Certifiée').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Dashboard – Appels API', () => {
  it('charge les stats étudiant depuis le backend', () => {
    cy.intercept('GET', '**/etudiants/**').as('stats')
    cy.visit('/dashboard')
    cy.wait('@stats').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les projets depuis le backend', () => {
    cy.intercept('GET', '**/projets**').as('projets')
    cy.visit('/dashboard')
    cy.wait('@projets').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les recommandations depuis le backend', () => {
    cy.intercept('GET', '**/recommandations**').as('recos')
    cy.visit('/dashboard')
    cy.wait('@recos').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. NAVIGATION
// ============================================================
describe('E2E – Dashboard – Navigation', () => {
  beforeEach(() => cy.visit('/dashboard'))

  it('le bouton "Aperçu Public" navigue vers /portfolio', () => {
    cy.contains('Aperçu Public').click()
    cy.url().should('include', '/portfolio')
  })
})

// ============================================================
// 4. AUTH GUARD
// ============================================================
describe('E2E – Dashboard – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('reste sur /dashboard après rechargement', () => {
    loginRequest()
    cy.visit('/dashboard')
    cy.reload()
    cy.url().should('include', '/dashboard')
  })
})
