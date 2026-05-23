// cypress/e2e/login.e2e.cy.js

const ETUDIANT = { email: 'etudiant@test.com', password: 'Password123!' }
const PROF     = { email: 'prof@test.com',     password: 'Password123!' }
const ADMIN    = { email: 'admin@test.com',    password: 'Password123!' }
const UNKNOWN  = { email: 'nobody@test.com',   password: 'Password123!' }
const BAD_PASS = { email: 'etudiant@test.com', password: 'WrongPass99!' }
const INACTIF  = { email: 'inactif@test.com',  password: 'Password123!' }

// ============================================================
// HELPERS
// ============================================================
const fillAndSubmit = (email, password) => {
  cy.get('input[type="email"]').clear().type(email)
  cy.get('input[type="password"]').clear().type(password)
  cy.contains('button', 'Se connecter →').click()
}

const waitForApi = () =>
  cy.intercept('POST', '**/auth/login**').as('loginCall')

// ============================================================
// SETUP
// ============================================================
before(() => {
  cy.task('dbSeed')
  cy.task('createInactifUser', INACTIF)
})

after(() => {
  cy.task('deleteUserByEmail', INACTIF.email)
})

afterEach(() => {
  cy.request({ url: '/api/auth/logout', method: 'POST', failOnStatusCode: false })
  cy.clearCookies()
})

// ============================================================
// 1. UI RENDERING
// ============================================================
describe('E2E – UI Rendering', () => {
  beforeEach(() => cy.visit('/login'))

  it('affiche le branding TRUSTY et le slogan', () => {
    cy.contains('strong', 'TRUSTY').should('be.visible')
    cy.contains('Certifiez votre excellence').should('be.visible')
    cy.contains('académique.').should('be.visible')
    cy.contains('La première plateforme').should('be.visible')
  })

  it('affiche tous les éléments du formulaire', () => {
    cy.contains('h2', 'Bon retour parmi nous').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('input#remember').should('exist')
    cy.contains('label', 'Se souvenir de moi').should('be.visible')
    cy.contains('button', 'Se connecter →').should('be.visible')
    cy.contains('button', 'Consulter les portfolios publics').should('be.visible')
  })

  it('le bouton "Se connecter" est désactivé si les champs sont vides', () => {
    cy.contains('button', 'Se connecter →').should('be.disabled')
  })

  it('le bouton "Se connecter" est désactivé si seul l\'email est rempli', () => {
    cy.get('input[type="email"]').type(ETUDIANT.email)
    cy.contains('button', 'Se connecter →').should('be.disabled')
  })

  it('le bouton "Se connecter" est désactivé si seul le mot de passe est rempli', () => {
    cy.get('input[type="password"]').type(ETUDIANT.password)
    cy.contains('button', 'Se connecter →').should('be.disabled')
  })

  it('le bouton "Se connecter" s\'active quand les deux champs sont remplis', () => {
    cy.get('input[type="email"]').type(ETUDIANT.email)
    cy.get('input[type="password"]').type(ETUDIANT.password)
    cy.contains('button', 'Se connecter →').should('not.be.disabled')
  })
})

// ============================================================
// 2. VALIDATION CÔTÉ CLIENT
// ============================================================
describe('E2E – Validation client', () => {
  beforeEach(() => cy.visit('/login'))

  it('affiche "Email invalide" pour un email malformé', () => {
    cy.get('input[type="email"]')
      .invoke('val', 'not-an-email')
      .trigger('input')
    cy.get('input[type="password"]').type(ETUDIANT.password)
    cy.get('form').invoke('submit')
    cy.contains('Email invalide').should('be.visible')
  })

  it('affiche une erreur pour un mot de passe < 8 caractères', () => {
    cy.get('input[type="email"]').type(ETUDIANT.email)
    cy.get('input[type="password"]').type('Ab1!')
    cy.contains('button', 'Se connecter →').click()
    cy.contains('Min 8 caractères').should('be.visible')
  })

  it('affiche une erreur pour un mot de passe sans majuscule', () => {
    cy.get('input[type="email"]').type(ETUDIANT.email)
    cy.get('input[type="password"]').type('weakpass1!')
    cy.contains('button', 'Se connecter →').click()
    cy.contains('Min 8 caractères, majuscule, minuscule, nombre et symbole').should('be.visible')
  })

  it('n\'envoie pas de requête si la validation client échoue', () => {
    waitForApi()
    cy.get('input[type="email"]').type(ETUDIANT.email)
    cy.get('input[type="password"]').type('weak')
    cy.contains('button', 'Se connecter →').click()
    cy.get('@loginCall').should('not.exist')
  })
})

// ============================================================
// 3. CONNEXION RÉUSSIE
// ============================================================
describe('E2E – Connexion réussie', () => {
  beforeEach(() => cy.visit('/login'))

  it('connecte un ÉTUDIANT et redirige vers /dashboard', () => {
    waitForApi()
    fillAndSubmit(ETUDIANT.email, ETUDIANT.password)
    cy.wait('@loginCall').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
  })

  it('connecte un PROFESSEUR et redirige vers /dashboard', () => {
    waitForApi()
    fillAndSubmit(PROF.email, PROF.password)
    cy.wait('@loginCall').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
  })

  it('connecte un ADMINISTRATEUR et redirige vers /dashboard', () => {
    waitForApi()
    fillAndSubmit(ADMIN.email, ADMIN.password)
    cy.wait('@loginCall').its('response.statusCode').should('eq', 200)
    cy.url().should('include', '/dashboard')
  })

  it('le cookie HttpOnly est bien posé après connexion', () => {
    fillAndSubmit(ETUDIANT.email, ETUDIANT.password)
    cy.url().should('include', '/dashboard')
    cy.request('/api/auth/me').its('status').should('eq', 200)
  })

  it('affiche "Connexion..." pendant la requête', () => {
    cy.intercept('POST', '**/auth/login**', (req) => {
      req.on('response', (res) => res.setDelay(800))
    }).as('slowLogin')
    fillAndSubmit(ETUDIANT.email, ETUDIANT.password)
    cy.contains('button', 'Connexion...').should('be.visible').and('be.disabled')
    cy.wait('@slowLogin')
  })
})

// ============================================================
// 4. ÉCHECS D'AUTHENTIFICATION
// ⚠️  Le backend renvoie toujours 401 (email inexistant,
//     mauvais mot de passe ET compte inactif)
// ============================================================
describe('E2E – Échecs d\'authentification', () => {
  beforeEach(() => cy.visit('/login'))

  it('affiche une erreur pour un email inexistant', () => {
    waitForApi()
    fillAndSubmit(UNKNOWN.email, UNKNOWN.password)
    cy.wait('@loginCall').its('response.statusCode').should('eq', 401)
    cy.contains('Email ou mot de passe invalide').should('be.visible')
  })

  it('affiche une erreur pour un mauvais mot de passe', () => {
    waitForApi()
    fillAndSubmit(BAD_PASS.email, BAD_PASS.password)
    cy.wait('@loginCall').its('response.statusCode').should('eq', 401)
    cy.contains('Email ou mot de passe invalide').should('be.visible')
  })

  it('affiche une erreur pour un compte INACTIF', () => {
    waitForApi()
    fillAndSubmit(INACTIF.email, INACTIF.password)
    cy.wait('@loginCall').its('response.statusCode').should('eq', 401)
    // Le backend renvoie ce message exact pour les comptes inactifs
    cy.contains('Compte inactif').should('be.visible')
  })

  it('ne redirige pas en cas d\'échec', () => {
    fillAndSubmit(UNKNOWN.email, UNKNOWN.password)
    cy.url().should('include', '/login')
  })

  it('le formulaire reste utilisable après un échec', () => {
    fillAndSubmit(BAD_PASS.email, BAD_PASS.password)
    cy.contains('Email ou mot de passe invalide').should('be.visible')
    cy.get('input[type="password"]').clear().type(ETUDIANT.password)
    cy.contains('button', 'Se connecter →').should('not.be.disabled')
  })
})

// ============================================================
// 5. BRUTE FORCE
// ============================================================
describe('E2E – Brute force protection', () => {
  beforeEach(() => cy.visit('/login'))

  it('verrouille le formulaire après 3 échecs consécutifs', () => {
    for (let i = 0; i < 3; i++) {
      fillAndSubmit(BAD_PASS.email, BAD_PASS.password)
      cy.contains('Email ou mot de passe invalide').should('be.visible')
    }
    cy.contains('button', 'Se connecter →').should('be.disabled')
  })
})

// ============================================================
// 6. SE SOUVENIR DE MOI
// ============================================================
describe('E2E – Se souvenir de moi', () => {
  beforeEach(() => cy.visit('/login'))

  it('la checkbox est décochée par défaut', () => {
    cy.get('input#remember').should('not.be.checked')
  })

  it('peut être cochée et décochée', () => {
    cy.get('input#remember').check().should('be.checked')
    cy.get('input#remember').uncheck().should('not.be.checked')
  })

  it('envoie remember=true dans le body quand cochée', () => {
    cy.intercept('POST', '**/auth/login**', (req) => {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      expect(body.remember).to.eq(true)
      req.continue()
    }).as('loginWithRemember')
    cy.get('input#remember').check()
    fillAndSubmit(ETUDIANT.email, ETUDIANT.password)
    cy.wait('@loginWithRemember')
  })
})

// ============================================================
// 7. AUTH GUARD
// ============================================================
describe('E2E – Auth Guard', () => {
  it('redirige vers /login si on accède à /dashboard sans être connecté', () => {
    cy.clearCookies()
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('reste sur /dashboard si on est connecté', () => {
    cy.visit('/login')
    fillAndSubmit(ETUDIANT.email, ETUDIANT.password)
    cy.url().should('include', '/dashboard')
    cy.reload()
    cy.url().should('include', '/dashboard')
  })
})

// ============================================================
// 8. ACCESSIBILITÉ
// ============================================================
describe('E2E – Accessibilité', () => {
  beforeEach(() => cy.visit('/login'))

  it('email a autocomplete="username"', () => {
    cy.get('input[type="email"]').should('have.attr', 'autocomplete', 'username')
  })

  it('password a autocomplete="current-password"', () => {
    cy.get('input[type="password"]').should('have.attr', 'autocomplete', 'current-password')
  })

  it('le label "Se souvenir de moi" est associé à la checkbox', () => {
    cy.get('label[for="remember"]').should('exist')
    cy.get('input#remember').should('exist')
  })
})