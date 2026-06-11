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
describe('E2E – Lettres de recommandation – Rendu UI', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/lettres')
  })

  it('affiche le titre "Lettres de recommandation"', () => {
    cy.contains('Lettres de recommandation').should('be.visible')
  })

  it('affiche le sous-titre de gestion', () => {
    cy.contains('Gérez vos demandes').should('be.visible')
  })

  it('affiche les stats (TOTAL, EN ATTENTE, VALIDÉES, LETTRES REÇUES)', () => {
    cy.contains('TOTAL DEMANDES').should('be.visible')
    cy.contains('EN ATTENTE').should('be.visible')
    cy.contains('VALIDÉES').should('be.visible')
    cy.contains('LETTRES REÇUES').should('be.visible')
  })

  it('affiche les onglets de vue (demandes / lettres reçues)', () => {
    cy.get('.view-btn, [class*="view-btn"]').should('have.length.greaterThan', 0)
  })

  it('affiche le bouton "Nouvelle demande"', () => {
    cy.contains('Nouvelle demande').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Lettres de recommandation – Appels API', () => {
  it('charge les recommandations reçues depuis le backend', () => {
    loginSession()
    cy.intercept('GET', '**/recommandations**').as('recos')
    cy.visit('/lettres')
    cy.wait('@recos').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. NAVIGATION ONGLETS
// ============================================================
describe('E2E – Lettres – Navigation', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/lettres')
  })

  it('affiche les tabs de filtrage (Tous, En attente, Validées)', () => {
    cy.contains(/tous|tout/i).should('exist')
    cy.contains(/attente/i).should('exist')
    cy.contains(/valid/i).should('exist')
  })

  it('bascule sur la vue "Lettres reçues"', () => {
    cy.get('.view-btn').last().click()
    cy.contains(/reçu|lettre/i).should('exist')
  })
})

// ============================================================
// 4. NOUVELLE DEMANDE
// ============================================================
describe('E2E – Lettres – Nouvelle demande', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/lettres')
  })

  it('ouvre le modal de demande au clic sur "Nouvelle demande"', () => {
    cy.contains('Nouvelle demande').click()
    cy.get('.modal, [class*="modal"], form').should('be.visible')
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Lettres – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/lettres')
    cy.url().should('include', '/login')
  })
})
