const PROFESSIONAL = { email: 'professional@test.com', password: 'Password123!' }

const loginSession = () => {
  cy.session([PROFESSIONAL.email], () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { ...PROFESSIONAL, remember: false } })
  })
}

before(() => {
  cy.task('dbSeed')
  cy.task('createProfessionalUser', PROFESSIONAL)
})

after(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ============================================================
// 1. RENDU UI – DASHBOARD
// ============================================================
describe('E2E – Professional – Rendu UI Dashboard', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professional/dashboard')
  })

  it('affiche le titre Dashboard', () => {
    cy.contains('Dashboard').should('be.visible')
  })

  it('affiche la vue d\'ensemble de l\'activité', () => {
    cy.contains('Vue d\'ensemble de votre activité').should('be.visible')
  })

  it('affiche les stats (Notifications, Recommandations, Stages)', () => {
    cy.contains('Notifications').should('exist')
    cy.contains('Recommandations').should('exist')
    cy.contains('Stages').should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Professional – Appels API', () => {
  it('charge les stages (candidats) depuis le backend', () => {
    loginSession()
    cy.intercept('GET', '**/stages**').as('stages')
    cy.visit('/professional/dashboard')
    cy.wait('@stages').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les notifications depuis le backend', () => {
    loginSession()
    cy.intercept('GET', '**/notifications**').as('notifs')
    cy.visit('/professional/notifications')
    cy.wait('@notifs').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. RECOMMANDATIONS
// ============================================================
describe('E2E – Professional – Recommandations', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professional/recommandations')
  })

  it('affiche la page des recommandations', () => {
    cy.get('body').should('be.visible')
  })

  it('charge les recommandations depuis le backend', () => {
    cy.intercept('GET', '**/recommandations**').as('recos')
    cy.reload()
    cy.wait('@recos').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 4. NAVIGATION
// ============================================================
describe('E2E – Professional – Navigation', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professional/dashboard')
  })

  it('navigue vers /professional/stages', () => {
    cy.visit('/professional/stages')
    cy.url().should('include', '/professional/stages')
  })

  it('navigue vers /professional/etudiants', () => {
    cy.visit('/professional/etudiants')
    cy.url().should('include', '/professional/etudiants')
  })

  it('navigue vers /professional/portfolios', () => {
    cy.visit('/professional/portfolios')
    cy.url().should('include', '/professional/portfolios')
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Professional – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/professional/dashboard')
    cy.url().should('include', '/login')
  })

  it('redirige un ÉTUDIANT qui tente d\'accéder à /professional', () => {
    cy.task('dbSeed')
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: 'etudiant@test.com', password: 'Password123!', remember: false } })
    cy.visit('/professional/dashboard')
    cy.url().should('not.include', '/professional/dashboard')
  })
})
