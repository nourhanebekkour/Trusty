const PROF = { email: 'prof@test.com', password: 'Password123!' }

const loginSession = () => {
  cy.session([PROF.email], () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { ...PROF, remember: false } })
  })
}

before(() => { cy.task('dbSeed') })
after(() => { cy.clearCookies(); cy.clearLocalStorage() })

// ============================================================
// 1. RENDU UI – DASHBOARD
// ============================================================
describe('E2E – Professor – Rendu UI Dashboard', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professor/dashboard')
  })

  it('affiche le titre "Tableau de Bord Professeur"', () => {
    cy.contains('Tableau de Bord Professeur').should('be.visible')
  })

  it('affiche le sous-titre de validation', () => {
    cy.contains('Validez les projets et stages').should('be.visible')
  })

  it('affiche les statistiques (en attente, validés)', () => {
    cy.get('[class*="stat"]').should('exist')
  })

  it('affiche la section projets à valider', () => {
    cy.contains(/projet/i).should('exist')
  })

  it('affiche la section stages', () => {
    cy.contains(/stage/i).should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Professor – Appels API', () => {
  it('charge les projets à valider depuis GET /projets/a-valider', () => {
    loginSession()
    cy.intercept('GET', '**/projets/a-valider**').as('projets')
    cy.visit('/professor/dashboard')
    cy.wait('@projets').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les stages à valider depuis GET /stages/a-valider', () => {
    loginSession()
    cy.intercept('GET', '**/stages/a-valider**').as('stages')
    cy.visit('/professor/dashboard')
    cy.wait('@stages').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('charge les notifications depuis GET /notifications', () => {
    loginSession()
    cy.intercept('GET', '**/notifications**').as('notifs')
    cy.visit('/professor/dashboard')
    cy.wait('@notifs').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. VALIDATION PROJETS
// ============================================================
describe('E2E – Professor – Validation projets', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professor/validations')
  })

  it('affiche la page des validations', () => {
    cy.get('body').should('be.visible')
  })

  it('affiche les projets en attente s\'il y en a', () => {
    cy.intercept('GET', '**/projets/a-valider**').as('projets')
    cy.reload()
    cy.wait('@projets').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 4. NOTIFICATIONS
// ============================================================
describe('E2E – Professor – Notifications', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professor/notifications')
  })

  it('affiche la page notifications', () => {
    cy.get('body').should('be.visible')
  })

  it('charge les notifications depuis le backend', () => {
    cy.intercept('GET', '**/notifications**').as('notifs')
    cy.reload()
    cy.wait('@notifs').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('marque une notification comme lue via PUT /notifications/:id/lire', () => {
    cy.intercept('PUT', '**/notifications/**/lire**').as('markRead')
    cy.get('[class*="notif"], .notification-item').first().click()
    cy.wait('@markRead').its('response.statusCode').should('be.oneOf', [200, 201, 204])
  })
})

// ============================================================
// 5. NAVIGATION
// ============================================================
describe('E2E – Professor – Navigation', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/professor/dashboard')
  })

  it('navigue vers /professor/validations', () => {
    cy.visit('/professor/validations')
    cy.url().should('include', '/professor/validations')
  })

  it('navigue vers /professor/portfolios', () => {
    cy.visit('/professor/portfolios')
    cy.url().should('include', '/professor/portfolios')
  })

  it('navigue vers /professor/recommandations', () => {
    cy.visit('/professor/recommandations')
    cy.url().should('include', '/professor/recommandations')
  })
})

// ============================================================
// 6. AUTH GUARD
// ============================================================
describe('E2E – Professor – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/professor/dashboard')
    cy.url().should('include', '/login')
  })

  it('redirige un ÉTUDIANT qui tente d\'accéder à /professor', () => {
    cy.task('dbSeed')
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: 'etudiant@test.com', password: 'Password123!', remember: false } })
    cy.visit('/professor/dashboard')
    cy.url().should('not.include', '/professor/dashboard')
  })
})
