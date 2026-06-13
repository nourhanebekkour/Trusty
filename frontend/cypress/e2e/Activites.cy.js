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
describe('E2E – Activités – Rendu UI', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/activites')
  })

  it('affiche le titre "Activités Parascolaires"', () => {
    cy.contains('Activités Parascolaires').should('be.visible')
  })

  it('affiche le sous-titre de gestion', () => {
    cy.contains('Gérez vos engagements extracurriculaires').should('be.visible')
  })

  it('affiche le bouton "Ajouter une activité"', () => {
    cy.contains('Ajouter une activité').should('be.visible')
  })

  it('affiche les stats en haut de page', () => {
    cy.get('.stats-cards, [class*="stat"]').should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Activités – Appels API', () => {
  it('charge les activités depuis le backend au chargement', () => {
    loginSession()
    cy.intercept('GET', '**/api/activites/**').as('activites')
    cy.visit('/activites')
    cy.wait('@activites').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. CRÉATION D'ACTIVITÉ
// ============================================================
describe('E2E – Activités – Création', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/activites')
  })

  it('ouvre le modal au clic sur "Ajouter une activité"', () => {
    cy.contains('Ajouter une activité').click()
    cy.get('.modal, [class*="modal"], form').should('be.visible')
  })

  it('appelle POST /activites/etudiant/:id lors de la création', () => {
    cy.intercept('POST', '**/api/activites/**', { statusCode: 201, body: { id: 'test-id' } }).as('createActivite')
    cy.contains('Ajouter une activité').click()
    cy.get('select').first().select(1)
    cy.get('input[type="text"]').first().type('Club de robotique')
    cy.get('input[type="text"]').eq(1).type('ENSA Tanger')
    cy.get('input[type="text"]').eq(2).type('Participant')
    cy.get('.btn-submit').click()
    cy.wait('@createActivite').its('response.statusCode').should('be.oneOf', [200, 201])
  })
})

// ============================================================
// 4. ÉTAT VIDE
// ============================================================
describe('E2E – Activités – État vide', () => {
  it('affiche "Aucune activité trouvée" si la liste est vide', () => {
    loginSession()
    cy.intercept('GET', '**/api/activites/**', (req) => {
      req.reply({ statusCode: 200, body: [], headers: { 'Content-Type': 'application/json' } })
    }).as('emptyActivites')
    cy.visit('/activites')
    cy.wait('@emptyActivites')
    cy.url().should('include', '/activites')
    cy.get('.loading-state').should('not.exist')
    cy.contains('Aucune activité trouvée').should('be.visible')
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Activités – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/activites')
    cy.url().should('include', '/login')
  })
})
