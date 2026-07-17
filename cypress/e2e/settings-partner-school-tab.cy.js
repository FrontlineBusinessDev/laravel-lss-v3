describe('Settings - Partner School Tab Page', () => {
    beforeEach(() => {
        cy.session('admin', () => {
            cy.login();
        });

        cy.visit('/settings/partner-schools');
    });

    it('should display Partner School Page correctly', () => {
        //check settings title
        cy.verifySettingsModuleHeader();

        cy.get('[data-cy="add-record-button"]').should('be.visible'); //add btn
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible'); //search btn

        //sort
        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
            .should('have.length', 9)
            .and('contain.text', 'Status')
            .and('contain.text', 'School Name')
            .and('contain.text', 'Abbreviation')
            .and('contain.text', 'Logo')
            .and('contain.text', 'First Name')
            .and('contain.text', 'Last Name')
            .and('contain.text', 'Email')
            .and('contain.text', 'Address')
            .and('contain.text', 'Joined');

        //pages
        cy.filterPerPage();

        //filter
        cy.get('[data-cy="toolbar-button-button"]').click();

        //status
        cy.get('[data-cy="dropdown-button-button"]').click();

        cy.contains('All Status').should('be.visible');
        cy.contains('Active').should('be.visible');
        cy.contains('Inactive').should('be.visible');
    });
});
