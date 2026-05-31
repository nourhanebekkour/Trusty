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
describe('E2E – Projets – Rendu UI', () => {
  beforeEach(() => cy.visit('/projets'))

  it('affiche le titre "Projets"', () => {
    cy.contains('Projets').should('be.visible')
  })

  it('affiche le bouton "Nouveau projet"', () => {
    cy.contains('Nouveau projet').should('be.visible')
  })

  it('affiche le champ de recherche', () => {
    cy.get('input[placeholder*="projet"]').should('be.visible')
  })

  it('affiche le bouton Filtres', () => {
    cy.contains('Filtres').should('be.visible')
  })
})

// ============================================================
// 2. FILTRES
// ============================================================
describe('E2E – Projets – Filtres', () => {
  beforeEach(() => cy.visit('/projets'))

  it('ouvre le panneau de filtres', () => {
    cy.contains('Filtres').click()
    cy.contains('Réinitialiser').should('be.visible')
  })

  it('filtre par statut "Validé"', () => {
    cy.contains('Filtres').click()
    cy.contains('Validé').click()
    cy.get('input[placeholder*="projet"]').should('exist')
  })

  it('réinitialise les filtres', () => {
    cy.contains('Filtres').click()
    cy.contains('Validé').click()
    cy.contains('Réinitialiser').click()
    cy.contains('Tous').should('be.visible')
  })
})

// ============================================================
// 3. CRÉATION
// ============================================================
describe('E2E – Projets – Création', () => {
  beforeEach(() => cy.visit('/projets'))

  it('ouvre la modale de création', () => {
    cy.contains('Nouveau projet').click()
    cy.get('.modal-overlay, .modal-box, [class*="modal"]').should('be.visible')
  })

  it('crée un nouveau projet', () => {
    cy.intercept('POST', '**/projets**').as('createProjet')
    cy.contains('Nouveau projet').click()
    cy.get('input[placeholder*="titre"], input[name="titre"]').first().type('Projet E2E Test')
    cy.get('select[name="type_projet"], select').first().select('PERSONNEL')
    cy.get('textarea[name="description"], textarea').first().type('Description du projet de test E2E')
    cy.get('input[type="date"]').first().type('2024-01-01')
    cy.contains('button', /ajouter|créer|enregistrer/i).click()
    cy.wait('@createProjet').its('response.statusCode').should('eq', 201)
  })
})

// ============================================================
// 4. APPELS API
// ============================================================
describe('E2E – Projets – Appels API', () => {
  it('charge la liste des projets au chargement', () => {
    cy.intercept('GET', '**/projets**').as('listeProjets')
    cy.visit('/projets')
    cy.wait('@listeProjets').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 5. RECHERCHE
// ============================================================
describe('E2E – Projets – Recherche', () => {
  beforeEach(() => cy.visit('/projets'))

  it('filtre les projets en tapant dans la recherche', () => {
    cy.get('input[placeholder*="projet"]').type('test')
    cy.get('input[placeholder*="projet"]').should('have.value', 'test')
  })

  it('vide la recherche', () => {
    cy.get('input[placeholder*="projet"]').type('test').clear()
    cy.get('input[placeholder*="projet"]').should('have.value', '')
  })
})
