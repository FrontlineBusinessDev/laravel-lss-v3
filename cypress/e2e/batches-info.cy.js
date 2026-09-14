describe('Batches Module - Batch Detail', () => {
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

    /**
     * The batch header's status badge. `StatusBadge` doesn't spread props
     * through to the DOM, so every badge on the page — the header one *and*
     * each trainee row's — shares the same generic
     * `[data-cy="status-badge-span-1"]` selector once the trainees list has
     * loaded. Scope to the header container to avoid matching the whole set.
     */
    function headerStatusBadge() {
        return cy
            .get('[data-cy="batch-detail-layout-div-6"]')
            .find('[data-cy="status-badge-span-1"]');
    }

    // ---------------------------------------------------------------
    // Read-only checks against a known seeded batch (FBS-8323 / id 8),
    // which has real trainee data the trainees tab needs.
    // ---------------------------------------------------------------

    describe('detail page (read-only, seeded batch)', () => {
        it('should search and select a batch, then display its detail page', () => {
            cy.intercept('GET', '**/pagination-search*').as('searchBatch');

            cy.get('[data-cy="toolbar-input-text"]').click();
            cy.get('[data-cy="toolbar-input-text"]').type('FBS-8323');

            cy.wait('@searchBatch');

            cy.contains('FBS-8323', { timeout: 5000 }).should('be.visible');

            cy.get('[data-cy="settings-row-div-4"]').click();

            // Check the display of the batch info page.
            cy.get('[data-cy="batch-detail-layout-div-1"]').should(
                'be.visible',
            );

            cy.get('[data-cy="batch-detail-layout-span-7"]')
                .should('be.visible')
                .and('have.text', 'FBS-8323');

            headerStatusBadge().should('be.visible').and('have.text', 'Active');

            // The "Created <date>" portion is rendered via
            // `toLocaleDateString` in the *viewer's* local timezone (see
            // BatchDetailLayout.tsx), so asserting an exact hardcoded date
            // is flaky across machines/timezones/DST. Assert the format and
            // the stable prefix instead.
            cy.get('[data-cy="batch-detail-layout-p-9"]')
                .should('be.visible')
                .invoke('text')
                .should(
                    'match',
                    /^Continuing Studies · Information Technology · Online · Created [A-Z][a-z]{2} \d{1,2}, \d{4}$/,
                );

            cy.get('[data-cy="button-button-1"]')
                .eq(0)
                .should('be.visible')
                .and('have.text', 'Edit');

            cy.get('[data-cy="button-button-1"]')
                .eq(1)
                .should('be.visible')
                .and('have.text', 'Archive');

            cy.get('[data-cy="button-button-1"]')
                .eq(2)
                .should('be.visible')
                .and('have.text', 'Terminate');

            cy.get('[data-cy="batch-detail-layout-div-39"]')
                .eq(0)
                .should('contain.text', 'Batch number')
                .and('contain.text', 'FBS-8323');

            cy.get('[data-cy="batch-detail-layout-div-39"]')
                .eq(1)
                .should('contain.text', 'Trainees');

            cy.get('[data-cy="batch-detail-layout-div-39"]')
                .eq(2)
                .should('contain.text', 'Industry')
                .and('contain.text', 'Information Technology');

            cy.get('[data-cy="batch-detail-layout-div-39"]')
                .eq(3)
                .should('contain.text', 'Program type')
                .and('contain.text', 'Continuing Studies');

            cy.get('[data-cy="batch-detail-layout-div-25"]').should(
                'contain.text',
                'Registration link',
            );

            cy.contains(
                '[data-cy="button-button-1"]',
                'Copy link',
            ).should('be.visible');

            // Tabs
            cy.get('[data-cy="batch-detail-layout-link-t-href"]')
                .eq(0)
                .should('contain.text', 'Trainees');

            cy.get('[data-cy="batch-detail-layout-link-t-href"]')
                .eq(1)
                .should('contain.text', 'Trainers');
        });

        it('should open and close the edit modal without saving', () => {
            cy.visit('/batches/8');

            cy.contains('[data-cy="button-button-1"]', 'Edit').click();
            cy.get('[data-cy="use-async-select-field-button-button"]').should(
                'be.visible',
            );

            // Close via the X button.
            cy.get('[data-cy="modal-button-close-dialog"]').click();
            cy.get('[data-cy="use-async-select-field-button-button"]').should(
                'not.exist',
            );

            // Close via Esc.
            cy.contains('[data-cy="button-button-1"]', 'Edit').click();
            cy.get('body').type('{esc}');
            cy.get('[data-cy="use-async-select-field-button-button"]').should(
                'not.exist',
            );
        });

        it('should open and cancel the terminate confirmation without terminating', () => {
            cy.visit('/batches/8');

            cy.contains('[data-cy="button-button-1"]', 'Terminate').click();
            cy.get('[data-cy="batch-detail-layout-modal-35"]').should(
                'be.visible',
            );

            cy.get('[data-cy="batch-detail-layout-button-button"]').click();
            cy.get('[data-cy="batch-detail-layout-modal-35"]').should(
                'not.exist',
            );

            // The batch must still be active — nothing was confirmed.
            headerStatusBadge().should('have.text', 'Active');
        });

        it('should copy the registration link', () => {
            cy.visit('/batches/8');

            cy.contains('[data-cy="button-button-1"]', 'Copy link').click();

            cy.get('[data-cy="toast-p-5"]')
                .should('contain.text', 'Registration link copied')
                .and('be.visible');
        });
    });

    // ---------------------------------------------------------------
    // Mutating lifecycle actions (archive/restore) run against a batch
    // created for this spec, never the shared seeded batch, so the suite
    // stays repeatable.
    // ---------------------------------------------------------------

    describe('detail page (lifecycle actions, throwaway batch)', () => {
        it('should archive then restore a batch from its detail page', () => {
            cy.createBatch().then((batch) => {
                cy.visit(`/batches/${batch.id}`);

                cy.contains('[data-cy="button-button-1"]', 'Archive').click();
                cy.get('[data-cy="toast-p-5"]').should(
                    'contain.text',
                    'Batch archived',
                );
                headerStatusBadge().should('have.text', 'Archived');

                cy.contains('[data-cy="button-button-1"]', 'Restore').click();
                cy.get('[data-cy="toast-p-5"]').should(
                    'contain.text',
                    'Batch restored',
                );
                headerStatusBadge().should('have.text', 'Active');
            });
        });
    });

    // ---------------------------------------------------------------
    // Trainees tab (against the seeded batch, which has real trainees)
    // ---------------------------------------------------------------

    describe('trainees tab', () => {
        beforeEach(() => {
            cy.visit('/batches/8');
        });

        it('should display the trainees tab table', () => {
            cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
            cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
            cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
                'be.visible',
            );
            cy.get('[data-cy="toolbar-select-rows-per-page"]').should(
                'be.visible',
            );

            cy.get('[data-cy="settings-list-header-div-1"]')
                .should('contain.text', 'Trainee')
                .and('contain.text', 'School')
                .and('contain.text', 'Required hrs')
                .and('contain.text', 'Status');

            cy.get('[data-cy="trainees-div-2"]').should('be.visible');
        });

        it('should search trainees by name', () => {
            cy.get('[data-cy="trainees-div-2"]')
                .first()
                .find('[data-cy="trainees-span-5"]')
                .invoke('text')
                .then((fullName) => {
                    const firstName = fullName.trim().split(/\s+/)[0];

                    cy.get('[data-cy="toolbar-input-text"]')
                        .click()
                        .type(firstName);

                    cy.get('[data-cy="trainees-div-2"]')
                        .should('contain.text', firstName)
                        .and('be.visible');
                });

            cy.get('[data-cy="toolbar-input-text"]').clear();
        });

        it('should filter trainees by status', () => {
            cy.get('[data-cy="toolbar-button-button"]').click();

            cy.get('[data-cy="dropdown-button-button"]').click();
            cy.get('[data-cy="dropdown-div-4"]')
                .should('contain.text', 'All Status')
                .and('contain.text', 'Active')
                .and('contain.text', 'Terminated')
                .and('contain.text', 'Archived');

            cy.get('[data-cy="dropdown-div-4"]').contains('Active').click();

            cy.get('[data-cy="trainees-div-2"]', { timeout: 5000 }).should(
                ($rows) => {
                    expect($rows.length).to.be.greaterThan(0);
                    $rows.each((_, row) => {
                        expect(row.textContent).to.contain('Active');
                    });
                },
            );

            cy.get('[data-cy="dropdown-button-button"]').click();
            cy.get('[data-cy="dropdown-div-4"]').contains('All Status').click();
        });

        it('should expose the expected sort options', () => {
            cy.get('[data-cy="toolbar-select-sort-by-change"] option')
                .should('have.length', 4)
                .and('contain.text', 'Status')
                .and('contain.text', 'First Name')
                .and('contain.text', 'Last Name')
                .and('contain.text', 'Required hrs');
        });

        it('should support the rows-per-page filter', () => {
            cy.filterPerPage();
        });

        it('should show Transfer/Terminate/Archive on a trainee row menu', () => {
            cy.get('[data-cy="trainees-div-2"]')
                .first()
                .find('[data-cy="row-menu-more-horizontal-2"]')
                .click();

            cy.get('[role="menu"]').within(() => {
                cy.get('[role="menuitem"]').eq(0).should('contain.text', 'Transfer');
                cy.get('[role="menuitem"]').eq(1).should('contain.text', 'Terminate');
                cy.get('[role="menuitem"]').eq(2).should('contain.text', 'Archive');
            });
        });

        it('should open and close the transfer modal', () => {
            cy.get('[data-cy="trainees-div-2"]')
                .first()
                .find('[data-cy="row-menu-more-horizontal-2"]')
                .click();

            cy.get('[role="menu"]').contains('[role="menuitem"]', 'Transfer').click();

            cy.get('[data-cy="transfer-trainee-modal"]').should('be.visible');

            // Close via Esc.
            cy.get('body').type('{esc}');
            cy.get('[data-cy="transfer-trainee-modal"]').should('not.exist');

            // Reopen, close via the X button.
            cy.get('[data-cy="trainees-div-2"]')
                .first()
                .find('[data-cy="row-menu-more-horizontal-2"]')
                .click();
            cy.get('[role="menu"]').contains('[role="menuitem"]', 'Transfer').click();
            cy.get('[data-cy="modal-x-6"]').click();
            cy.get('[data-cy="transfer-trainee-modal"]').should('not.exist');

            // Reopen, cancel via the Cancel button.
            cy.get('[data-cy="trainees-div-2"]')
                .first()
                .find('[data-cy="row-menu-more-horizontal-2"]')
                .click();
            cy.get('[role="menu"]').contains('[role="menuitem"]', 'Transfer').click();
            cy.get('[data-cy="transfer-trainee-modal"]').should('be.visible');
            cy.get('[data-cy="transfer-trainee-modal-cancel-button"]').click();
            cy.get('[data-cy="transfer-trainee-modal"]').should('not.exist');
        });
    });

    // ---------------------------------------------------------------
    // Trainers tab
    // ---------------------------------------------------------------

    describe('trainers tab', () => {
        it('should navigate to the trainers tab', () => {
            cy.visit('/batches/8');

            cy.get('[data-cy="batch-detail-layout-link-t-href"]')
                .contains('Trainers')
                .click();

            cy.url().should('match', /\/batches\/8\/trainers$/);
            cy.get('[data-cy="batch-trainers-page-section"]').should(
                'be.visible',
            );
        });
    });
});
