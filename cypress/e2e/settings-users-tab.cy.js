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

         //sort and pages
      cy.get('[data-cy="toolbar-select-sort-by-change"] option')
        .should('have.length', 3)
        .and('contain.text', 'Status')
        .and('contain.text', 'Name')
        .and('contain.text', 'Email');

         cy.get('[data-cy="toolbar-select-rows-per-page"] option')
        .should('have.length', 5)
        .then(($options) => {
            expect($options.eq(0)).to.contain.text('10 / page');
            expect($options.eq(1)).to.contain.text('15 / page');
            expect($options.eq(2)).to.contain.text('25 / page');
            expect($options.eq(3)).to.contain.text('50 / page');
            expect($options.eq(4)).to.contain.text('100 / page');
        });
        

        cy.get('[data-cy="toolbar-button-button"]').click();

        // status filter
        cy.get('[data-cy="dropdown-button-button"]')
            .eq(0)
            .click();

        cy.get('[data-cy="dropdown-div-4"]')
        .should('contain.text', 'All Status')
        .and('contain.text', 'Active')
        .and('contain.text', 'Inactive');

        //roles filter
        cy.get('[data-cy="dropdown-button-button"]')
        .eq(1)
         .click();
        cy.get('[data-cy="dropdown-div-4"]')
        .should('contain.text', 'All Roles')
        .and('contain.text', 'Developer')
        .and('contain.text', 'Admin')
        .and('contain.text', 'Trainer')
        .and('contain.text', 'Trainee');

        //name and email filter
        cy.get('[data-cy="data-input-first_name"]').should("be.visible");
        cy.get('[data-cy="data-input-email"]').should("be.visible");

       //table
          cy.get('[data-cy="settings-list-header-div-1"]')
        .should('contain.text', 'Name')
        .and('contain.text', 'Email')
        .and('contain.text', 'Role')
        .and('contain.text', 'Status');

         cy.get('[data-cy="row-menu-button-row-actions"]')
        .first()
        .click();

    cy.get('[data-cy="row-menu-button-4"]')
        .eq(0)
        .should('contain.text', 'Edit user');

    cy.get('[data-cy="row-menu-button-4"]')
        .eq(1)
        .should('contain.text', 'Send password reset');

    cy.get('[data-cy="row-menu-button-4"]')
        .eq(2)
        .should('contain.text', 'Suspend');
    });

    //CREATE
    it('should create a user', () => {
        
    })
});
