Cypress.Commands.add('login', () => {
    cy.visit('/login');

    cy.get('input[name=user_account_email]').type(
        Cypress.env('email') as string,
    );

    cy.get('input[name=password]').type(Cypress.env('password') as string);

    cy.get('button[type=submit]').click();

    cy.url().should('not.include', '/login');
});
