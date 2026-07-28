const { Cylinder } = require('lucide-react');

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

    //check batches page display
    it('should load the Batches Page', () => {
        //elements inside batches page
        cy.get('[data-cy="add-record-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
        cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
            'be.visible',
        );
    });

    //search, select and open a batch
    it('should search and select batch', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchBatch');

        cy.get('[data-cy="toolbar-input-text"]').click();

        cy.get('[data-cy="toolbar-input-text"]').type('FBS-9103');

        cy.wait('@searchBatch');

        cy.contains('FBS-9103', { timeout: 5000 }).should('be.visible');

        cy.get('[data-cy="settings-row-div-4"]').click();

        //check the display of batch info page
        cy.get('[data-cy="batch-detail-layout-div-1"]').should('be.visible');

        cy.get('[data-cy="batch-detail-layout-span-7"]')
            .should('be.visible')
            .and('have.text', 'FBS-9103');

        cy.get('[data-cy="status-badge-span-1"]')
            .should('be.visible')
            .and('have.text', 'Active');

        cy.get('[data-cy="batch-detail-layout-p-9"]')
            .should('be.visible')
            .and(
                'have.text',
                'College On-the-Job Training · Information Technology · Face-to-face · Created Jul 27, 2026',
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
            .and('contain.text', 'FBS-9103');

        cy.get('[data-cy="batch-detail-layout-div-39"]')
            .eq(1)
            .should('contain.text', 'Trainees')
            .and('contain.text', '11');

        cy.get('[data-cy="batch-detail-layout-div-39"]')
            .eq(2)
            .should('contain.text', 'Industry')
            .and('contain.text', 'Information Technology');

        cy.get('[data-cy="batch-detail-layout-div-39"]')
            .eq(3)
            .should('contain.text', 'Program type')
            .and('contain.text', 'College On-the-Job Training');

        cy.get('[data-cy="batch-detail-layout-div-25"]').should(
            'contain.text',
            'Registration link',
        );

        cy.get('[data-cy="button-button-1"]').should(
            'contain.text',
            'Copy link',
        );
    });
});
