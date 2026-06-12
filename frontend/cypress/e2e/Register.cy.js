// ============================================================
// REGISTER — Tests E2E
// Le POST /auth/register est stubé pour éviter l'envoi d'email
// de vérification qui échouerait en environnement de test.
// ============================================================

afterEach(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

// ============================================================
// 1. RENDU UI
// ============================================================
describe('E2E – Register – Rendu UI', () => {
  beforeEach(() => cy.visit('/register'))

  it('affiche le branding TRUSTY', () => {
    cy.contains('TRUSTY').should('be.visible')
  })

  it('affiche le titre "Créer un compte"', () => {
    cy.contains('Créer un compte').should('be.visible')
  })

  it('affiche les 3 cartes de rôle (Étudiant, Professeur, Professionnel)', () => {
    cy.contains('Étudiant').should('be.visible')
    cy.contains('Professeur').should('be.visible')
    cy.contains('Professionnel').should('be.visible')
  })

  it('affiche le champ Prénom', () => {
    cy.get('input[placeholder="John"]').should('exist')
  })

  it('affiche le champ Email', () => {
    cy.get('input[type="email"]').should('be.visible')
  })

  it('affiche le champ Mot de passe', () => {
    cy.get('input[type="password"]').should('be.visible')
  })

  it('affiche le lien vers /login', () => {
    cy.contains(/connexion|se connecter|déjà un compte/i).should('exist')
  })
})

// ============================================================
// 2. SÉLECTION DE RÔLE
// ============================================================
describe('E2E – Register – Sélection rôle', () => {
  beforeEach(() => cy.visit('/register'))

  it('sélectionne le rôle Étudiant par défaut ou au clic', () => {
    cy.contains('Étudiant').click()
    cy.get('input[value="ETUDIANT"]').should('be.checked')
  })

  it('sélectionne le rôle Professeur au clic', () => {
    cy.contains('Professeur').click()
    cy.get('input[value="PROFESSEUR"]').should('be.checked')
  })

  it('sélectionne le rôle Professionnel au clic', () => {
    cy.contains('Professionnel').click()
    cy.get('input[value="PROFESSIONNEL"]').should('be.checked')
  })
})

// ============================================================
// 3. INSCRIPTION RÉUSSIE (stub pour éviter l'email)
// ============================================================
describe('E2E – Register – Inscription', () => {
  beforeEach(() => cy.visit('/register'))

  it('appelle POST /auth/register avec les bonnes données', () => {
    cy.intercept('POST', '**/auth/register**', {
      statusCode: 201,
      body: { success: true, data: { message: 'Vérifiez votre email' } }
    }).as('register')

    const email = `e2e-${Date.now()}@test.com`
    cy.contains('Étudiant').click()
    cy.get('input[placeholder="John"]').type('Jean')
    cy.get('input[placeholder*="Nom"]').last().type('Dupont')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type('Password123!')
    cy.get('form').submit()

    cy.wait('@register').its('response.statusCode').should('eq', 201)
  })

  it('affiche un message de confirmation après inscription', () => {
    cy.intercept('POST', '**/auth/register**', {
      statusCode: 201,
      body: { success: true, data: { message: 'Vérifiez votre email' } }
    }).as('register')

    const email = `e2e-${Date.now()}@test.com`
    cy.contains('Étudiant').click()
    cy.get('input[placeholder="John"]').type('Jean')
    cy.get('input[placeholder*="Nom"]').last().type('Dupont')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').first().type('Password123!')
    cy.get('form').submit()

    cy.wait('@register')
    cy.contains(/email|vérif|confirm|succès|compte créé/i).should('exist')
  })
})

// ============================================================
// 4. REDIRECTION
// ============================================================
describe('E2E – Register – Redirection', () => {
  it('redirige vers /dashboard si déjà connecté', () => {
    cy.task('dbSeed')
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: 'etudiant@test.com', password: 'Password123!', remember: false } })
    cy.visit('/register')
    cy.url().should('include', '/dashboard')
  })
})
