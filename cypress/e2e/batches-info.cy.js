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

    // //check batches page display
    // it('should load the Batches Page', () => {
    //     //elements inside batches page
    //     cy.get('[data-cy="add-record-button"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
    //         'be.visible',
    //     );
    // });

    // //search, select and open a batch
    // it('should search and select batch', () => {
    //     cy.intercept('GET', '**/pagination-search*').as('searchBatch');

    //     cy.get('[data-cy="toolbar-input-text"]').click();

    //     cy.get('[data-cy="toolbar-input-text"]').type('FBS-6541');

    //     cy.wait('@searchBatch');

    //     cy.contains('FBS-6541', { timeout: 5000 }).should('be.visible');

    //     cy.get('[data-cy="settings-row-div-4"]').click();

    //     //check the display of batch info page
    //     cy.get('[data-cy="batch-detail-layout-div-1"]').should('be.visible');

    //     cy.get('[data-cy="batch-detail-layout-span-7"]')
    //         .should('be.visible')
    //         .and('have.text', 'FBS-6541');

    //     cy.get('[data-cy="status-badge-span-1"]')
    //         .should('be.visible')
    //         .and('have.text', 'Active');

    //     cy.get('[data-cy="batch-detail-layout-p-9"]')
    //         .should('be.visible')
    //         .and(
    //             'have.text',
    //             'Continuing Studies · Information Technology · Face-to-face · Created Aug 4, 2026',
    //         );

    //     cy.get('[data-cy="button-button-1"]')
    //         .eq(0)
    //         .should('be.visible')
    //         .and('have.text', 'Edit');

    //     cy.get('[data-cy="button-button-1"]')
    //         .eq(1)
    //         .should('be.visible')
    //         .and('have.text', 'Archive');

    //     cy.get('[data-cy="button-button-1"]')
    //         .eq(2)
    //         .should('be.visible')
    //         .and('have.text', 'Terminate');

    //     cy.get('[data-cy="batch-detail-layout-div-39"]')
    //         .eq(0)
    //         .should('contain.text', 'Batch number')
    //         .and('contain.text', 'FBS-6541');

    //     cy.get('[data-cy="batch-detail-layout-div-39"]')
    //         .eq(1)
    //         .should('contain.text', 'Trainees')
    //         .and('contain.text', '12');

    //     cy.get('[data-cy="batch-detail-layout-div-39"]')
    //         .eq(2)
    //         .should('contain.text', 'Industry')
    //         .and('contain.text', 'Information Technology');

    //     cy.get('[data-cy="batch-detail-layout-div-39"]')
    //         .eq(3)
    //         .should('contain.text', 'Program type')
    //         .and('contain.text', 'Continuing Studies');

    //     cy.get('[data-cy="batch-detail-layout-div-25"]').should(
    //         'contain.text',
    //         'Registration link',
    //     );

    //     cy.get('[data-cy="button-button-1"]').should(
    //         'contain.text',
    //         'Copy link',
    //     );

    //     //tabs
    //     cy.get('[data-cy="batch-detail-layout-link-t-href"]')
    //         .eq(0)
    //         .should('contain.text', 'Trainees');

    //     cy.get('[data-cy="batch-detail-layout-link-t-href"]')
    //         .eq(1)
    //         .should('contain.text', 'Activity log');

    //     cy.get('[data-cy="batch-detail-layout-link-t-href"]')
    //         .eq(2)
    //         .should('contain.text', 'Financials');

    //     cy.get('[data-cy="batch-detail-layout-link-t-href"]')
    //         .eq(3)
    //         .should('contain.text', 'Trainers');
    // });

    //edit button
    // it('should check if edit button is working', () => {
    //     cy.visit('/batches/6');

    //     //edit button
    //     cy.get('[data-cy="button-button-1"]').eq(0).click();

    //     //verify edit modal
    //     cy.get('[data-cy="create-batch-modal-modal-close"]').should(
    //         'be.visible',
    //     );

    //     //close button
    //     cy.get('[data-cy="modal-button-close-dialog"]').click();

    //     //edit button
    //     cy.get('[data-cy="button-button-1"]').eq(0).click();

    //     //verify edit modal
    //     cy.get('[data-cy="create-batch-modal-modal-close"]').should(
    //         'be.visible',
    //     );

    //     //esc key
    //     cy.get('body').type('{esc}');

    //     //edit button
    //     cy.get('[data-cy="button-button-1"]').eq(0).click();

    //     //verify edit modal
    //     cy.get('[data-cy="create-batch-modal-modal-close"]').should(
    //         'be.visible',
    //     );

    //     //cancel button
    //     cy.get('[data-cy="create-batch-modal-button-button"]').click();
    // });

    // //archive
    // it('should check if archive button is working', () => {
    //     cy.visit('/batches/6');

    //     cy.get('[data-cy="button-button-1"]').eq(1).click();

    //     //verify archive
    //     cy.get('[data-cy="toast-div-3"]')
    //         .should('contain.text', 'Batch archived')
    //         .and('be.visible');
    // });

    // //restore
    // it('should check if the restore button is working', () => {
    //     cy.visit('/batches/6');

    //     cy.get('[data-cy="button-button-1"]').eq(1).click();

    //     //verify restore
    //     cy.get('[data-cy="toast-div-3"]')
    //         .should('contain.text', 'Batch restored')
    //         .and('be.visible');
    // });

    // //terminate
    // it('should check if the terminate button is working', () => {
    //     cy.visit('/batches/6');

    //     cy.get('[data-cy="button-button-1"]').eq(2).click();

    //     //verify terminate modal
    //     cy.get('[data-cy="batch-detail-layout-modal-35"]').should('be.visible');

    //     //close terminate modal
    //     cy.get('[data-cy="modal-button-close-dialog"]').click();

    //     cy.get('[data-cy="button-button-1"]').eq(2).click();

    //     //verify terminate modal
    //     cy.get('[data-cy="batch-detail-layout-modal-35"]').should('be.visible');

    //     //cancel terminate modal
    //     cy.get('[data-cy="batch-detail-layout-button-button"]').click();

    //     cy.get('[data-cy="button-button-1"]').eq(2).click();

    //     //verify terminate modal
    //     cy.get('[data-cy="batch-detail-layout-modal-35"]').should('be.visible');

    //     //esc
    //     cy.get('body').type('{esc}');
    // });

    // // copy link
    // it('should check if the copy link button is working', () => {
    //     cy.visit('/batches/6');

    //     cy.get('[data-cy="button-button-1"]').eq(3).click();

    //     //verify copy link
    //     cy.get('[data-cy="toast-p-5"]')
    //         .should('contain.text', 'Registration link copied')
    //         .and('be.visible');
    // });

    //trainees tab
    it('should check the display and function of trainees tab', () => {
        cy.visit('/batches/6');

        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
        cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
        cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
            'be.visible',
        );
        cy.get('[data-cy="toolbar-select-rows-per-page"]').should('be.visible');

        //search
        cy.get('[data-cy="toolbar-input-text"]').click().type('Casandra');
    });
});
