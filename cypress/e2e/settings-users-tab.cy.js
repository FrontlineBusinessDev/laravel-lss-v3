describe('Settings - Users - Users Tab Page', () => {
    beforeEach(() => {
        cy.session('admin', () => {
            cy.login(); //login in system
        });

        cy.visit('/settings/users');
    });

    // check users tab page display
    it('should display the Users tab page correctly', () => {

      cy.verifySettingsModuleHeader(); //settings module title

        //elements inside settings > users tab
        cy.get('[data-cy="add-record-button"]')
        .should('be.visible');

        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
        cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-select-sort-by-change"]').should('be.visible');
        cy.get('[data-cy="toolbar-select-rows-per-page"]').should('be.visible');
        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="dropdown-button-button"]')
            .eq(0)
            .click();

        cy.get('[data-cy="dropdown-button-button"]')
            .eq(1)
            .click();

        cy.get('[data-cy="dropdown-button-button"]')
            .eq(2)
            .click();

    });

  
});
