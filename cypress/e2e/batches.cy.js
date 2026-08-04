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

    // // afterEach(function () {
    // //     if (this.currentTest.state === 'failed') {
    // //         cy.screenshot(`Batches/${this.currentTest.title}`, {
    // //             capture: 'runner',
    // //         });
    //     }
    // });

    //check batches page display
    it('should load the Batches Page', () => {
        //elements inside batches page
        cy.get('[data-cy="add-record-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
        cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
            'be.visible',
        );

        //filter
        cy.get('[data-cy="toolbar-button-button"]').should('be.visible');

        cy.get('[data-cy="toolbar-button-button"]').click();

        //program type
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(0)
            .click();
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .should('contain.text', 'All')
            .and('contain.text', 'College On-the-Job Training')
            .and('contain.text', 'Continuing Studies')
            .and('contain.text', 'Senior High School Work Immersion')
            .and('contain.text', 'Upskill Training');

        //industry
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .click();
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .should('contain.text', 'All')
            .and('contain.text', 'Accounting')
            .and('contain.text', 'Information Technology');

        //setup
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(2)
            .click();
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .should('contain.text', 'All')
            .and('contain.text', 'Face to Face (F2F)')
            .and('contain.text', 'Online');

        //status
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(3)
            .click();
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .should('contain.text', 'All')
            .and('contain.text', 'Active')
            .and('contain.text', 'Inactive')
            .and('contain.text', 'Completed')
            .and('contain.text', 'Terminated');

        cy.get('[data-cy="toolbar-button-button"]').click();

        //sort
        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
            .should('have.length', 4)
            .and('contain.text', 'Batch Code')
            .and('contain.text', 'Date Started')
            .and('contain.text', 'Projected End')
            .and('contain.text', 'Created');

        //page filter
        cy.filterPerPage();

        //table
        cy.get('[data-cy="settings-list-header-div-1"]')
            .should('contain.text', 'Batch Code')
            .and('contain.text', 'Program')
            .and('contain.text', 'Industry')
            .and('contain.text', 'Setup')
            .and('contain.text', 'Trainees');

        cy.get('[data-cy="settings-row-div-4"]').first().click();

        //back to batches list
        cy.get('[data-cy="batch-detail-layout-link-batches"]').click();

        // Verify initially disabled
        cy.get('[data-cy="switch-button-aria-label"]').should(
            'have.attr',
            'aria-checked',
            'false',
        );

        // Enable the switch
        cy.get('[data-cy="switch-button-aria-label"]').eq(0).click();

        // Verify enabled
        cy.get('[data-cy="switch-button-aria-label"]').should(
            'have.attr',
            'aria-checked',
            'true',
        );

        // Disable the switch again
        cy.get('[data-cy="switch-button-aria-label"]').eq(0).click({
            multiple: true,
        });

        // Verify disabled
        cy.get('[data-cy="switch-button-aria-label"]').should(
            'have.attr',
            'aria-checked',
            'false',
        );

        //actions
        cy.get('[data-cy="row-menu-more-horizontal-2"]').eq(0).click();

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('contain.text', 'Edit');

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('contain.text', 'Registration QR');

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('contain.text', 'Copy link');

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(3)
            .should('contain.text', 'Archive');

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(4)
            .should('contain.text', 'Terminate');

        cy.get('[data-cy="row-menu-button-row-actions"]').eq(0).click();
    });

    // add batch
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

        //close btn
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="modal-button-close-dialog"]').click(); //close btn

        // save btn complete details
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(0)
            .click();

        //type/search option
        cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
            'College',
        );

        //select result
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .contains('College On-the-Job Training')
            .should('be.visible')
            .click();
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .click();
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .contains('Accounting')
            .should('be.visible')
            .click();
        cy.get('[data-cy="create-batch-modal-input-date"]').type('2026-07-27');
        cy.get('[data-cy="create-batch-modal-input-projected-end-date"]').type(
            '2026-08-28',
        );
        cy.get('[data-cy="create-batch-modal-input-checkbox"]')
            .check()
            .should('be.checked');
        cy.intercept('POST', '**/batches').as('createBatch');

        //add batch btn
        cy.get('[data-cy="create-batch-modal-button-submit"]').click();
        cy.wait('@createBatch').then((interception) => {
            console.log(interception.response);
        });

        // add batch inc details
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .click();
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .contains('Accounting')
            .should('be.visible')
            .click();
        cy.get('[data-cy="create-batch-modal-input-date"]').type('2026-07-27');
        cy.get('[data-cy="create-batch-modal-input-projected-end-date"]').type(
            '2026-08-28',
        );
        cy.get('[data-cy="create-batch-modal-input-checkbox"]')
            .check()
            .should('be.checked');
        cy.get('[data-cy="create-batch-modal-button-submit"]').click();
        cy.contains('Academic program type is required.').should('be.visible');
        cy.get('[data-cy="create-batch-modal-button-button"]').click();

        // add batch w/o content
        cy.get('[data-cy="add-record-button"]').click();
        cy.get('[data-cy="create-batch-modal-button-submit"]').click();
        cy.contains('Academic program type is required.').should('be.visible');
        cy.contains('Industry is required').should('be.visible');
        cy.contains('Start date is required').should('be.visible');
        cy.get('[data-cy="create-batch-modal-button-button"]').click();
    });

    //edit
    it('should edit a batch', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchBatch');

        cy.intercept('**/batches/**').as('updateBatch');

        //search a batch
        cy.get('[data-cy="toolbar-input-text"]').click();

        cy.get('[data-cy="toolbar-input-text"]').type('FBS-9606');

        cy.wait('@searchBatch');

        cy.contains('FBS-9606', { timeout: 1000 }).should('be.visible');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-9606')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        //update industry
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .click();

        //type and search
        cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
            'Information',
        );

        //select result
        cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .contains('Information Technology')
            .should('be.visible')
            .click();

        //save
        cy.get('[data-cy="create-batch-modal-button-submit"]').click();

        //verify update
        cy.wait('@updateBatch', { timeout: 5000 });

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    //registration QR
    it('should open the registration QR', () => {
        // Search batch
        cy.get('[data-cy="toolbar-input-text"]').type('FBS-9606');

        cy.contains('FBS-9606', { timeout: 1000 }).should('be.visible');

        // Open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-9606')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click registration qr
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        // Verify registration link modal
        cy.get(
            '[data-cy="batch-registration-modal-modal-registration-link"]',
        ).should('be.visible');

        // Click copy link
        cy.get('[data-cy="batch-registration-modal-button-button"]').click();

        // Verify copied link toast
        cy.get('[data-cy="toast-div-3"]')
            .should('contain.text', 'Registration link copied')
            .and('be.visible');

        //exit modal
        cy.get('[data-cy="modal-button-close-dialog"]').click();
    });

    //copy link
    it('should copy the registration link', () => {
        // Search batch
        cy.get('[data-cy="toolbar-input-text"]').type('FBS-9606');

        cy.contains('FBS-9606', { timeout: 1000 }).should('be.visible');

        // Open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-9606')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click copy link
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('be.visible')
            .click();

        //verify copied link
        cy.get('[data-cy="toast-p-5"]')
            .should('contain.text', 'Registration link copied')
            .and('be.visible');
    });

    //archive
    it('should archive batch', () => {
        // Search batch
        cy.get('[data-cy="toolbar-input-text"]').type('FBS-9606');

        cy.contains('FBS-9606', { timeout: 1000 }).should('be.visible');

        // Open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-9606')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click archive
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(3)
            .should('be.visible')
            .click();

        //verify archived batch
        cy.get('[data-cy="toast-p-5"]')
            .should('contain.text','Archived')
            .and('be.visible');
    });

    //restore
    it('should restore batch', () => {
        // Search batch
        cy.get('[data-cy="toolbar-input-text"]').type('FBS-9606');

        cy.contains('FBS-9606', { timeout: 1000 }).should('be.visible');

        // Open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-9606')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click archive
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(3)
            .should('be.visible')
            .click();

        //verify archived batch
        cy.get('[data-cy="toast-p-5"]')
            // .should('contain.text', 'Restored')
            .and('be.visible');
    });

    //terminate
    it('should terminate batch', () => {
        //search batch
        cy.get('[data-cy="toolbar-input-text"]').clear().type('FBS-8314');

        cy.contains('FBS-8314', { timeout: 1000 }).should('be.visible');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-8314')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click terminate
        cy.contains('[data-cy="row-menu-button-4"]', 'Terminate')
            .should('contain.text', 'Terminate')
            .click();

        //terminate modal
        cy.get('[data-cy="index-modal-terminate-batch"]').should('be.visible');

        //click cancel
        cy.get('[data-cy="index-button-button"]').click();

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-8314')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click terminate
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(4)
            .should('be.visible')
            .click();

        //terminate modal
        cy.get('[data-cy="index-modal-terminate-batch"]').should('be.visible');

        //click terminate button
        cy.get('[data-cy="index-button-button-2"]').click();

        //verify terminate
        cy.get('[data-cy="toast-p-5"]')
            .should('contain.text', 'Batch terminated')
            .and('be.visible');
    });

    //delete
    it('should delete batch', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchBatch');
        cy.intercept('GET', '**/batches/**').as('deleteBatch');
        cy.intercept('DELETE', '**/settings/partner-schools/**').as(
            'deleteBatch',
        );
        //search batch
        cy.get('[data-cy="toolbar-input-text"]').clear().type('FBS-8314');

        cy.contains('FBS-8314', { timeout: 1000 }).should('be.visible');

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-8314')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click delete
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(4)
            .should('be.visible')
            .click();

        //delete modal
        cy.get('[data-cy="confirm-delete-modal-div-2"]').should('be.visible');

        //click cancel
        cy.contains(
            '[data-cy="confirm-delete-modal-button-button"]',
            'Cancel',
        ).click();

        //open action menu
        cy.contains('[data-cy="settings-row-div-4"]', 'FBS-8314')
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        //click delete
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(4)
            .should('be.visible')
            .click();

        //delete modal
        cy.get('[data-cy="confirm-delete-modal-div-2"]').should('be.visible');

        cy.get('[data-cy="confirm-delete-modal-input-confirm-text"]').type(
            'FBS-8314',
        );

        cy.get('[data-cy="confirm-delete-modal-button-button-2"]').click();

        cy.wait('@deleteBatch');

        //verify delete
        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });
});
