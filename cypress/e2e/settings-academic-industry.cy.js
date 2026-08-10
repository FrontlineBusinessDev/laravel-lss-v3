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

    // //search
    // it('should search and clear the search input', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'searchAcademicIndustry',
    //     );

    //     cy.get('[data-cy="toolbar-input-text"]').type('Information');

    //     cy.wait(2000);

    //     cy.get('[data-cy="toolbar-x-7"]').click();

    //     cy.get('[data-cy="toolbar-input-text"]').type('Accounting');

    //     cy.wait(2000);

    //     cy.get('[data-cy="clear-all"]').click();
    // });

    // //filter
    // it('should filter academic industry by status', () => {
    //     cy.get('[data-cy="toolbar-button-button"]').click();
    //     cy.get('[data-cy="dropdown-button-button"]').click();
    //     cy.get('[data-cy="dropdown-button-set-selected"]')
    //         .contains('Active')
    //         .should('be.visible')
    //         .first()
    //         .click();
    // });
    // it('should filter academic industry by industry name', () => {
    //     cy.get('[data-cy="toolbar-button-button"]').click();
    //     cy.get('[data-cy="data-input-name"]', {
    //         timeout: 1000,
    //     }).type('Technology');
    // });

    //sorting
    it('should sort academic industry by status ascending', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortAcademicIndustry');

        // Select Status as sort field
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Status',
        );

        // Click Ascending
        cy.get('[data-cy="toolbar-button-button-2"]').click();

        // Verify request
        cy.wait('@sortAcademicIndustry')
            .its('response.statusCode')
            .should('eq', 200);

        // Get all rows
        cy.get('[data-cy="settings-row-div-4"]')
            .should('have.length.greaterThan', 0)
            .then(($rows) => {
                const rows = [...$rows];

                // Get the text of every row
                const actualRows = rows.map((row) =>
                    Cypress.$(row).text().trim(),
                );

                // Log result so you can see the actual order
                cy.log('Ascending order:');
                actualRows.forEach((row) => {
                    cy.log(row);
                });

                // Create expected ascending order
                const expectedRows = [...actualRows].sort();

                // Verify order
                expect(actualRows).to.deep.equal(expectedRows);
            });
    });

    it('should sort academic industry by status descending', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortAcademicIndustry');

        // Select Status as sort field
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Status',
        );

        // Click Descending
        cy.get('[data-cy="toolbar-button-button-2"]').click();

        // Verify request
        cy.wait('@sortAcademicIndustry')
            .its('response.statusCode')
            .should('eq', 200);

        // Get all rows
        cy.get('[data-cy="settings-row-div-4"]')
            .should('have.length.greaterThan', 0)
            .then(($rows) => {
                const rows = [...$rows];

                // Get the text of every row
                const actualRows = rows.map((row) =>
                    Cypress.$(row).text().trim(),
                );

                // Log result so you can see the actual order
                cy.log('Descending order:');
                actualRows.forEach((row) => {
                    cy.log(row);
                });

                // Create expected descending order
                const expectedRows = [...actualRows].sort().reverse();

                // Verify order
                expect(actualRows).to.deep.equal(expectedRows);
            });
    });

    it('should sort academic industry  by industry name ascending', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortAcademicIndustry');

        // Select Industry Name as sort field
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Industry Name',
        );
    });

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

    // //update
    // it('should update academic industry', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'searchAcademicIndustry',
    //     );

    //     cy.intercept('POST', '**/settings/academic/industry/**').as(
    //         'updateAcademicIndustry',
    //     );

    //     //esc
    //     // Search academic industry
    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     // Verify Marketing is visible
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing').should(
    //         'be.visible',
    //     );

    //     // Open row actions
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     // Click Edit
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit')
    //         .click();

    //     // Close edit modal using ESC
    //     cy.get('body').type('{esc}');

    //     //close
    //     // Search academic industry
    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     // Verify Marketing is visible
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing').should(
    //         'be.visible',
    //     );

    //     // Open row actions
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     // Click Edit
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit')
    //         .click();

    //     // Close edit modal using close
    //     cy.get('[data-cy="modal-center-button-close"]').click();

    //     //cancel btn
    //     // Search academic industry
    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     // Verify Marketing is visible
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing').should(
    //         'be.visible',
    //     );

    //     // Open row actions
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     // Click Edit
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit')
    //         .click();

    //     // close edit using cancel
    //     cy.get('[data-cy="close-button"]')
    //         .should('contain.text', 'Cancel')
    //         .click();

    //     //update btn
    //     // Search academic industry
    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     // Verify Marketing is visible
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing').should(
    //         'be.visible',
    //     );

    //     // Open row actions
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     // Click Edit
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit')
    //         .click();

    //     cy.get('[data-cy="input-description"]')
    //         .clear()
    //         .type('This is sample Description');

    //     // Save
    //     cy.get('[data-cy="submit-button"]')
    //         .should('contain.text', 'Update Industry')
    //         .click();

    //     // Verify update request
    //     cy.wait('@updateAcademicIndustry');

    //     cy.get('[data-cy="toast-div-3"]').should(
    //         'contain.text',
    //         'Industry updated',
    //     );
    // });

    // //archive
    // it('should  archive academic industry', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'searchAcademicIndustry',
    //     );
    //     cy.intercept('GET', '**/settings/academic/industry/**').as(
    //         'archiveAcademicIndustry',
    //     );

    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .should('be.visible')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Archive')
    //         .click();

    //     cy.wait('@archiveAcademicIndustry');

    //     cy.get('[data-cy="toast-div-3"]').should('contain.text', 'Archive');
    // });

    // //restore
    // it('should  restore academic industry', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'searchAcademicIndustry',
    //     );
    //     cy.intercept('GET', '**/settings/academic/industry/**').as(
    //         'restoreAcademicIndustry',
    //     );

    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .should('be.visible')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Restore')
    //         .click();

    //     cy.wait('@restoreAcademicIndustry');

    //     cy.get('[data-cy="toast-div-3"]').should('contain.text', 'Restored');
    // });

    // //delete
    // it('should delete academic industry', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'searchAcademicIndustry',
    //     );

    //     cy.intercept('GET', '**/settings/academic/industry/**').as(
    //         'archiveAcademicIndustry',
    //     );

    //     cy.intercept('DELETE', '**/settings/academic/industry/**').as(
    //         'deleteAcademicIndustry',
    //     );

    //     // Search Marketing
    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     cy.wait('@searchAcademicIndustry');

    //     // Open row actions
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .should('be.visible')
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     // Click Archive
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Archive')
    //         .click();

    //     // Verify archive request
    //     cy.wait('@archiveAcademicIndustry');

    //     // Search Marketing again
    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Marketing');

    //     cy.wait('@searchAcademicIndustry');

    //     // Open row actions again
    //     cy.contains('[data-cy="settings-row-div-4"]', 'Marketing')
    //         .should('be.visible')
    //         .parent()
    //         .find('[data-cy="row-menu-button-row-actions"]')
    //         .click();

    //     // Click Delete
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(2)
    //         .should('contain.text', 'Delete')
    //         .click();

    //     // Confirm Delete
    //     cy.get('[data-cy="confirm-delete-modal-button-button-2"]')
    //         .should('be.visible')
    //         .click();

    //     // Verify DELETE request
    //     cy.wait('@deleteAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('be.oneOf', [200, 204]);
    // });
});
