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

