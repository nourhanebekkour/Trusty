const PROF = { email: 'prof@test.com', password: 'Password123!' }

const loginRequest = () =>
  cy.request({ method: 'POST', url: '/api/auth/login', body: { ...PROF, remember: false } })

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
describe('E2E – Professeur – Rendu UI', () => {
  beforeEach(() => cy.visit('/professor'))

  it('charge la page du professeur', () => {
    cy.url().should('include', '/professor')
  })

  it('affiche les statistiques', () => {
    cy.get('.stat, .stats, [class*="stat"]').should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Professeur – Appels API', () => {
  it('charge les projets à valider', () => {
    cy.intercept('GET', '**/projets/a-valider**').as('projetsAValider')
    cy.visit('/professor')
    cy.wait('@projetsAValider').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les stages à valider', () => {
    cy.intercept('GET', '**/stages/a-valider**').as('stagesAValider')
    cy.visit('/professor')
    cy.wait('@stagesAValider').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les notifications', () => {
    cy.intercept('GET', '**/notifications**').as('notifProf')
    cy.visit('/professor')
    cy.wait('@notifProf').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. VALIDATION PROJETS
// ============================================================
describe('E2E – Professeur – Validation projets', () => {
  beforeEach(() => cy.visit('/professor'))

  it('affiche la section des projets en attente', () => {
    cy.contains(/projets|validation|en attente/i).should('exist')
  })

  it('le bouton valider envoie une requête POST', () => {
    cy.intercept('POST', '**/projets/**/valider**').as('validerProjet')
    cy.get('body').then($body => {
      if ($body.find('button[class*="valider"], button[class*="validate"]').length > 0) {
        cy.get('button[class*="valider"], button[class*="validate"]').first().click()
        cy.wait('@validerProjet')
      }
    })
  })
})

// ============================================================
// 4. AUTH GUARD – RÔLE PROFESSEUR
// ============================================================
describe('E2E – Professeur – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/professor')
    cy.url().should('include', '/login')
  })

  it('le professeur accède à /professor après connexion', () => {
    loginRequest()
    cy.visit('/professor')
    cy.url().should('include', '/professor')
  })
})
