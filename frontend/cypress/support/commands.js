// cypress/support/commands.js

// ─────────────────────────────────────────────
// LOGIN COMMANDS
// ─────────────────────────────────────────────

/**
 * Fills and submits the login form.
 * @example cy.login('test@ecole.fr', 'Secure@123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.get('input[type="email"]').clear().type(email)
  cy.get('input[type="password"]').clear().type(password)
  cy.contains('button', 'Se connecter →').click()
})

/**
 * Fills and submits the login form with "Se souvenir de moi" checked.
 * @example cy.loginWithRemember('test@ecole.fr', 'Secure@123')
 */
Cypress.Commands.add('loginWithRemember', (email, password) => {
  cy.get('input[type="email"]').clear().type(email)
  cy.get('input[type="password"]').clear().type(password)
  cy.get('input#remember').check()
  cy.contains('button', 'Se connecter →').click()
})

/**
 * Mocks a successful login response and submits the form.
 * Automatically waits for the intercepted request.
 * @example cy.loginSuccess('test@ecole.fr', 'Secure@123')
 */
Cypress.Commands.add('loginSuccess', (email, password) => {
  cy.intercept('POST', '**/login**', {
    statusCode: 200,
    body: { success: true, token: 'fake-jwt-token' }
  }).as('loginSuccess')

  cy.login(email, password)
  cy.wait('@loginSuccess')
})

/**
 * Mocks a failed login response (401) and submits the form.
 * Automatically waits for the intercepted request.
 * @example cy.loginFail('test@ecole.fr', 'Secure@123')
 */
Cypress.Commands.add('loginFail', (email, password) => {
  cy.intercept('POST', '**/login**', {
    statusCode: 401,
    body: { success: false }
  }).as('loginFail')

  cy.login(email, password)
  cy.wait('@loginFail')
})

/**
 * Triggers the brute-force lock by failing login MAX_ATTEMPTS times.
 * @param {string} email
 * @param {string} password
 * @param {number} attempts – default 3 (matches MAX_ATTEMPTS in the component)
 * @example cy.triggerLock()
 */
Cypress.Commands.add('triggerLock', (
  email = 'test@ecole.fr',
  password = 'Secure@123',
  attempts = 3
) => {
  cy.intercept('POST', '**/login**', {
    statusCode: 401,
    body: { success: false }
  }).as('loginFail')

  Cypress._.times(attempts, () => {
    cy.login(email, password)
    cy.wait('@loginFail')
  })
})