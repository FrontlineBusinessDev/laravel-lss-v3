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
    // sort status
    // it('should check if the sorting of status is working', () => {
    //     // intercept sorting request
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'sortStatusAcademicIndustry',
    //     );

    //     // select status sorting
    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select('Sort: Status');

    //     // verify ascending sorting request was successful
    //     cy.get('[data-cy="toolbar-button-button-2"]').should('be.visible');

    //     cy.wait('@sortStatusAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('eq', 200);

    //     // verify ascending order
    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .first()
    //         .invoke('text') //to get the text from table row
    //         .then((text) => {
    //             const status = text.trim();

    //             cy.log(`Ascending first row: ${status}`);

    //             expect(status).to.include('Active');
    //         });

    //     // click descending button
    //     cy.get('[data-cy="toolbar-button-button-2"]').click();

    //     // verify descending sorting request was successful
    //     cy.wait('@sortStatusAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('eq', 200);

    //     // verify descending order
    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .first()
    //         .invoke('text') //to get the text from table row
    //         .then((text) => {
    //             const status = text.trim();

    //             cy.log(`Descending first row: ${status}`);

    //             expect(status).to.include('Archived');
    //         });
    // });
    //sort industry name
    // it('should check if the sorting of industry name is working', () => {
    //     // intercept sorting request
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'sortIndustryNameAcademicIndustry',
    //     );

    //     // select industry name sorting
    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: Industry Name',
    //     );

    //     // verify ascending sorting request was successful
    //     cy.get('[data-cy="toolbar-button-button-2"]').should('be.visible');

    //     cy.wait('@sortIndustryNameAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('eq', 200);

    //     // verify ascending order
    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .first()
    //         .invoke('text') //to get the text from table row
    //         .then((text) => {
    //             const industryName = text.trim();

    //             cy.log(`Ascending first row: ${industryName}`);

    //             expect(industryName).to.include('Accounting');
    //         });

    //     // click descending button
    //     cy.get('[data-cy="toolbar-button-button-2"]').click();

    //     // verify descending sorting request was successful
    //     cy.wait('@sortIndustryNameAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('eq', 200);

    //     // verify descending order
    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .first()
    //         .invoke('text') //to get the text from table row
    //         .then((text) => {
    //             const industryName = text.trim();

    //             cy.log(`Descending first row: ${industryName}`);

    //             expect(industryName).to.include('Information Technology');
    //         });
    // });
    //sort description
    // it('should check if the sorting of description is working', () => {
    //     // intercept sorting request
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'sortDescriptionAcademicIndustry',
    //     );

    //     // select description sorting
    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: Description',
    //     );

    //     // verify ascending sorting request was successful
    //     cy.get('[data-cy="toolbar-button-button-2"]').should('be.visible');

    //     cy.wait('@sortDescriptionAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('eq', 200);

    //     // verify ascending order
    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .first()
    //         .invoke('text') //to get the text from table row
    //         .then((text) => {
    //             const description = text.trim();

    //             cy.log(`Ascending first row: ${description}`);

    //             expect(description).to.include(
    //                 'Accounting academic or industry sector.',
    //             );
    //         });

    //     // click descending button
    //     cy.get('[data-cy="toolbar-button-button-2"]').click();

    //     // verify descending sorting request was successful
    //     cy.wait('@sortDescriptionAcademicIndustry')
    //         .its('response.statusCode')
    //         .should('eq', 200);

    //     // verify descending order
    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .first()
    //         .invoke('text') //to get the text from table row
    //         .then((text) => {
    //             const description = text.trim();

    //             cy.log(`Descending first row: ${description}`);

    //             expect(description).to.include(
    //                 'Information Technology sector.',
    //             );
    //         });
    // });

    // per page
    it('should display correct number of records when changing rows per page', () => {
        cy.intercept('GET', '**/pagination-search*').as('getPartnerSchools');

        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('25');

        cy.wait('@getPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
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
