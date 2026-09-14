describe('Announcements Module', () => {
    const subject = `Cypress announcement ${Date.now()}`;
    const editedSubject = `${subject} (edited)`;
    const description = 'Created by the announcements Cypress spec.';

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
        cy.visit('/announcements');
    });

    // helpers -----------------------------------------------------------

    /** Filters the table down to a single row by subject via the search box. */
    function searchFor(text) {
        cy.get('[data-cy="toolbar-input-text"]').clear();
        if (text) {
            cy.get('[data-cy="toolbar-input-text"]').type(text);
        }
    }

    /** Opens the row-actions menu for the row containing `text` and clicks `label`. */
    function runRowAction(text, label) {
        cy.contains('[data-cy="settings-row-div-4"]', text)
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        cy.get('[role="menu"]').contains('[role="menuitem"]', label).click();
    }

    // ---------------------------------------------------------------
    // Page display + filters
    // ---------------------------------------------------------------

    describe('page display', () => {
        it('should load the announcement page', () => {
            cy.get('[data-cy="add-record-button"]').should('be.visible');
            cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
            cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
            cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
                'be.visible',
            );
            cy.get('[data-cy="toolbar-select-rows-per-page"]').should(
                'be.visible',
            );

            cy.filterPerPage();
        });

        it('should check the display of the table', () => {
            cy.get('[data-cy="settings-list-header-div-1"]')
                .should('contain.text', 'Subject')
                .and('contain.text', 'Audience Type')
                .and('contain.text', 'Scheduled at')
                .and('contain.text', 'Status');
        });
    });

    describe('filters', () => {
        beforeEach(() => {
            cy.get('[data-cy="toolbar-button-button"]').click();
        });

        it('should filter by status', () => {
            cy.get('[data-cy="dropdown-button-button"]').eq(0).click();
            cy.get('[data-cy="dropdown-div-4"]')
                .should('contain.text', 'All Status')
                .and('contain.text', 'Active')
                .and('contain.text', 'Inactive');

            cy.get('[data-cy="dropdown-div-4"]').contains('Active').click();
            cy.get('[data-cy="settings-row-div-4"]', { timeout: 5000 }).each(
                ($row) => {
                    cy.wrap($row).should('contain.text', 'Active');
                },
            );
        });

        it('should filter by subject (existing and non-existing text)', () => {
            cy.get('[data-cy="settings-row-div-2"]')
                .first()
                .invoke('text')
                .then((text) => {
                    const word = text.trim().split(/\s+/)[0];

                    cy.get('[data-cy="data-input-subject"]')
                        .click()
                        .type(word);

                    cy.get('[data-cy="settings-row-div-2"]')
                        .contains(word)
                        .should('be.visible');
                });

            cy.get('[data-cy="data-input-subject"]')
                .clear()
                .type('zzz-no-matching-subject-zzz');

            cy.contains('No records found', { timeout: 5000 }).should(
                'be.visible',
            );

            cy.get('[data-cy="data-input-subject"]').clear();
        });

        it('should filter by audience type', () => {
            cy.get('[data-cy="dropdown-button-button"]').eq(1).click();
            cy.get('[data-cy="dropdown-div-4"]')
                .should('contain.text', 'All trainees')
                .and('contain.text', 'Specific batch')
                .and('contain.text', 'Specific role')
                .and('contain.text', 'Custom group');

            cy.get('[data-cy="dropdown-div-4"]')
                .contains('Specific role')
                .click();

            // Selecting "Specific role" reveals a dependent Role filter.
            cy.contains('label', 'Role').should('be.visible');
        });

        it('should filter by description', () => {
            cy.get('[data-cy="data-input-description"]').should('exist');
        });

        it('should expose the expected sort options', () => {
            cy.get('[data-cy="toolbar-select-sort-by-change"] option')
                .should('have.length', 5)
                .and('contain.text', 'Status')
                .and('contain.text', 'Subject')
                .and('contain.text', 'Audience')
                .and('contain.text', 'Publish')
                .and('contain.text', 'Description');
        });

        it('should show the row actions menu', () => {
            cy.get('[data-cy="settings-row-div-4"]').should('be.visible');
            cy.get('[data-cy="row-menu-more-horizontal-2"]').first().click();
            cy.get('[role="menu"]').should('be.visible');
        });
    });

    // ---------------------------------------------------------------
    // CRUD
    // ---------------------------------------------------------------

    describe('crud', () => {
        it('should create a new announcement', () => {
            cy.get('[data-cy="add-record-button"]').click();

            cy.contains('h2', 'New announcement').should('be.visible');

            cy.get(
                'input[placeholder="e.g. Reminder: Submit your MOA before Friday"]',
            ).type(subject);
            cy.get(
                'textarea[placeholder="Write the announcement details..."]',
            ).type(description);

            cy.contains('button', 'Post announcement').click();

            cy.get('[data-cy="toast-p-5"]').should(
                'contain.text',
                'Announcement posted',
            );

            searchFor(subject);
            cy.contains('[data-cy="settings-row-div-4"]', subject)
                .should('be.visible')
                .and('contain.text', 'Active');
        });

        it('should validate that subject is required', () => {
            cy.get('[data-cy="add-record-button"]').click();
            cy.contains('button', 'Post announcement').click();
            cy.contains('Subject is required.').should('be.visible');
            cy.get('[data-cy="modal-button-close-dialog"]').click();
        });

        it('should edit the created announcement', () => {
            searchFor(subject);

            runRowAction(subject, 'Edit');

            cy.contains('h2', 'Edit announcement').should('be.visible');
            cy.get(
                'input[placeholder="e.g. Reminder: Submit your MOA before Friday"]',
            )
                .should('have.value', subject)
                .clear()
                .type(editedSubject);

            cy.contains('button', 'Save changes').click();

            cy.get('[data-cy="toast-p-5"]').should(
                'contain.text',
                'Announcement updated',
            );

            searchFor(editedSubject);
            cy.contains('[data-cy="settings-row-div-4"]', editedSubject).should(
                'be.visible',
            );
        });

        it('should archive the announcement', () => {
            searchFor(editedSubject);

            runRowAction(editedSubject, 'Archive');

            cy.contains('[data-cy="settings-row-div-4"]', editedSubject).should(
                'contain.text',
                'Archived',
            );
        });

        it('should restore the archived announcement', () => {
            searchFor(editedSubject);

            runRowAction(editedSubject, 'Restore');

            cy.contains('[data-cy="settings-row-div-4"]', editedSubject).should(
                'contain.text',
                'Active',
            );
        });

        it('should archive then permanently delete the announcement', () => {
            searchFor(editedSubject);
            runRowAction(editedSubject, 'Archive');
            cy.contains('[data-cy="settings-row-div-4"]', editedSubject).should(
                'contain.text',
                'Archived',
            );

            runRowAction(editedSubject, 'Delete');

            cy.get('[data-cy="confirm-delete-modal-div-2"]').should(
                'be.visible',
            );

            // Delete stays disabled until the exact subject is typed.
            cy.get('[data-cy="confirm-delete-modal-button-button-2"]').should(
                'be.disabled',
            );

            cy.get('[data-cy="confirm-delete-modal-input-confirm-text"]').type(
                editedSubject,
            );
            cy.get('[data-cy="confirm-delete-modal-button-button-2"]')
                .should('be.enabled')
                .click();

            searchFor(editedSubject);
            cy.contains('No records found', { timeout: 5000 }).should(
                'be.visible',
            );
        });
    });
});
