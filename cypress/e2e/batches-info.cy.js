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

    //search, select and open a batch
    it('should search and select batch', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchBatch');

        cy.get('[data-cy="toolbar-input-text"]').click();

        cy.get('[data-cy="toolbar-input-text"]').type('FBS-8323');

        cy.wait('@searchBatch');

        cy.contains('FBS-8323', { timeout: 5000 }).should('be.visible');

        cy.get('[data-cy="settings-row-div-4"]').click();

        //check the display of batch info page
        cy.get('[data-cy="batch-detail-layout-div-1"]').should('be.visible');

        cy.get('[data-cy="batch-detail-layout-span-7"]')
            .should('be.visible')
            .and('have.text', 'FBS-8323');

        cy.get('[data-cy="status-badge-span-1"]')
            .should('be.visible')
            .and('have.text', 'Active');

        cy.get('[data-cy="batch-detail-layout-p-9"]')
            .should('be.visible')
            .and(
                'have.text',
                'Continuing Studies · Information Technology · Online · Created Aug 10, 2026',
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
            .should('contain.text', 'Trainees')
            .and('contain.text', '12');

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

        cy.get('[data-cy="button-button-1"]').should(
            'contain.text',
            'Copy link',
        );

        //tabs
        cy.get('[data-cy="batch-detail-layout-link-t-href"]')
            .eq(0)
            .should('contain.text', 'Trainees');

        cy.get('[data-cy="batch-detail-layout-link-t-href"]')
            .eq(1)
            .should('contain.text', 'Activity log');

        cy.get('[data-cy="batch-detail-layout-link-t-href"]')
            .eq(2)
            .should('contain.text', 'Financials');

        cy.get('[data-cy="batch-detail-layout-link-t-href"]')
            .eq(3)
            .should('contain.text', 'Trainers');
    });

    // //edit button
    // it('should check if edit button is working', () => {
    //     cy.visit('/batches/8');

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
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="button-button-1"]').eq(1).click();

    //     //verify archive
    //     cy.get('[data-cy="toast-div-3"]')
    //         .should('contain.text', 'Batch archived')
    //         .and('be.visible');
    // });

    // //restore
    // it('should check if the restore button is working', () => {
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="button-button-1"]').eq(1).click();

    //     //verify restore
    //     cy.get('[data-cy="toast-div-3"]')
    //         .should('contain.text', 'Batch restored')
    //         .and('be.visible');
    // });

    // //terminate
    // it('should check if the terminate button is working', () => {
    //     cy.visit('/batches/8');

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

    // copy link
    it('should check if the copy link button is working', () => {
        cy.visit('/batches/8');

        cy.get('[data-cy="button-button-1"]').eq(4).click();

        //verify copy link
        cy.get('[data-cy="toast-div-2"]')
            .should('contain.text', 'Registration link copied')
            .and('be.visible');
    });

    // //trainees tab
    // it('should check the display of trainees tab', () => {
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="toolbar-select-rows-per-page"]').should('be.visible');
    // });

    // //trainees tab search
    // it ('should check if the search function is working', () => {
    //     cy.visit('/batches/8');

    //     //search
    //     cy.get('[data-cy="toolbar-input-text"]').click().type('Ludwig');

    //     //verify search
    //     cy.get('[data-cy="trainees-div-2"]')
    //         .should('contain.text', 'Ludwig')
    //         .and('be.visible');

    //     //clear search
    //     cy.get('[data-cy="toolbar-input-text"]').clear();
    // });

    // //trainees tab filter (di pa tapos)
    // it('should check if the filter function is working', () => {
    //     cy.visit('/batches/8');

    //     //filter
    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     //filter status
    //     cy.get('[data-cy="dropdown-button-button"]').click();

    //     cy.get('[data-cy="dropdown-div-4"]')
    //         .should('contain.text', 'All Status')
    //         .and('contain.text', 'Active')
    //         .and('contain.text', 'Terminated')
    //         .and('contain.text', 'Archived');

    //     //select a status
    //     cy.get('[data-cy="dropdown-button-set-selected"]').eq(1).click();

    //     //verify status
    //     cy.get('[data-cy="trainees-div-2"]')
    //         .should('contain.text', 'Active')
    //         .and('be.visible');

    //     //select all
    //     cy.get('[data-cy="dropdown-button-button"]').click();

    //     cy.get('[data-cy="dropdown-button-set-selected"]').eq(0).click();

    //     //first name filter
    //     cy.get('[data-cy="data-input-first_name"]').click().type('Kari');

    //     //verify first name filter
    //     cy.get('[data-cy="trainees-div-2"]')
    //         .should('contain.text', 'Kari')
    //         .and('be.visible');

    //     //clear first name filter
    //     cy.get('[data-cy="data-input-first_name"]').clear();
    // });

    // //trainees tab sort
    // it('should check if the sort function is complete', () => {
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //         .should('have.length', 4)
    //         .and('contain.text', 'Status')
    //         .and('contain.text', 'First Name')
    //         .and('contain.text', 'Last Name')
    //         .and('contain.text', 'Required hrs');
    // });

    // //trainees tab sort - status
    // it('should check if the sorting of status is working', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'sortStatusTrainees',
    //     );

    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]')
    //         .contains('Status')
    //         .should('exist');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: Status',
    //     );

    //     cy.wait('@sortStatusTrainees').its('response.statusCode').should('eq', 200);
    // });

    // //trainees tab sort - first name
    // it('should check if the sorting of first name is working', () => {
    //     cy.intercept('GET', '**/pagination-search*').as('sortFirstNameTrainees');

    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]')
    //         .contains('First Name')
    //         .should('exist');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: First Name',
    //     );

    //     cy.wait('@sortFirstNameTrainees')
    //         .its('response.statusCode')
    //         .should('eq', 200);
    // });

    // //trainees tab sort - last name
    // it('should check if the sorting of last name is working', () => {
    //     cy.intercept('GET', '**/pagination-search*').as(
    //         'sortLastNameTrainees',
    //     );

    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]')
    //         .contains('Last Name')
    //         .should('exist');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: Last Name',
    //     );

    //     cy.wait('@sortLastNameTrainees')
    //         .its('response.statusCode')
    //         .should('eq', 200);
    // });

    // //trainees tab sort - required hrs
    // it('should check if the sorting of required hrs is working', () => {
    //     cy.intercept('GET', '**/pagination-search*').as('sortRequiredhrsTrainees');

    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]')
    //         .contains('Required hrs')
    //         .should('exist');

    //     cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
    //         'Sort: Required hrs',
    //     );

    //     cy.wait('@sortRequiredhrsTrainees')
    //         .its('response.statusCode')
    //         .should('eq', 200);
    // });

    // //trainees tab page
    // it('should check if the page filter is working', () => {
    //     cy.visit('/batches/8');

    //     cy.filterPerPage();
    // });

    // //trainee table display
    // it('should check if the trainees tab table displays properly', () => {
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //         .should('contain.text', 'Trainee')
    //         .and('contain.text', 'School')
    //         .and('contain.text', 'Required hrs')
    //         .and('contain.text', 'Status');

    //     cy.get('[data-cy="trainees-div-2"]').should('be.visible');
    //     cy.get('[data-cy="pagination-span-5"]').should('be.visible');
    //     cy.get('[data-cy="pagination-div-6"]').should('be.visible');
    // });

    // //trainee action button
    // it('should check if the trainee action button is visible and working', () => {
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="trainees-div-2"]')
    //         .eq(0)
    //         .find('[data-cy="row-menu-more-horizontal-2"]')
    //         .click();

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(0)
    //         .should('be.visible')
    //         .and('contain.text', 'Transfer');

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(1)
    //         .should('be.visible')
    //         .and('contain.text', 'Terminate');

    //     cy.get('[data-cy="row-menu-button-4"]')
    //         .eq(2)
    //         .should('be.visible')
    //         .and('contain.text', 'Archive');
    // });

    //transfer button
    it('should check if the transfer button is working', () => {
        cy.visit('/batches/8');

        cy.get('[data-cy="trainees-div-2"]')
            .eq(0)
            .find('[data-cy="row-menu-more-horizontal-2"]')
            .click();

        cy.get('[data-cy="row-menu-button-row-actions"]')
            .eq(0)
            .should('be.visible')
            .and('contain.text', 'Transfer')
            .click();

        cy.get('[data-cy="transfer-trainee-modal"]').should('be.visible');

        //esc btn
        cy.get('body').type('{esc}');

        //exit btn
        cy.get('[data-cy="row-menu-button-row-actions"]')
            .eq(0)
            .should('be.visible')
            .and('contain.text', 'Transfer')
            .click();

        cy.get('[data-cy="modal-x-6"]').click();

        //cancel btn
        cy.get('[data-cy="row-menu-button-row-actions"]')
            .eq(0)
            .should('be.visible')
            .and('contain.text', 'Transfer')
            .click();

        cy.get('[data-cy="transfer-trainee-modal"]').should('be.visible');

        cy.get('[data-cy="transfer-trainee-modal-cancel-button"]').click();
        
    });

    // //trainers tab
    // it('should check the display of trainers tab', () => {
    //     cy.visit('/batches/8');

    //     cy.get('[data-cy="batch-detail-layout-link-t-href"]').eq(1).click();
    // });
});
