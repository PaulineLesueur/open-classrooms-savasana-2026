/// <reference types="cypress" />

import { adminUser, regularUser, login } from '../support/helpers';

const teachers = [
  { id: 1, firstName: 'John', lastName: 'Doe' },
  { id: 2, firstName: 'Jane', lastName: 'Smith' },
];

const baseSessions = [
  {
    id: 1,
    name: 'Morning Flow',
    description: 'A gentle start',
    date: new Date(),
    teacher_id: 1,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Evening Stretch',
    description: 'Stretch together',
    date: new Date(),
    teacher_id: 2,
    users: [3],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('Sessions flows', () => {
  it('shows admin actions on session list', () => {
    // we need some sessions so buttons appear
    login(adminUser, baseSessions);

    cy.contains('button', 'Create').should('exist');
    cy.contains('button', 'Edit').should('exist');
    cy.contains('button', 'Detail').first().should('exist');
  });

  it('hides admin actions for regular user', () => {
    login(regularUser, baseSessions);

    cy.contains('button', 'Create').should('not.exist');
    cy.contains('button', 'Edit').should('not.exist');
    // regular users still can see detail buttons
    cy.contains('button', 'Detail').first().should('exist');
  });

  it('renders empty list when no sessions available', () => {
    login(adminUser, []);
    cy.get('.items').should('not.contain', 'mat-card.item');
  });

  it('creates a session as admin', () => {
    const updatedSessions = [
      ...baseSessions,
      {
        id: 3,
        name: 'Power Yoga',
        description: 'Build strength',
        date: new Date(),
        teacher_id: 1,
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    login(adminUser, baseSessions);

    // also test scenario where teacher list is empty
    cy.intercept('GET', '/api/teacher', []).as('getTeachersEmpty');
    cy.contains('button', 'Create').click();
    cy.wait('@getTeachersEmpty');
    cy.get('mat-option').should('have.length', 0);
    cy.get('button[type=submit]').should('be.disabled');

    // go back to sessions list so we can reopen form for normal flow
    cy.visit('/sessions');

    // now proceed with teachers returned normally
    cy.intercept('GET', '/api/teacher', teachers).as('getTeachers');
    cy.intercept('POST', '/api/session', (req) => {
      expect(req.body.name).to.equal('Power Yoga');
      req.reply({ statusCode: 201, body: updatedSessions[2] });
    }).as('createSession');
    cy.intercept('GET', '/api/session', updatedSessions);

    cy.contains('button', 'Create').click();
    cy.wait('@getTeachers');

    // form validation: initially disabled
    cy.get('button[type=submit]').should('be.disabled');
    cy.get('input[formControlName=name]').type('Power Yoga');
    cy.get('button[type=submit]').should('be.disabled');

    // now fill remaining fields to enable
    cy.get('input[formControlName=date]').type('2023-02-01');
    cy.get('mat-select[formcontrolname=teacher_id]').click();
    cy.get('mat-option').contains('John Doe').click();
    // description max length validation - inject value directly (typing 2000+ chars is too slow) and
    // trigger blur so Angular runs validation, then verify field is invalid before checking the button state
    const longText = 'x'.repeat(2001);
    cy.get('textarea[formcontrolname=description]')
      .invoke('val', longText)
      .trigger('input')
      .trigger('blur');
    // the control should be marked invalid and the submit button stay disabled
    cy.get('textarea[formcontrolname=description]').should('have.class', 'ng-invalid');
    cy.get('button[type=submit]').should('be.disabled');
    cy.get('textarea[formcontrolname=description]').clear();
    cy.get('textarea[formcontrolname=description]').should('have.value', '');
    cy.get('textarea[formcontrolname=description]').type('Build strength');

    cy.contains('button', 'Save').click();

    cy.wait('@createSession');
    cy.contains('Session created !').should('exist');
    cy.url().should('include', '/sessions');
    cy.contains('Power Yoga').should('exist');
  });

  it('updates a session', () => {
    const sessionToUpdate = baseSessions[0];
    const updatedSession = { ...sessionToUpdate, description: 'Updated description' };

    login(adminUser, baseSessions);

    cy.intercept('GET', `/api/session/${sessionToUpdate.id}`, sessionToUpdate).as('getSessionDetail');
    cy.intercept('GET', '/api/teacher', teachers).as('getTeachersUpdate');
    cy.intercept('PUT', `/api/session/${sessionToUpdate.id}`, (req) => {
      expect(req.body.description).to.equal('Updated description');
      req.reply({ statusCode: 200, body: updatedSession });
    }).as('updateSession');

    cy.contains('button', 'Edit').first().click();

    cy.wait('@getSessionDetail');
    cy.wait('@getTeachersUpdate');

    // validation: if we clear description button becomes disabled
    cy.get('textarea[formcontrolname=description]').clear();
    cy.contains('button', 'Save').should('be.disabled');
    cy.get('textarea[formcontrolname=description]').type('Updated description');
    cy.contains('button', 'Save').click();

    cy.wait('@updateSession');
    cy.contains('Session updated !').should('exist');
    cy.url().should('include', '/sessions');
  });

  it('deletes a session from detail view', () => {
    const sessionToDelete = baseSessions[1];

    login(adminUser, baseSessions);

    cy.intercept('GET', `**/api/session/${sessionToDelete.id}`, sessionToDelete).as('getSessionForDelete');
    cy.intercept('GET', `**/api/teacher/${sessionToDelete.teacher_id}`, teachers[1]).as('getTeacherForDelete');
    cy.intercept('DELETE', `**/api/session/${sessionToDelete.id}`, { statusCode: 200 }).as('deleteSession');

    cy.contains('mat-card', sessionToDelete.name)
      .find('button')
      .contains('Detail')
      .click();

    cy.wait('@getSessionForDelete');
    cy.wait('@getTeacherForDelete');
    cy.contains(sessionToDelete.name).should('exist');
    cy.contains('button', 'Delete').click();

    cy.wait('@deleteSession');
    cy.contains('Session deleted !').should('exist');
    cy.url().should('include', '/sessions');
  });

  it('admin cannot participate in sessions', () => {
    login(adminUser, baseSessions);
    cy.contains('button', 'Detail').first().click();
    cy.contains('button', 'Participate').should('not.exist');
  });

  it('redirects non-admin from create form', () => {
    login(regularUser, baseSessions);
    cy.visit('/sessions/create');
    cy.url().should('include', '/sessions');
  });

  it('redirects non-admin from update form', () => {
    login(regularUser, baseSessions);
    cy.visit('/sessions/update/1');
    cy.url().should('include', '/sessions');
  });

  it('lets a user participate then leave a session', () => {
    let isParticipating = false;
    const sessionForUser = { ...baseSessions[0] };

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: regularUser,
    }).as('loginUser');
    cy.intercept('GET', '/api/session', [sessionForUser]).as('getSessionsUser');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type('member@yoga.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.wait('@loginUser');
    cy.wait('@getSessionsUser');

    cy.intercept('GET', `/api/session/${sessionForUser.id}`, (req) => {
      const users = isParticipating ? [regularUser.id] : [];
      req.reply({ ...sessionForUser, users });
    }).as('getSessionUser');
    cy.intercept('GET', `/api/teacher/${sessionForUser.teacher_id}`, teachers[0]).as('getTeacherUser');
    cy.intercept('POST', `/api/session/${sessionForUser.id}/participate/${regularUser.id}`, (req) => {
      isParticipating = true;
      req.reply({ statusCode: 200 });
    }).as('participate');
    cy.intercept('DELETE', `/api/session/${sessionForUser.id}/participate/${regularUser.id}`, (req) => {
      isParticipating = false;
      req.reply({ statusCode: 200 });
    }).as('unParticipate');

    cy.contains('button', 'Detail').first().click();
    cy.wait('@getSessionUser');
    cy.wait('@getTeacherUser');

    cy.contains('button', 'Participate').click();
    cy.wait('@participate');
    cy.wait('@getSessionUser');

    cy.contains('button', 'Do not participate').click();
    cy.wait('@unParticipate');
    cy.wait('@getSessionUser');
  });
});