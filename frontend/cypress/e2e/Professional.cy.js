const PROF_USER = { email: 'professional@test.com', password: 'Password123!' }

const login = () =>
  cy.request({ method: 'POST', url: '/api/auth/login', body: { ...PROF_USER, remember: false } })

const createProfessionalUser = () =>
  cy.task('createProfessionalUser', PROF_USER)

before(() => {
  cy.task('dbSeed')
  createProfessionalUser()
})

after(() => cy.task('deleteUserByEmail', PROF_USER.email))

afterEach(() => {
  cy.request({ url: '/api/auth/logout', method: 'POST', failOnStatusCode: false })
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ============================================================
// 1. RENDU UI
// ============================================================
describe('E2E – Professionnel – Rendu UI', () => {
  beforeEach(() => { login(); cy.visit('/professional') })

  it('charge la page du professionnel', () => {
    cy.url().should('include', '/professional')
  })

  it('affiche les statistiques', () => {
    cy.get('.stat, .stats, [class*="stat"]').should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Professionnel – Appels API', () => {
  it('charge les candidats au chargement', () => {
    cy.intercept('GET', '**/stages**').as('candidats')
    login()
    cy.visit('/professional')
    cy.wait('@candidats').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les notifications', () => {
    cy.intercept('GET', '**/notifications**').as('notifsPro')
    login()
    cy.visit('/professional')
    cy.wait('@notifsPro').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. AUTH GUARD – RÔLE PROFESSIONNEL
// ============================================================
describe('E2E – Professionnel – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/professional')
    cy.url().should('include', '/login')
  })

  it('redirige le professionnel vers /professional après connexion', () => {
    login()
    cy.visit('/login')
    cy.url().should('include', '/professional')
  })
})
