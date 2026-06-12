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
describe('E2E – Profile – Rendu UI', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/profile')
  })

  it('affiche la page profil sans erreur', () => {
    cy.get('body').should('be.visible')
  })

  it('affiche une section compétences', () => {
    cy.contains(/compétence/i).should('exist')
  })

  it('affiche une section badges', () => {
    cy.contains(/badge/i).should('exist')
  })

  it('affiche une section projets', () => {
    cy.contains(/projet/i).should('exist')
  })

  it('affiche le nom ou prénom de l\'utilisateur connecté', () => {
    cy.contains(/etudiant|test/i).should('exist')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Profile – Appels API', () => {
  it('appelle GET /auth/me au chargement', () => {
    loginSession()
    cy.intercept('GET', '**/auth/me**').as('me')
    cy.visit('/profile')
    cy.wait('@me').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('appelle GET /etudiants/:id pour récupérer le profil', () => {
    loginSession()
    cy.intercept('GET', '**/etudiants/**').as('etudiant')
    cy.visit('/profile')
    cy.wait('@etudiant').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('appelle GET /competences/etudiant/:id', () => {
    loginSession()
    cy.intercept('GET', '**/competences/**').as('competences')
    cy.visit('/profile')
    cy.wait('@competences').its('response.statusCode').should('be.oneOf', [200, 304])
  })

  it('appelle GET /badges/etudiant/:id', () => {
    loginSession()
    cy.intercept('GET', '**/badges/**').as('badges')
    cy.visit('/profile')
    cy.wait('@badges').its('response.statusCode').should('be.oneOf', [200, 304])
  })
})

// ============================================================
// 3. MODIFICATION PROFIL
// ============================================================
describe('E2E – Profile – Modification', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/profile')
  })

  it('ouvre le formulaire de modification au clic sur Modifier', () => {
    cy.contains(/modifier/i).first().click()
    cy.get('form, .modal, [class*="modal"]').should('exist')
  })

  it('appelle PUT /etudiants/:id lors de la sauvegarde du profil', () => {
    cy.intercept('PUT', '**/etudiants/**').as('saveProfile')
    cy.contains(/modifier/i).first().click()
    cy.get('input[type="text"]').first().clear().type('Test')
    cy.contains(/enregistrer|sauvegarder/i).click()
    cy.wait('@saveProfile').its('response.statusCode').should('be.oneOf', [200, 201])
  })
})

// ============================================================
// 4. COMPÉTENCES
// ============================================================
describe('E2E – Profile – Compétences', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/profile')
  })

  it('affiche le bouton pour ajouter une compétence', () => {
    cy.contains(/ajouter/i).should('exist')
  })

  it('appelle POST /competences/ lors de l\'ajout d\'une compétence', () => {
    cy.intercept('POST', '**/competences**').as('addSkill')
    cy.contains(/ajouter/i).first().click()
    cy.get('input[type="text"]').last().type('Vue.js')
    cy.contains(/valider|ajouter|confirmer/i).last().click()
    cy.wait('@addSkill').its('response.statusCode').should('be.oneOf', [200, 201])
  })
})

// ============================================================
// 5. AUTH GUARD
// ============================================================
describe('E2E – Profile – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })

  it('reste sur /profile si connecté', () => {
    loginSession()
    cy.visit('/profile')
    cy.url().should('include', '/profile')
  })
})
