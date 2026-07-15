Cypress.Commands.add('login', () => {
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