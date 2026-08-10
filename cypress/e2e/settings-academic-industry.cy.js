describe('Settings - Academic Industry', () => {
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
        cy.visit('/settings/academic/industry');
    });

    // //display
    // it('should display academic industry page correctly', () => {
    //     cy.verifySettingsModuleHeader();

    //     cy.get('[data-cy="add-record-button"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');

    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     cy.get('[data-cy="dropdown-button-button"]').click();
    //     cy.contains('All Status').should('be.visible');
    //     cy.contains('Active').should('be.visible');
    //     cy.contains('Inactive').should('be.visible');

    //     cy.get('[data-cy="data-input-name"]').should('be.visible');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //         .should('have.length', 4)
    //         .and('contain.text', 'Sort: Status')
    //         .and('contain.text', 'Sort: Industry Name')
    //         .and('contain.text', 'Sort: Description')
    //         .and('contain.text', 'Sort: Created At');

    //     cy.filterPerPage();

    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Name')
    //         .and('contain.text', 'Description');

    //     cy.get('[data-cy="row-menu-button-row-actions"]').first().click();
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit');

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Archive');
    // });

    // //create
    // it('should create academic industry', () => {
    //     // Close modal using ESC
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('body').type('{esc}');

    //     // Close modal using X button
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="modal-center-button-close"]').click();

    //     // Close modal using Close button
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="close-button"]')
    //         .should('contain.text', 'Cancel')
    //         .click();

    //     // Create academic industry
    //     cy.get('[data-cy="add-record-button"]').click();

    //     cy.get('[data-cy="input-status"]').select('Active');
    //     cy.get('[data-cy="input-name"]').type('Marketing');
    //     cy.get('[data-cy="input-description"]').type(
    //         'This is Marketing academic industry',
    //     );

    //     cy.intercept('POST', '**/settings-academic-industry').as(
    //         'createAcademicIndustry',
    //     );

    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'searchAcademicIndustry',
    //     );
    //     cy.get('[data-cy="submit-button"]')
    //         .should('contain.text', 'Create Industry')
    //         .click();

    //     cy.get('[data-cy="toast-div-3"]')
    //         .should('be.visible')
    //         .and('contain.text', 'Industry created');

    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     cy.wait('@searchAcademicIndustry');

    //     cy.contains('Marketing').should('be.visible');
    // });

    //update
    it('should update academic industry', () => {
        cy.intercept('GET', '**/pagination-search*').as(
            'searchAcademicIndustry',
        );

        cy.intercept('POST', '**/settings/academic/industry/**').as(
            'updateAcademicIndustry',
        );

        //esc
        // Search academic industry
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

        // Verify Marketing is visible
        cy.contains('[data-cy="settings-row-div-4"]', 'Marketing').should(
            'be.visible',
        );

        // Open row actions
        cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('contain.text', 'Edit')
            .click();

        // Close edit modal using ESC
        cy.get('body').type('{esc}');
    });
});
