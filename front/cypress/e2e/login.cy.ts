/// <reference types="cypress" />

describe('Login spec', () => {

  // ===============================
  //  LOGIN SUCCESS (ADMIN)
  // ===============================
  it('Login successful (admin)', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'adminUser',
        firstName: 'Admin',
        lastName: 'Yoga',
        admin: true
      },
    })

    cy.intercept('GET', '/api/session', []).as('session')

    cy.get('input[formControlName=email]').type("admin@yoga.com")
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}")

    cy.url().should('include', '/sessions')
  })


  // ===============================
  //  LOGIN SUCCESS (NON ADMIN)
  // ===============================
  it('Login successful (non-admin)', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 2,
        username: 'normalUser',
        firstName: 'User',
        lastName: 'Yoga',
        admin: false
      },
    })

    cy.intercept('GET', '/api/session', []).as('session')

    cy.get('input[formControlName=email]').type("user@yoga.com")
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}")

    cy.url().should('include', '/sessions')
  })


  // ===============================
  //  LOGIN FAILURE (401)
  // ===============================
  it('Login failure - wrong credentials', () => {
  cy.visit('/login')

  cy.intercept('POST', '/api/auth/login', {
    statusCode: 401
  }).as('loginFail')

  cy.get('input[formControlName=email]').type("wrong@yoga.com")
  cy.get('input[formControlName=password]').type("wrongpassword")
  cy.get('button[type=submit]').click()

  cy.wait('@loginFail')
  cy.url().should('include', '/login')
  cy.url().should('not.include', '/sessions')
  cy.contains('An error occurred').should('exist')
})


  // ===============================
  //  FORM VALIDATION (EMPTY FIELDS)
  // ===============================
  it('Login form validation - required fields', () => {
  cy.visit('/login')

  cy.get('button[type=submit]').should('be.disabled')

  cy.get('input[formControlName=email]')
    .should('have.class', 'ng-invalid')

  cy.get('input[formControlName=password]')
    .should('have.class', 'ng-invalid')

  cy.url().should('include', '/login')
})

  it('shows validation errors for invalid email/password', () => {
    cy.visit('/login')
    cy.get('input[formControlName=email]').type('not-an-email').blur();
    cy.get('input[formControlName=email]').should('have.class', 'ng-invalid');
    // password uses Validators.min(3) (numeric) in app, so '1' is invalid
    cy.get('input[formControlName=password]').type('1').blur();
    cy.get('input[formControlName=password]').should('have.class', 'ng-invalid');
    cy.get('button[type=submit]').should('be.disabled');
  })

  // ===============================
  //  PASSWORD VISIBILITY TOGGLE
  // ===============================
  it('toggles password visibility', () => {
    cy.visit('/login')

    cy.get('input[formControlName=password]').should('have.attr', 'type', 'password')
    cy.get('button[aria-label="Hide password"]').click()
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'text')
    cy.get('button[aria-label="Hide password"]').click()
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'password')
  })


  // ===============================
  //  ACCESS /sessions WITHOUT LOGIN
  // ===============================
  it('Redirect to login if accessing sessions without login', () => {
    cy.visit('/sessions')

    cy.url().should('include', '/login')
  })


  // ===============================
  //  LOGOUT
  // ===============================
  it('Logout successfully', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'adminUser',
        firstName: 'Admin',
        lastName: 'Yoga',
        admin: true
      },
    })

    cy.intercept('GET', '/api/session', []).as('session')

    cy.get('input[formControlName=email]').type("admin@yoga.com")
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}")

    cy.url().should('include', '/sessions')

    cy.contains('Logout').click()

    cy.url().should('include', '/')
  })

})
