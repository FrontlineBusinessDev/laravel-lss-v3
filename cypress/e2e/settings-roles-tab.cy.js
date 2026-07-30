const { Cylinder } = require('lucide-react');

describe('Settings - Users - Roles Tab Page', () => {
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

        cy.visit('/settings/roles');
    });

    // //check roles tab page display
    // it('should  display roles tab  page correctly', () => {
    //     cy.viewport(1280, 720);
    //     cy.verifySettingsModuleHeader();

    //     cy.get('[data-cy="add-record-button"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option').should(
    //         'contain.text',
    //         'Role',
    //     );
    //     cy.filterPerPage();

    //     cy.get('[data-cy="toolbar-button-button"]').click();
    //     cy.get('[data-cy="dropdown-button-button"]').click();

    //     cy.contains('All Status').should('be.visible');
    //     cy.contains('Active').should('be.visible');
    //     cy.contains('Inactive').should('be.visible');

    //     cy.get('[data-cy="data-input-name"]').should('be.visible');

    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Role')
    //         .and('contain.text', 'Permissions')
    //         .and('contain.text', 'Status');

    //     cy.get('[data-cy="row-menu-button-row-actions"]').first().click();
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Edit role');
    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('contain.text', 'Delete role');
    // });

    // //search and clear
    // it('should search and clear the search input', () => {
    //     cy.intercept('GET', '**/pagination-search*').as('searchRole');

    //     cy.get('[data-cy="toolbar-input-text"]').type('Trainee');

    //     cy.wait('@searchRole').its('response.statusCode').should('eq', 200);

    //     cy.get('[data-cy="toolbar-button-clear-search"]').click();

    //     cy.get('[data-cy="toolbar-input-text"]').clear().type('Trainer');

    //     cy.wait('@searchRole');

    //     cy.get('[data-cy="clear-all"]').click();
    // });

    // //sorting
    // it('should sort role by status', () => {
    //     cy.intercept('GET', '**/pagination-search*').as('sortRole');

    //     cy.get('[data-cy="toolbar-option-sort"]')
    //         .contains('Role')
    //         .should('exist');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: Role',
    //     );

    //     cy.wait('@sortRole').its('response.statusCode').should('eq', 200);
    // });

    // //per page
    // it('should display correct number of records when changing rows per page', () => {
    //     cy.intercept('GET', '**/pagination-search*').as('getRole');

    //     cy.get('[data-cy="toolbar-select-rows-per-page"]').select('25');

    //     cy.wait('@getRole').its('response.statusCode').should('eq', 200);
    // });

    //create
    it('should create a role', () => {
        //esc key
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('body').type('{esc}');
        //close key
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="modal-button-close-dialog"]', {
            timeout: 1000,
        }).click();
        //cancel key
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="button-button-1"]', {
            timeout: 1000,
        })
            .eq(0)
            .click();

        //create
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="role-modal-input-e-g-program-coordinator"]').type(
            'Manager',
        );
        cy.get('[data-cy="role-modal-button-button"]').eq(0).click();
        cy.get('[data-cy="role-modal-input-checkbox"]').eq(5).click();
        cy.get('[data-cy="role-modal-input-checkbox"]').eq(8).click();
        cy.get('[data-cy="role-modal-button-button"]').eq(0).click();

        cy.intercept('POST', '**/roles').as('createRole');
        cy.get('[data-cy="button-button-1"]').eq(1).click();

        cy.wait('@createRole').then((interception) => {
            console.log(interception.response);
        });

        cy.contains('Manager', {
            timeout: 1000,
        }).should('be.visible');
        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    //update
    it('should update a role', () => {
        cy.intercept('POST', '**/settings-roles/**').as('updateRole');

        //esc
        cy.contains('[data-cy="settings-row-div-4"]', 'Manager')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('body').type('{esc}');

        //close
        cy.contains('[data-cy="settings-row-div-4"]', 'Manager')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();
        cy.get('[data-cy="modal-button-close-dialog"]').click();

        //cancel
        cy.contains('[data-cy="settings-row-div-4"]', 'Manager')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="button-button-1"]').eq(0).click();

        //update
        cy.contains('[data-cy="settings-row-div-4"]', 'Manager')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="role-modal-input-e-g-program-coordinator"]').clear().type('Managers').should('have.value', 'Managers');

        cy.get('[data-cy="role-modal-button-button"]').eq(0).click();

        cy.get('[data-cy="button-button-1"]').eq(1).click();
    });

    //delete
    it('should delete a role', () => {
        cy.intercept('DELETE', '**/settings-roles/**').as('deleteRole');

        //cancel
        cy.contains('[data-cy="settings-row-div-4"]', 'Manager')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.get('[data-cy="confirm-delete-modal-button-button"]').click();

        //delete
        cy.contains('[data-cy="settings-row-div-4"]', 'Manager')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.get('[data-cy="confirm-delete-modal-button-button-2"]').click();

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });
});
