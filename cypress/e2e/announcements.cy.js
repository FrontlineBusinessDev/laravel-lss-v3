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
        cy.get('[data-cy="toolbar-button-button"]')
            .click({ multiple: true })
            .eq(0);

        //status
        cy.get('[data-cy="dropdown-button-button"]').eq(0).click();
        cy.get('[data-cy="dropdown-div-4"]')
            .should('contain.text', 'All Status')
            .and('contain.text', 'Active')
            .and('contain.text', 'Inactive');

        //subject (existing subject)
        cy.get('[data-cy="data-input-subject"]').click().type('Hello');

        cy.get('[data-cy="settings-row-div-2"]')
            .contains('Hello')
            .should('be.visible');

        //subject (non-existing subject)
        cy.get('[data-cy="data-input-subject"]').clear().type('Hi');

        cy.contains('No records found', { timeout: 5000 }).should('be.visible');

        cy.get('[data-cy="data-input-subject"]').clear();

        //audience
        cy.get('[data-cy="dropdown-button-button"]').eq(1).click();
        cy.get('[data-cy="dropdown-div-4"]')
            .should('contain.text', 'All trainees')
            .and('contain.text', 'Specific batch')
            .and('contain.text', 'Specific role')
            .and('contain.text', 'Custom group');

        //description

        cy.get('[data-cy="toolbar-button-button"]')
            .click({ multiple: true })
            .eq(0);

        //sort
        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
            .should('have.length', 5)
            .and('contain.text', 'Status')
            .and('contain.text', 'Subject')
            .and('contain.text', 'Audience')
            .and('contain.text', 'Publish')
            .and('contain.text', 'Description');

        //page filter
        cy.filterPerPage();
    });

    //table
    it('should check the display of the table', () => {
        cy.get('[data-cy="settings-list-header-div-1"]')
            .should('contain.text', 'Subject')
            .and('contain.text', 'Audience Type')
            .and('contain.text', 'Scheduled at')
            .and('contain.text', 'Status');

        cy.get('[data-cy="settings-row-div-4"]').should('be.visible');
        cy.get('[data-cy="row-menu-more-horizontal-2"]').click();

    });
});
