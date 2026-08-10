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
    it('should display the Users tab page correctly', () => {
        cy.viewport(1280, 720);
        cy.verifySettingsModuleHeader(); //settings module title

        //elements inside settings > users tab
        cy.get('[data-cy="add-record-button"]').should('be.visible');

        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
        cy.get('[data-cy="toolbar-button-button"]').should('be.visible');

        //sort and pages
        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
            .should('have.length', 3)
            .and('contain.text', 'Status')
            .and('contain.text', 'Name')
            .and('contain.text', 'Email');

        cy.filterPerPage();

        // status filter
        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="dropdown-button-button"]').eq(0).click();

        cy.get('[data-cy="dropdown-div-4"]')
            .should('contain.text', 'All Status')
            .and('contain.text', 'Active')
            .and('contain.text', 'Inactive');

        //roles filter
        cy.get('[data-cy="dropdown-button-button"]').eq(1).click();
        cy.get('[data-cy="dropdown-div-4"]')
            .should('contain.text', 'All Roles')
            .and('contain.text', 'Developer')
            .and('contain.text', 'Admin')
            .and('contain.text', 'Trainer')
            .and('contain.text', 'Trainee');

        //name and email filter
        cy.get('[data-cy="data-input-first_name"]').should('be.visible');
        cy.get('[data-cy="data-input-email"]').should('be.visible');

        //table
        cy.get('[data-cy="settings-list-header-div-1"]')
            .should('contain.text', 'Name')
            .and('contain.text', 'Email')
            .and('contain.text', 'Role')
            .and('contain.text', 'Status');

        cy.get('[data-cy="row-menu-button-row-actions"]').first().click();

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

    //filter
    it('should filter user by status', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="dropdown-button-button"]').eq(0).click();
        cy.get('[data-cy="dropdown-button-set-selected"]')
            .eq(2)
            .contains('Inactive')
            .should('be.visible')
            .click();
    });
    it('should filter user by roles', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="dropdown-button-button"]').eq(1).click();
        cy.get('[data-cy="dropdown-button-set-selected"]')
            .eq(3)
            .contains('Trainer')
            .should('be.visible')
            .click();
    });
    it('should filter user by name', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-first_name"]').type('Rolando');
    });
    it('should filter user by email', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-email"]').type(
            'developer@frontlinebusiness.com.ph',
        );
    });

    //search and clear
    it('should search and clear the search input', () => {
        cy.get('[data-cy="toolbar-input-text"]').type('Admin');
        cy.wait(2000);
        cy.get('[data-cy="toolbar-button-clear-search"]').click();

        cy.get('[data-cy="toolbar-input-text"]').type('Veronica');
        cy.wait(2000);
        cy.get('[data-cy="clear-all"]').click();
    });

    //  sorting
    it('should sort user by status', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortUser');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Status')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Status',
        );

        cy.wait('@sortUser').its('response.statusCode').should('eq', 200);
    });
    it('should sort user by name', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortUser');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Name')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Name',
        );

        cy.wait('@sortUser').its('response.statusCode').should('eq', 200);
    });
    it('should sort user by email', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortUser');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Email')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Email',
        );

        cy.wait('@sortUser').its('response.statusCode').should('eq', 200);
    });

    // per page
    it('should display correct number of records when changing rows per page', () => {
        cy.intercept('GET', '**/pagination-search*').as('getUser');

        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('25');

        cy.wait('@getUser').its('response.statusCode').should('eq', 200);
    });

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
        cy.intercept('GET', '**/pagination-search*').as('searchUser');

        cy.intercept('POST', '**/settings-users/**').as('updateUser');

        //close btn
        //search user
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Herlyn');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'Herlyn')
            .should('be.visible')
            .first()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //chose edit and click it to open the modal
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        //close btn
        cy.get('[data-cy="modal-center-button-close"]').click();

        //cancel btn
        //search user
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Herlyn');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'Herlyn')
            .should('be.visible')
            .first()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //chose edit and click it to open the modal
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        //cancel btn
        cy.get('[data-cy="close-button"]').click();

        //esc btn
        //search user
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Herlyn');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'Herlyn')
            .should('be.visible')
            .first()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //chose edit and click it to open the modal
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        //esc btn
        cy.get('body').type('{esc}');

        //save btn
        //search user
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Herlyn');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'Herlyn')
            .should('be.visible')
            .first()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        // Update First Name
        cy.get('[data-cy="input-first-name"]')
            .clear()
            .type('Mayeng')
            .should('have.value', 'Mayeng');

        // Save
        cy.get('[data-cy="submit-button"]').click();
    });

    // ARCHIVE
    it('should archive user', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchUser');
        cy.intercept('GET', '**/settings/partner-schools/**').as('archiveUser');

        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Mayeng');

        cy.wait('@searchUser');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'Mayeng')
            .should('be.visible')
            .first()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click archive
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('be.visible')
            .click();

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    // RESTORE
    it('should restore user', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchUser');
        cy.intercept('GET', '**/settings/partner-schools/**').as('restoreUser');

        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Mayeng');

        cy.wait('@searchUser');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'Mayeng')
            .should('be.visible')
            .first()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click restore
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('be.visible')
            .click();

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    // DELETE
    it('should delete user', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchUser');
        cy.intercept('POST', '**/settings-users/**').as('archiveUser');
        cy.intercept('DELETE', '**/settings-users/**').as('deleteUser');

        // Search user
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Mayeng');

        // Open row actions
        cy.contains('[data-cy="settings-row-div-4"]', 'Mayeng')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Suspend user
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('contain.text', 'Suspend')
            .click();

        cy.get('[data-cy="clear-all"]').click();

        // Search user
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Mayeng');

        // Open row actions again
        cy.contains('[data-cy="settings-row-div-4"]', 'Mayeng')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Delete
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(3)
            .should('contain.text', 'Delete')
            .click();

        // Confirm email
        cy.get('[data-cy="confirm-delete-modal-input-confirm-text"]').type(
            'torresherlynmae@gmail.com',
        );

        // Click Delete in confirmation modal
        cy.get('[data-cy="confirm-delete-modal-button-button-2"]')
            .should('contain.text', 'Delete')
            .click();
    });
});
