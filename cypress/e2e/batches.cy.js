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

        // Verify initially able
        cy.get('[data-cy="switch-button-aria-label"]').should(
            'have.attr',
            'aria-checked',
            'true',
        );

        // Enable the switch
        cy.get('[data-cy="switch-button-aria-label"]').eq(0).click();

        // Verify enabled
        cy.get('[data-cy="switch-button-aria-label"]').should(
            'have.attr',
            'aria-checked',
            'false',
        );

        // Disable the switch again
        cy.get('[data-cy="switch-button-aria-label"]').eq(0).click({
            multiple: false,
        });

        // Verify disabled
        cy.get('[data-cy="switch-button-aria-label"]').should(
            'have.attr',
            'aria-checked',
            'true',
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

    // Every test below acts on a batch it creates for itself (via
    // cy.createBatch()) instead of a hardcoded seeded batch code. The
    // previous version of this suite hardcoded FBS-9632/FBS-5908/FBS-3335:
    // "should delete batch" permanently deleted FBS-3335 and "should
    // terminate batch" permanently terminated FBS-5908 with no reset step,
    // so re-running the suite against the same database broke — the batch
    // could no longer be found. Using a fresh batch per test makes the
    // suite repeatable and removes any dependency on a specific seed run.

    /** Opens the row-actions menu for the row containing `code` and clicks `label`. */
    function runRowAction(code, label) {
        cy.contains('[data-cy="settings-row-div-4"]', code)
            .should('be.visible')
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[role="menu"]').contains('[role="menuitem"]', label).click();
    }

    //edit
    it('should edit a batch', () => {
        cy.createBatch().then((batch) => {
            cy.intercept('POST', `**/batches/${batch.id}`).as('updateBatch');

            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains(batch.batch_code, { timeout: 5000 }).should(
                'be.visible',
            );

            runRowAction(batch.batch_code, 'Edit');

            //update industry
            cy.get('[data-cy="use-async-select-field-button-button"]')
                .eq(1)
                .click();
            cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
                'Acc',
            );
            cy.get('[data-cy="use-async-select-field-button-button-2"]')
                .contains('Accounting')
                .should('be.visible')
                .click();

            cy.get('[data-cy="create-batch-modal-button-submit"]').click();

            cy.wait('@updateBatch', { timeout: 5000 });
            cy.get('[data-cy="toast-p-5"]').should(
                'contain.text',
                'Batch updated',
            );
        });
    });

    //registration QR
    it('should open the registration QR', () => {
        cy.createBatch().then((batch) => {
            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains(batch.batch_code, { timeout: 5000 }).should(
                'be.visible',
            );

            runRowAction(batch.batch_code, 'Registration QR');

            cy.get(
                '[data-cy="batch-registration-modal-modal-registration-link"]',
            ).should('be.visible');

            cy.get('[data-cy="batch-registration-modal-button-button"]').click();

            cy.get('[data-cy="toast-div-3"]')
                .should('contain.text', 'Registration link copied')
                .and('be.visible');

            cy.get('[data-cy="modal-button-close-dialog"]').click();
        });
    });

    //copy link
    it('should copy the registration link', () => {
        cy.createBatch().then((batch) => {
            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains(batch.batch_code, { timeout: 5000 }).should(
                'be.visible',
            );

            runRowAction(batch.batch_code, 'Copy link');

            cy.get('[data-cy="toast-p-5"]')
                .should('contain.text', 'Registration link copied')
                .and('be.visible');
        });
    });

    //archive + restore
    it('should archive then restore a batch', () => {
        cy.createBatch().then((batch) => {
            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains(batch.batch_code, { timeout: 5000 }).should(
                'be.visible',
            );

            runRowAction(batch.batch_code, 'Archive');
            cy.get('[data-cy="toast-p-5"]')
                .should('contain.text', 'Archived')
                .and('be.visible');
            cy.contains('[data-cy="settings-row-div-4"]', batch.batch_code)
                .should('contain.text', 'Archived');

            runRowAction(batch.batch_code, 'Restore');
            cy.get('[data-cy="toast-p-5"]')
                .should('contain.text', 'Restored')
                .and('be.visible');
            cy.contains('[data-cy="settings-row-div-4"]', batch.batch_code)
                .should('contain.text', 'Active');
        });
    });

    //terminate
    it('should terminate batch', () => {
        cy.createBatch().then((batch) => {
            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains(batch.batch_code, { timeout: 5000 }).should(
                'be.visible',
            );

            //click terminate, then cancel — batch must stay active
            runRowAction(batch.batch_code, 'Terminate');
            cy.get('[data-cy="index-modal-terminate-batch"]').should(
                'be.visible',
            );
            cy.get('[data-cy="index-button-button"]').click();
            cy.get('[data-cy="index-modal-terminate-batch"]').should(
                'not.exist',
            );
            cy.contains('[data-cy="settings-row-div-4"]', batch.batch_code)
                .should('contain.text', 'Active');

            //click terminate, then confirm
            runRowAction(batch.batch_code, 'Terminate');
            cy.get('[data-cy="index-modal-terminate-batch"]').should(
                'be.visible',
            );
            cy.get('[data-cy="index-button-button-2"]').click();

            cy.get('[data-cy="toast-p-5"]')
                .should('contain.text', 'Batch terminated')
                .and('be.visible');
            cy.contains('[data-cy="settings-row-div-4"]', batch.batch_code)
                .should('contain.text', 'Terminated');
        });
    });

    //delete
    it('should delete a batch', () => {
        cy.createBatch().then((batch) => {
            cy.intercept('DELETE', `**/batches/${batch.id}`).as('deleteBatch');

            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains(batch.batch_code, { timeout: 5000 }).should(
                'be.visible',
            );

            // Delete is only offered once the batch is non-active — archive
            // it first, exactly like a real user would have to.
            runRowAction(batch.batch_code, 'Archive');
            cy.contains('[data-cy="settings-row-div-4"]', batch.batch_code)
                .should('contain.text', 'Archived');

            //click delete, then cancel
            runRowAction(batch.batch_code, 'Delete');
            cy.get('[data-cy="confirm-delete-modal-div-2"]').should(
                'be.visible',
            );
            cy.contains(
                '[data-cy="confirm-delete-modal-button-button"]',
                'Cancel',
            ).click();
            cy.get('[data-cy="confirm-delete-modal-div-2"]').should(
                'not.exist',
            );
            cy.contains(
                '[data-cy="settings-row-div-4"]',
                batch.batch_code,
            ).should('be.visible');

            //click delete, then confirm (type-to-confirm guard)
            runRowAction(batch.batch_code, 'Delete');
            cy.get('[data-cy="confirm-delete-modal-div-2"]').should(
                'be.visible',
            );
            cy.get(
                '[data-cy="confirm-delete-modal-button-button-2"]',
            ).should('be.disabled');

            cy.get('[data-cy="confirm-delete-modal-input-confirm-text"]').type(
                batch.batch_code,
            );
            cy.get('[data-cy="confirm-delete-modal-button-button-2"]')
                .should('be.enabled')
                .click();

            cy.wait('@deleteBatch')
                .its('response.statusCode')
                .should('eq', 204);

            cy.get('[data-cy="toast-div-3"]').should('be.visible');
            cy.get('[data-cy="toolbar-input-text"]')
                .clear()
                .type(batch.batch_code);
            cy.contains('No records found', { timeout: 5000 }).should(
                'be.visible',
            );
        });
    });
});
