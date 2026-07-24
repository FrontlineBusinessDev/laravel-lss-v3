describe('Batches Module', () => {
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
        cy.visit('/batches');
    });

    // afterEach(function () {
    //     if (this.currentTest.state === 'failed') {
    //         cy.screenshot(`Batches/${this.currentTest.title}`, {
    //             capture: 'runner',
    //         });
    //     }
    // });

    //check batches page display
    // it('should load the Batches Page', () => {
    //     //elements inside batches page
    //     cy.get('[data-cy="add-record-button"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
    //         'be.visible',
    //     );

    //     //filter
    //     cy.get('[data-cy="toolbar-button-button"]').should('be.visible');

    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     //program type
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(0)
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-button-button-2"]')
    //         .should('contain.text', 'All')
    //         .and('contain.text', 'College On-the-Job Training')
    //         .and('contain.text', 'Continuing Studies')
    //         .and('contain.text', 'Senior High School Work Immersion')
    //         .and('contain.text', 'Upskill Training');

    //     //industry
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(1)
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-button-button-2"]')
    //         .should('contain.text', 'All')
    //         .and('contain.text', 'Accounting')
    //         .and('contain.text', 'Information Technology');

    //     //setup
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(2)
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-button-button-2"]')
    //         .should('contain.text', 'All')
    //         .and('contain.text', 'Face to Face (F2F)')
    //         .and('contain.text', 'Online');

    //     //status
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(3)
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-button-button-2"]')
    //         .should('contain.text', 'All')
    //         .and('contain.text', 'Active')
    //         .and('contain.text', 'Inactive')
    //         .and('contain.text', 'Completed')
    //         .and('contain.text', 'Terminated');

    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     //sort
    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //         .should('have.length', 4)
    //         .and('contain.text', 'Batch Code')
    //         .and('contain.text', 'Date Started')
    //         .and('contain.text', 'Projected End')
    //         .and('contain.text', 'Created');

    //     //page filter
    //     cy.filterPerPage();

    //     //table
    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Batch Code')
    //         .and('contain.text', 'Program')
    //         .and('contain.text', 'Industry')
    //         .and('contain.text', 'Setup')
    //         .and('contain.text', 'Trainees');

    //     cy.get('[data-cy="settings-row-div-4"]').first().click();

    //     //back to batches list
    //     cy.get('[data-cy="batch-detail-layout-link-batches"]').click();

    //     // Verify initially disabled
    //     // cy.get('[data-cy="switch-button-aria-label"]')
    //     //     .should('have.attr', 'aria-checked', 'false');

    //     // // Enable the switch
    //     //     cy.get('[data-cy="switch-button-aria-label"]').click();

    //     // Verify enabled
    //     cy.get('[data-cy="switch-button-aria-label"]').should(
    //         'have.attr',
    //         'aria-checked',
    //         'true',
    //     );

    //     // Disable the switch again
    //     cy.get('[data-cy="switch-button-aria-label"]').click({
    //         multiple: true,
    //     });

    //     // Verify disabled
    //     cy.get('[data-cy="switch-button-aria-label"]').should(
    //         'have.attr',
    //         'aria-checked',
    //         'false',
    //     );

    //     //actions
    //     cy.get('[data-cy="row-menu-more-horizontal-2"]').click();

    //     // cy.get('[data-cy="row-menu-button-4"]').eq(0)
    //     //     .should('contain.text', 'Edit');

    //     // cy.get('[data-cy="row-menu-button-4"]').eq(1)
    //     //     .should('contain.text', 'Registration QR');

    //     // cy.get('[data-cy="row-menu-button-4"]').eq(2)
    //     //     .should('contain.text', 'Copy link');

    //     // cy.get('[data-cy="row-menu-button-4"]').eq(3)
    //     //     .should('contain.text', 'Archive');

    //     // cy.get('[data-cy="row-menu-button-4"]').eq(4)
    //     //     .should('contain.text', 'Terminate');

    //     // cy.get('[data-cy="row-menu-button-row-actions"]').click();
    // });

    //add batch
    it('should add a new batch', () => {
        //esc key
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('body').type('{esc}'); //esc key

        //cancel btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(0)
            .click();

        //type/search option
        cy.get('[data-cy="use-async-select-field-input-placeholder"]', {
            timeout: 1000,
        }).type('College');

        //select result
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .contains('College On-the-Job Training')
            .should('be.visible')
            .click();

        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .click();

        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .contains('Information Technology')
            .should('be.visible')
            .click();

        cy.get('[data-cy="create-batch-modal-button-button"]').click(); //cancel btn

        // //close btn
        // cy.get('[data-cy="add-record-button"]').click();

        // cy.get('[data-cy="modal-button-close-dialog"]').click(); //close btn

        // //save btn complete details
        // cy.get('[data-cy="add-record-button"]').click();

        // cy.get('[data-cy="use-async-select-field-button-button"]')
        //     .eq(0)
        //     .click();

        // //type/search option
        // cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
        //     'College',
        // );

        // //select result
        // cy.get('[data-cy="use-async-select-field-button-button-2"]')
        //     .should('contain.text', 'College On-the-Job Training')
        //     .click();

        // cy.get('[data-cy="use-async-select-field-button-button"]')
        //     .eq(1)
        //     .click();

        // cy.contains('Accounting').click();

        // cy.get('[data-cy="create-batch-modal-input-date"]').type('2026-07-27');

        // cy.get('[data-cy="create-batch-modal-input-projected-end-date"]').type(
        //     '2026-08-28',
        // );

        // cy.get('[data-cy="create-batch-modal-input-checkbox"]')
        //     .check()
        //     .should('be.checked');

        // cy.intercept('POST', '**/batches').as('createBatch');

        // //add batch btn
        // cy.get('[data-cy="create-batch-modal-button-submit"]').click();

        // cy.wait('@createBatch').then((interception) => {
        //     console.log(interception.response);
        // });

        // //add batch inc details
        // cy.get('[data-cy="add-record-button"]').click();

        // cy.get('[data-cy="use-async-select-field-button-button"]')
        //     .eq(1)
        //     .click();

        // cy.contains('Accounting (ACCT)')
        //    .click();

        // cy.get('[data-cy="create-batch-modal-input-date"]')
        //     .type('2026-07-27');

        // cy.get('[data-cy="create-batch-modal-input-projected-end-date"]')
        //     .type('2026-08-28');

        // cy.get('[data-cy="create-batch-modal-input-checkbox"]')
        //   .check()
        //   .should('be.checked');
    });
});
