describe('Settings - Leave Categories Page', () => {
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

        cy.visit('/settings/leave-categories');
    });

     //display
    it('should display leave categories page correctly', () => {
        cy.verifySettingsModuleHeader();

        cy.get('[data-cy="add-record-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="dropdown-button-button"]').click();
        cy.contains('All Status').should('be.visible');
        cy.contains('Active').should('be.visible');
        cy.contains('Inactive').should('be.visible');

        cy.get('[data-cy="data-input-name"]').should('be.visible');

        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
            .should('have.length', 5)
            .and('contain.text', 'Status')
            .and('contain.text', 'Category')
            .and('contain.text', 'Max days')
            .and('contain.text', 'Max instances')
            .and('contain.text', 'Document required');

        cy.filterPerPage();

        cy.get('[data-cy="settings-list-header-div-1"]')
            .should('contain.text', 'Category')
            .and('contain.text', 'Max Days')
            .and('contain.text', 'Max instances')
            .and('contain.text', 'Is Required Document')
            .and('contain.text', 'Status');

        cy.get('[data-cy="row-menu-button-row-actions"]').first().click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('contain.text', 'Edit');

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('contain.text', 'Archive');
    });

    // search and clear
    it('should search and clear the search input', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchLeaveCategory');

        cy.get('[data-cy="toolbar-input-text"]').should('have.value', '');

        cy.get('[data-cy="toolbar-input-text"]').type('Sick Leave{enter}');

        cy.wait('@searchLeaveCategory');

        cy.get('[data-cy="toolbar-x-7"]').click();

        cy.get('[data-cy="toolbar-input-text"]').should('have.value', '');

        cy.get('[data-cy="toolbar-input-text"]').type('Vacation{enter}');

        cy.wait('@searchLeaveCategory');

        cy.get('[data-cy="clear-all"]').click();

        cy.get('[data-cy="toolbar-input-text"]').should('have.value', '');
    });

    // filter
    it('should filter leave categories by status', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="dropdown-button-button"]').click();
        cy.get('[data-cy="dropdown-button-set-selected"]')
            .contains('Active')
            .should('be.visible')
            .first()
            .click();

        cy.get('[data-cy="dropdown-button-button"]').click();
        cy.get('[data-cy="dropdown-button-set-selected"]')
            .contains('Inactive')
            .should('be.visible')
            .first()
            .click();
    });

    it('should filter leave categories by category name', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-name"]', {
            timeout: 1000,
        }).type('Vacation');
    });

    it('should sort leave categories by status', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortLeaveCategory');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Status')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Status',
        );

        cy.wait('@sortLeaveCategory')
            .its('response.statusCode')
            .should('eq', 200);
    });

    it('should sort leave categories by category', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortLeaveCategory');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Category')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Category',
        );

        cy.wait('@sortLeaveCategory')
            .its('response.statusCode')
            .should('eq', 200);
    });

    it('should sort leave categories by max days', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortLeaveCategory');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Max days')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Max days',
        );

        cy.wait('@sortLeaveCategory')
            .its('response.statusCode')
            .should('eq', 200);
    });

    it('should sort leave categories by max instances', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortLeaveCategory');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Max instances')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Max instances',
        );

        cy.wait('@sortLeaveCategory')
            .its('response.statusCode')
            .should('eq', 200);
    });

    it('should sort leave categories by document required', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortLeaveCategory');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Document required')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Document required',
        );

        cy.wait('@sortLeaveCategory')
            .its('response.statusCode')
            .should('eq', 200);
    });

    it('should display correct number of records when changing rows per page', () => {
        cy.intercept('GET', '**/pagination-search*').as('getLeaveCategories');

        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('25');

        cy.wait('@getLeaveCategories')
            .its('response.statusCode')
            .should('eq', 200);
    });

    //create
    it('should create leave category', () => {
        //esc
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('body').type('{esc}');
        //close
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="modal-center-button-close"]').click();
        //cancel
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="close-button"]').click();

        //save
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="input-status"]').select('Active');
        cy.get('[data-cy="input-name"]').type('Maternity Leave');
        cy.get('[data-cy="input-max-days"]').type('10');
        cy.get('[data-cy="input-max-instances"]').type('5');
        cy.get('[data-cy="record-modal-field-input-checkbox"]').click();

        cy.intercept('POST', '**/leave-categories').as('createLeaveCategory');

        cy.get('[data-cy="submit-button"]').click(); //save btn

        cy.wait('@createLeaveCategory').then((interception) => {
            console.log(interception.response);
        });

        cy.get('[data-cy="toolbar-input-text"]').type('Maternity Leave');

        cy.contains('Maternity Leave', { timeout: 1000 }).should('be.visible');
    });

    //update
    it('should update leave category', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchLeaveCategory');

        cy.intercept('POST', '**/settings/leave-categories/**').as(
            'updateLeaveCategory',
        );

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');

        cy.wait('@searchLeaveCategory');

        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('body').type('{esc}'); //esc key

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');
        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="close-button"]').click(); //cancel

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');
        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="modal-center-button-close"]').click(); //close

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');
        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="input-max-days"]').clear().type('20');

        cy.get('[data-cy="input-max-instances"]').clear().type('3');

        cy.get('[data-cy="submit-button"]').click();

        cy.wait('@updateLeaveCategory');

        cy.get('[data-cy="toast-div-3"]').should(
            'contain.text',
            'Leave category updated',
        );
    });
    //archive
    it('should archive leave category', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchLeaveCategory');
        cy.intercept('POST', '**/settings-leave-categories/**').as(
            'archiveLeaveCategory',
        );

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');

        cy.wait('@searchLeaveCategory');

        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.get('[data-cy="toast-div-3"]').should('contain.text', 'Archived');
    });
    //restore
    it('should restore leave category', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchLeaveCategory');
        cy.intercept('GET', '**/settings-leave-categories/**').as(
            'restoreLeaveCategory',
        );

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');

        cy.wait('@searchLeaveCategory');

        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.get('[data-cy="toast-div-3"]').should('contain.text', 'Restore');
    });
    //delete
    it('should delete leave category', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchLeaveCategory');
        cy.intercept('GET', '**/settings/leave-categories/**').as(
            'archiveLeaveCategory',
        );
        cy.intercept('DELETE', '**/settings/leave-categories/**').as(
            'deleteLeaveCategory',
        );

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');

        cy.wait('@searchLeaveCategory');

        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.wait('@archiveLeaveCategory');

        cy.get('[data-cy="toolbar-input-text"]').clear().type('Maternity');

        cy.contains('[data-cy="settings-row-div-4"]', 'Maternity')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('be.visible')
            .click();

        cy.get('[data-cy="confirm-delete-modal-button-button-2"]')
            .should('be.visible')
            .click();

        cy.wait('@deleteLeaveCategory')
            .its('response.statusCode')
            .should('be.oneOf', [200, 204]);
    });
});
