describe('Settings - Rates -  Hours Discounts', () => {
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
        cy.visit('/settings/rates/hours-discounts');
    });

    //display
    // it('should display  the  hours discounts tab page correctly', () => {
    //     cy.verifySettingsModuleHeader();

    //     cy.get('[data-cy="add-record-button"]').should('be.visible');

    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //         .should('contain.text', 'Sort: Min. Hours')
    //         .and('contain.text', 'Sort: Discount');

    //     cy.filterPerPage();

    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Min. Hours')
    //         .and('contain.text', 'Discount');
    // });

    // //create
    // it('should create hour discount', () => {
    //     //esc key
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('body').type('{esc}');

    //     //close
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="modal-center-button-close"]').click();

    //     //cancel
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="close-button"]').click();

    //     //save
    //     cy.intercept('POST', '**/settings-rates-hours-discounts').as(
    //         'createHourDiscount',
    //     );
    //     cy.get('[data-cy="add-record-button"]').click();
    //     cy.get('[data-cy="input-min-hours"]').type('10');
    //     cy.get('[data-cy="input-discount-percentage"]').type('100');
    //     cy.get('[data-cy="submit-button"]').click();
    //     cy.get('[data-cy="toast-div-3"]').should('contain.text', 'Hours discount created');
    // });

    //update
    it('should update hour discount', () => {
        //close
        cy.get('[data-cy="row-menu-button-row-actions"]').click();
        cy.get('[data-cy="row-menu-button-4"]').eq(0).click();
        cy.get('[data-cy="modal-center-button-close"]').click();

        //cancel
        cy.get('[data-cy="row-menu-button-row-actions"]').click();
        cy.get('[data-cy="row-menu-button-4"]').eq(0).click();
        cy.get('[data-cy="close-button"]').click();

        //update
        cy.intercept('GET', '**/settings-rates-hours-discounts/**').as(
            'updateHourDiscount',
        );

       cy.contains('[data-cy="settings-row-div-4"]', '10 hrs')
           .closest('[data-cy="settings-row-div-4"]')
           .find('[data-cy="row-menu-button-row-actions"]')
           .click();
    });
});
