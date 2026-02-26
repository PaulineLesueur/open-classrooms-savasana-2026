/// <reference types="cypress" />

describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('registers a new account and redirects to login', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {},
    }).as('register');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john.doe@yoga.com');
    cy.get('input[formControlName=password]').type(`${'strongPass'}{enter}`);

    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  it('shows error when registration fails', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 500,
    }).as('registerFail');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john.doe@yoga.com');
    cy.get('input[formControlName=password]').type('pass123{enter}');

    cy.wait('@registerFail');
    cy.contains('An error occurred').should('exist');
  });

  it('prevents submit when a required field is missing', () => {
    cy.get('input[formControlName=firstName]').type('Jo');
    cy.get('input[formControlName=email]').type('missing-last@yoga.com');

    cy.get('button[type=submit]').should('be.disabled');
  });
});