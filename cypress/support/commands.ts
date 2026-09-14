Cypress.Commands.add('login', () => {
    cy.intercept('POST', '**/login').as('login');

    cy.visit('/login');

    cy.get('[data-cy="login-input-email"]')
        .should('be.visible')
        .clear()
        .type(Cypress.env('email'));

    cy.get('[data-cy="login-input-enter-your-password"]')
        .should('be.visible')
        .clear()
        .type(Cypress.env('password'), { log: false });

    cy.get('[data-cy="button-button-1"]').should('be.visible').click();

    cy.wait('@login')
        .its('response.statusCode')
        .should('be.oneOf', [200, 204, 302]);

    cy.url().should('not.include', '/login');
});

Cypress.Commands.add('verifySettingsModuleHeader', () => {
    cy.get('[data-cy="settings-primary-layout-h1-settings"]')
        .should('be.visible')
        .and('have.text', 'Settings');

    cy.get(
        '[data-cy="settings-primary-layout-p-manage-user-accounts-partner-schools-and"]',
    )
        .should('be.visible')
        .and(
            'have.text',
            'Manage user accounts, partner schools, and academic reference data',
        );
});

/**
 * Creates a throwaway batch via the real "Add batch" modal (must be called
 * while already on /batches) and resolves with the created record
 * (`{ id, batch_code, ... }`) so mutation-heavy tests (archive/restore/
 * terminate/delete) can act on a batch of their own instead of permanently
 * mutating shared seed data.
 */
Cypress.Commands.add('createBatch', () => {
    cy.intercept('POST', '**/batches').as('createBatchRequest');

    cy.get('[data-cy="add-record-button"]').click();

    cy.get('[data-cy="use-async-select-field-button-button"]').eq(0).click();
    cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
        'College',
    );
    cy.get('[data-cy="use-async-select-field-button-button-2"]')
        .contains('College On-the-Job Training')
        .click();

    cy.get('[data-cy="use-async-select-field-button-button"]').eq(1).click();
    cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
        'Acc',
    );
    cy.get('[data-cy="use-async-select-field-button-button-2"]')
        .contains('Accounting')
        .click();

    const today = new Date().toISOString().slice(0, 10);
    cy.get('[data-cy="create-batch-modal-input-date"]').type(today);
    cy.get('[data-cy="create-batch-modal-input-projected-end-date"]').type(
        '2099-12-31',
    );
    cy.get('[data-cy="create-batch-modal-input-checkbox"]').check();

    cy.get('[data-cy="create-batch-modal-button-submit"]').click();

    return cy
        .wait('@createBatchRequest')
        .then((interception) => interception.response.body.data);
});

Cypress.Commands.add('filterPerPage', () => {
    cy.get('[data-cy="toolbar-select-rows-per-page"] option')
        .should('have.length', 5)
        .then(($options) => {
            expect($options.eq(0)).to.contain.text('10 / page');
            expect($options.eq(1)).to.contain.text('15 / page');
            expect($options.eq(2)).to.contain.text('25 / page');
            expect($options.eq(3)).to.contain.text('50 / page');
            expect($options.eq(4)).to.contain.text('100 / page');
        });
});
