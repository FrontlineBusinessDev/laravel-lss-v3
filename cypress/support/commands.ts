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
