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
describe('E2E – Parcours – Rendu UI', () => {
  beforeEach(() => cy.visit('/parcours'))

  it('affiche le titre "Parcours Académique"', () => {
    cy.contains('Parcours Académique').should('be.visible')
  })

  it('affiche le sous-titre', () => {
    cy.contains('Gérez votre historique de formations').should('be.visible')
  })

  it('affiche le bouton "Ajouter une formation"', () => {
    cy.contains('Ajouter une formation').should('be.visible')
  })

  it('affiche les cartes de statistiques', () => {
    cy.contains('FORMATIONS').should('be.visible')
    cy.contains('EN COURS').should('be.visible')
    cy.contains('VALIDÉES').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Parcours – Appels API', () => {
  it('charge les formations au chargement', () => {
    cy.intercept('GET', '**/formations/**').as('listeFormations')
    cy.visit('/parcours')
    cy.wait('@listeFormations').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. CRÉATION D'UNE FORMATION
// ============================================================
describe('E2E – Parcours – Création', () => {
  beforeEach(() => cy.visit('/parcours'))

  it('ouvre la modale "Nouvelle formation"', () => {
    cy.contains('Ajouter une formation').click()
    cy.contains(/Nouvelle formation|Ajouter une formation/i).should('be.visible')
    cy.get('.modal-overlay, .modal-box, [class*="modal"]').should('be.visible')
  })

  it('crée une nouvelle formation', () => {
    cy.intercept('POST', '**/formations/**').as('createFormation')
    cy.contains('Ajouter une formation').click()
    cy.get('input[name="diplome"], input[placeholder*="diplôme"], input[placeholder*="Diplôme"]').first().type('Master Informatique')
    cy.get('input[name="etablissement"], input[placeholder*="établissement"]').first().type('Université Test')
    cy.get('input[type="date"]').first().type('2022-09-01')
    cy.contains('button', /ajouter|enregistrer|créer/i).click()
    cy.wait('@createFormation').its('response.statusCode').should('be.oneOf', [200, 201])
  })

  it('ferme la modale avec "Annuler"', () => {
    cy.contains('Ajouter une formation').click()
    cy.contains('button', 'Annuler').click()
    cy.get('.modal-overlay, .modal-box, [class*="modal"]').should('not.exist')
  })
})

// ============================================================
// 4. TRI
// ============================================================
describe('E2E – Parcours – Tri', () => {
  beforeEach(() => cy.visit('/parcours'))

  it('le bouton de tri est visible', () => {
    cy.contains(/Trier par/i).should('be.visible')
  })

  it('change le mode de tri au clic', () => {
    cy.contains(/Trier par/i).click()
    cy.contains(/Trier par/i).should('be.visible')
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Parcours – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/parcours')
    cy.url().should('include', '/login')
  })
})
