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

    // it('should display leave categories page correctly', () => {
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
    //         .should('have.length', 5)
    //         .and('contain.text', 'Status')
    //         .and('contain.text', 'Category')
    //         .and('contain.text', 'Max days')
    //         .and('contain.text', 'Max instances')
    //         .and('contain.text', 'Document required');

    //     cy.filterPerPage();

    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Category')
    //         .and('contain.text', 'Max Days')
    //         .and('contain.text', 'Max instances')
    //         .and('contain.text', 'Is Required Document')
    //         .and('contain.text', 'Status');

    //     cy.get('[data-cy="row-menu-button-row-actions"]').first().click();

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Archive');

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Edit');
    // });

    // it('should create leave categories', () => {
    //     //esc
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('body').type('{esc}');
    //     //close
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="modal-center-button-close"]').click();
    //     //cancel
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="close-button"]').click();

    //     //save
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="input-status"]').select('Active');
    //     cy.get('[data-cy="input-name"]').type('Maternity Leave');
    //     cy.get('[data-cy="input-max-days"]').type('10');
    //     cy.get('[data-cy="input-max-instances"]').type('5');
    //     cy.get('[data-cy="record-modal-field-input-checkbox"]').click();

    //     cy.intercept('POST', '**/leave-categories').as('createLeaveCategories');

    //     cy.get('[data-cy="submit-button"]').click(); //save btn

    //     cy.wait('@createLeaveCategories').then((interception) => {
    //         console.log(interception.response);
    //     });

    //     cy.get('[data-cy="toolbar-input-text"]').type('Maternity Leave');

    //     cy.contains('Maternity Leave', { timeout: 1000 }).should('be.visible');
    // });

    it('should update leave categories', () => {
        
    })
});
