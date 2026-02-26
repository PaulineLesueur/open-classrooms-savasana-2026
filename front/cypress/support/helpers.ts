// shared test fixtures and helpers

export const adminUser = {
  id: 1,
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@yoga.com',
  admin: true,
  token: 'token',
  type: 'Bearer',
};

export const regularUser = {
  id: 2,
  username: 'member',
  firstName: 'Regular',
  lastName: 'User',
  email: 'member@yoga.com',
  admin: false,
  token: 'token',
  type: 'Bearer',
};

// generic login helper used by many specs
export const login = (user = adminUser, sessions: any[] = []) => {
  // ensure clean state before each login attempt
  cy.clearCookies();
  cy.clearLocalStorage();

  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: user,
  }).as('login');

  cy.intercept('GET', '/api/session', sessions).as('getSessions');

  cy.visit('/login');
  cy.get('input[formControlName=email]').type('yoga@studio.com');
  cy.get('input[formControlName=password]').type('test!1234');
  cy.get('button[type=submit]').click();

  cy.wait('@login');
  cy.wait('@getSessions');
  // wait until router navigates to sessions page to be sure sessionService is set
  cy.url().should('include', '/sessions');
};
