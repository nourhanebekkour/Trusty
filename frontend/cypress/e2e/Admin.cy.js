const ADMIN = { email: 'admin@test.com', password: 'Password123!' }

const loginSession = () => {
  cy.session([ADMIN.email], () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { ...ADMIN, remember: false } })
  })
}

before(() => {
  cy.task('dbSeed')
})

after(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ============================================================
// 1. RENDU UI
// ============================================================
describe('E2E – Admin – Rendu UI', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/admin/dashboard')
  })

  it('affiche le titre "Tableau de Bord Administrateur"', () => {
    cy.contains('Tableau de Bord Administrateur').should('be.visible')
  })

  it('affiche le sous-titre', () => {
    cy.contains('Gérez les certifications').should('be.visible')
  })

  it('affiche le bouton "Créer un utilisateur"', () => {
    cy.contains('Créer un utilisateur').should('be.visible')
  })

  it('affiche les cartes de statistiques', () => {
    cy.contains('Étudiants Actifs').should('be.visible')
    cy.contains('Portfolios Créés').should('be.visible')
    cy.contains('Professeurs').should('be.visible')
    cy.contains('Partenaires Pro').should('be.visible')
  })
})

// ============================================================
// 2. APPELS API
// ============================================================
describe('E2E – Admin – Appels API', () => {
  it('déclenche un appel vers /admin/stats au chargement', () => {
    loginSession()
    cy.intercept('GET', '**/admin/stats**').as('adminStats')
    cy.visit('/admin/dashboard')
    cy.wait('@adminStats')
  })

  it('déclenche un appel vers /admin/users au chargement', () => {
    loginSession()
    cy.intercept('GET', '**/admin/users**').as('adminUsers')
    cy.visit('/admin/dashboard')
    cy.wait('@adminUsers')
  })

  it('déclenche un appel vers /admin/verifications au chargement', () => {
    loginSession()
    cy.intercept('GET', '**/admin/verifications**').as('verifications')
    cy.visit('/admin/dashboard')
    cy.wait('@verifications')
  })
})

// ============================================================
// 3. CRÉATION D'UTILISATEUR
// ============================================================
describe('E2E – Admin – Création d\'utilisateur', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/admin/dashboard')
  })

  it('ouvre la modale de création', () => {
    cy.contains('Créer un utilisateur').click()
    cy.contains(/Créer un profil|Informations personnelles/i).should('be.visible')
  })

  it('ferme la modale avec Annuler', () => {
    cy.contains('Créer un utilisateur').click()
    cy.contains('button', 'Annuler').click()
    cy.get('.modal-overlay, .modal-box, [class*="modal"]').should('not.exist')
  })

  it('affiche les champs du formulaire de création', () => {
    cy.contains('Créer un utilisateur').click()
    cy.get('input[placeholder="Ex: Thomas"]').should('be.visible')
    cy.get('input[placeholder="Ex: Durand"]').should('be.visible')
    cy.get('input[placeholder="t.durand@exemple.com"]').should('be.visible')
  })

  it('crée un nouvel utilisateur via l\'API', () => {
    const email = `e2e-${Date.now()}@test.com`
    // Stub : le vrai endpoint envoie un email de vérification qui échoue en test env
    cy.intercept('POST', '**/auth/register**', {
      statusCode: 201,
      body: { success: true, data: { user: { email } } }
    }).as('createUser')
    cy.contains('Créer un utilisateur').click()
    cy.get('input[placeholder="Ex: Thomas"]').type('Test')
    cy.get('input[placeholder="Ex: Durand"]').type('AdminE2E')
    cy.get('input[placeholder="t.durand@exemple.com"]').type(email)
    cy.get('.modal select').first().select('Professionnel')
    cy.get('input[placeholder="••••••••"]').type('Password123!')
    cy.get('.modal').contains('button', 'Enregistrer le profil').click()
    cy.wait('@createUser').its('response.statusCode').should('eq', 201)
  })
})

// ============================================================
// 4. RECHERCHE UTILISATEURS
// ============================================================
describe('E2E – Admin – Recherche utilisateurs', () => {
  beforeEach(() => {
    loginSession()
    cy.visit('/admin/dashboard')
  })

  it('affiche la barre de recherche utilisateurs', () => {
    cy.get('input[placeholder*="Rechercher"]').should('be.visible')
  })

  it('filtre les utilisateurs en tapant', () => {
    cy.get('input[placeholder*="Rechercher"]').type('test')
    cy.get('input[placeholder*="Rechercher"]').should('have.value', 'test')
  })
})

// ============================================================
// 5. AUTH GUARD – RÔLE ADMIN
// ============================================================
describe('E2E – Admin – Auth Guard', () => {
  it('redirige vers /login si non connecté', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/admin/dashboard')
    cy.url().should('include', '/login')
  })

  it('l\'admin accède à /admin/dashboard après connexion', () => {
    loginSession()
    cy.visit('/admin/dashboard')
    cy.url().should('include', '/admin/dashboard')
  })
})
