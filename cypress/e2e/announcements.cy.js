describe('Batches Module', () => {
    beforeEach(() => {
        cy.session(
            'admin',
            () => {
                cy.login();
            },
            {
                validate() {
                    cy.visit('/dashboard');
                    cy.url().should('include', '/dashboard');
                },
            },
        );
        cy.visit('/announcements');
    });

    //check announcement page
    it('should load the announcement page', () => {
        //elements inside announcement page
        cy.get('[data-cy="add-record-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
        cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
            'be.visible',
        );
        cy.get('[data-cy="toolbar-select-rows-per-page"]').should('be.visible');

        //filter
        cy.get('[data-cy="toolbar-button-button"]').click({ multiple: true })
        .eq(0);

        //status
        cy.get('[data-cy="dropdown-button-button"]').eq(0).click();
        cy.get('[data-cy="dropdown-div-4"]')
            .should('contain.text', 'All Status')
            .and('contain.text', 'Active')
            .and('contain.text', 'Inactive');

        //subject
        cy.get('[data-cy="data-input-subject"]').click()
        .type('Hello');

        //

    });
});
