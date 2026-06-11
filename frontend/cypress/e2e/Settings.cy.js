const ETUDIANT = { email: 'etudiant@test.com', password: 'Password123!' }

const loginSession = () => {
  cy.session([ETUDIANT.email], () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { ...ETUDIANT, remember: false } })
  })
}

before(() => { cy.task('dbSeed') })
after(() => { cy.clearCookies(); cy.clearLocalStorage() })

// ============================================================
// 1. RENDU UI
// ============================================================
describe('E2E – Settings – Rendu UI', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/settings')
  })

  it('affiche la page paramètres sans erreur', () => {
    cy.get('body').should('be.visible')
  })

  it('affiche une section thème ou apparence', () => {
    cy.contains(/thème|apparence|dark|light|mode/i).should('exist')
  })

  it('affiche une section informations du compte', () => {
    cy.contains(/compte|profil|informations/i).should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Settings – Appels API', () => {
  it('charge les informations utilisateur au chargement', () => {
    loginSession()
    cy.intercept('GET', '**/auth/me**').as('me')
    cy.visit('/settings')
    cy.wait('@me').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. MODIFICATION
// ============================================================
describe('E2E – Settings – Modification', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/settings')
  })

  it('appelle PUT /utilisateurs/:id lors de la mise à jour du compte', () => {
    cy.intercept('PUT', '**/utilisateurs/**').as('updateUser')
    cy.get('input[type="text"], input[type="email"]').first().clear().type('nouveautest@test.com')
    cy.contains(/enregistrer|sauvegarder|mettre à jour/i).click()
    cy.wait('@updateUser').its('response.statusCode').should('be.oneOf', [200, 201])
  })
})

// ============================================================
// 4. THÈME
// ============================================================
describe('E2E – Settings – Thème', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/settings')
  })

  it('change le thème au clic sur le bouton dark/light', () => {
    cy.contains(/dark|light|sombre|clair/i).first().click()
    cy.get('body, html').invoke('attr', 'class').then(cls => {
      expect(cls).to.match(/dark|light|theme/i)
    })
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Settings – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/settings')
    cy.url().should('include', '/login')
  })
})
