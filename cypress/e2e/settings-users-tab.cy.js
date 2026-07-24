describe('Settings - Users - Users Tab Page', () => {
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

        cy.visit('/settings/users');
    });

    // check users tab page display
    // it('should display the Users tab page correctly', () => {
    //     cy.viewport(1280, 720);
    //     cy.verifySettingsModuleHeader(); //settings module title

    //     //elements inside settings > users tab
    //     cy.get('[data-cy="add-record-button"]').should('be.visible');

    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-button-button"]').should('be.visible');

    //     //sort and pages
    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //         .should('have.length', 3)
    //         .and('contain.text', 'Status')
    //         .and('contain.text', 'Name')
    //         .and('contain.text', 'Email');

    //     cy.filterPerPage();

    //     // status filter
    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     cy.get('[data-cy="dropdown-button-button"]').eq(0).click();

    //     cy.get('[data-cy="dropdown-div-4"]')
    //         .should('contain.text', 'All Status')
    //         .and('contain.text', 'Active')
    //         .and('contain.text', 'Inactive');

    //     //roles filter
    //     cy.get('[data-cy="dropdown-button-button"]').eq(1).click();
    //     cy.get('[data-cy="dropdown-div-4"]')
    //         .should('contain.text', 'All Roles')
    //         .and('contain.text', 'Developer')
    //         .and('contain.text', 'Admin')
    //         .and('contain.text', 'Trainer')
    //         .and('contain.text', 'Trainee');

    //     //name and email filter
    //     cy.get('[data-cy="data-input-first_name"]').should('be.visible');
    //     cy.get('[data-cy="data-input-email"]').should('be.visible');

    //     //table
    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Name')
    //         .and('contain.text', 'Email')
    //         .and('contain.text', 'Role')
    //         .and('contain.text', 'Status');

    //     cy.get('[data-cy="row-menu-button-row-actions"]').first().click();

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit user');

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Send password reset');

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(2)
    //         .should('contain.text', 'Suspend');
    // });

    //CREATE
    it('should create a user', () => {
        cy.viewport(1280, 720);
        //esc key
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-first-name"]').type('Herlyn');

        cy.get('[data-cy="input-last-name"]').type('Torres');

        cy.get('[data-cy="input-email"]').type('torresherlynmae@gmail.com');

        cy.get('[data-cy="input-role"]').select('Developer');

        cy.get('body').type('{esc}');

        //close btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-first-name"]').type('Herlyn');

        cy.get('[data-cy="input-last-name"]').type('Torres');

        cy.get('[data-cy="input-email"]').type('torresherlynmae@gmail.com');

        cy.get('[data-cy="input-role"]').select('Developer');

        cy.get('[data-cy="modal-center-button-close"]').click();

        //cancel btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-first-name"]').type('Herlyn');

        cy.get('[data-cy="input-last-name"]').type('Torres');

        cy.get('[data-cy="input-email"]').type('torresherlynmae@gmail.com');

        cy.get('[data-cy="input-role"]').select('Developer');

        cy.get('[data-cy="close-button"]').click();

        //create btn - developer

        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-first-name"]').type('Herlyn');

        cy.get('[data-cy="input-last-name"]').type('Torres');

        cy.get('[data-cy="input-email"]').type('torresherlynmae@gmail.com');

        cy.get('[data-cy="input-role"]').select('Developer');

        cy.intercept('POST', '**/users').as('createUser');

        cy.get('[data-cy="submit-button"]').click();

        cy.wait('@createUser').then((interception) => {
            console.log(interception.response);
        });

        cy.contains('torresherlynmae@gmail.com', { timeout: 1000 }).should(
            'be.visible',
        );
    });

    // UPDATE
    it('should update a user', () => {
        cy.intercept('GET', )
    })

    // ARCHIVE

    // RESTORE

    // DELETE
});
