/// <reference types="cypress" />

import { adminUser, regularUser, login } from '../support/helpers';

describe('Me component flows', () => {
  it('shows admin information and hides delete option', () => {
    login(adminUser, []);

    // prepare backend response and navigate via the header link to avoid a full reload
    cy.intercept('GET', `/api/user/${adminUser.id}`, adminUser).as('getUser');
    cy.get('span.link').contains('Account').click();

    cy.wait('@getUser');

    cy.contains('Name: Admin USER').should('exist');
    cy.contains('Email:').should('contain', adminUser.email);
    cy.contains('You are admin').should('exist');
    cy.contains('Delete my account').should('not.exist');
    cy.get('button').contains('arrow_back').should('exist');
  });

  it('shows regular user info and allows account deletion', () => {
    login(regularUser, []);

    cy.intercept('GET', `/api/user/${regularUser.id}`, regularUser).as('getUser');
    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser');

    cy.contains('Name: Regular USER').should('exist');
    cy.contains('Email:').should('contain', regularUser.email);
    cy.contains('You are admin').should('not.exist');
    cy.contains('Delete my account').should('exist');
    cy.contains('button', 'Detail').should('exist'); // delete button label
  });

  it('deletes regular user account and navigates away', () => {
    login(regularUser, []);

    cy.intercept('GET', `/api/user/${regularUser.id}`, regularUser).as('getUser');
    cy.intercept('DELETE', `/api/user/${regularUser.id}`, { statusCode: 200 }).as('deleteUser');

    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser');

    cy.contains('button', 'Detail').click();
    cy.wait('@deleteUser');

    cy.contains('Your account has been deleted !').should('exist');
    cy.url().should('eq', Cypress.config('baseUrl'));
    // header should switch to login link
    cy.get('span[data-testid="account-link"]').should('exist');
  });

  it('back button returns to previous page', () => {
    login(adminUser, []);

    // navigate to account via UI and intercept detail
    cy.intercept('GET', `/api/user/${adminUser.id}`, adminUser).as('getUser2');
    cy.get('span.link').contains('Account').click();
    cy.wait('@getUser2');

    cy.get('button[mat-icon-button]').click();
    cy.url().should('include', '/sessions');
  });
});
