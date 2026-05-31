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
describe('E2E – Notifications – Rendu UI', () => {
  beforeEach(() => cy.visit('/notifications'))

  it('affiche le titre "Notifications"', () => {
    cy.contains('Notifications').should('be.visible')
  })

  it('affiche le sous-titre', () => {
    cy.contains('Suivez toutes vos alertes').should('be.visible')
  })

  it('affiche les cartes de statistiques', () => {
    cy.contains('TOTAL').should('be.visible')
    cy.contains('NON LUES').should('be.visible')
    cy.contains('LUES').should('be.visible')
    cy.contains("AUJOURD'HUI").should('be.visible')
  })

  it('affiche les onglets de filtrage', () => {
    cy.contains('Toutes').should('be.visible')
    cy.contains('Non lues').should('be.visible')
    cy.contains('Validations').should('be.visible')
    cy.contains('Recommandations').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Notifications – Appels API', () => {
  it('charge les notifications au chargement', () => {
    cy.intercept('GET', '**/notifications**').as('listeNotifs')
    cy.visit('/notifications')
    cy.wait('@listeNotifs').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. ONGLETS
// ============================================================
describe('E2E – Notifications – Onglets', () => {
  beforeEach(() => cy.visit('/notifications'))

  it('bascule sur l\'onglet "Non lues"', () => {
    cy.contains('button', 'Non lues').click()
    cy.contains('button', 'Non lues').should('have.class', /active|selected|tab-active/)
  })

  it('bascule sur l\'onglet "Validations"', () => {
    cy.contains('button', 'Validations').click()
    cy.contains('button', 'Validations').should('have.class', /active|selected|tab-active/)
  })

  it('bascule sur l\'onglet "Recommandations"', () => {
    cy.contains('button', 'Recommandations').click()
    cy.contains('button', 'Recommandations').should('have.class', /active|selected|tab-active/)
  })
})

// ============================================================
// 4. MARQUER COMME LU
// ============================================================
describe('E2E – Notifications – Marquer comme lu', () => {
  beforeEach(() => cy.visit('/notifications'))

  it('affiche "Tout marquer comme lu" si des notifications non lues existent', () => {
    cy.get('body').then($body => {
      if ($body.text().includes('Tout marquer comme lu')) {
        cy.contains('Tout marquer comme lu').should('be.visible')
      }
    })
  })

  it('"Tout marquer comme lu" envoie des requêtes PUT au backend', () => {
    cy.intercept('PUT', '**/notifications/**/lire').as('markRead')
    cy.get('body').then($body => {
      if ($body.text().includes('Tout marquer comme lu')) {
        cy.contains('Tout marquer comme lu').click()
        cy.wait('@markRead')
      }
    })
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Notifications – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/notifications')
    cy.url().should('include', '/login')
  })
})
