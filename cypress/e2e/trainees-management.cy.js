const { Cylinder } = require('lucide-react');

describe('Trainees Module', () => {
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
        cy.visit('/trainees');
    });

    // //check trainees management display
    // it('should check the trainees management display', () => {
    //     //title
    //     cy.get('[data-cy="index-h1-trainees"]')
    //         .should('be.visible')
    //         .and('contain.text', 'Trainees');
    //     cy.get('[data-cy="index-p-manage-trainees"]')
    //         .should('be.visible')
    //         .and('contain.text', 'Manage Trainees data.');

    //     //search bar
    //     cy.get('[data-cy="toolbar-input-text"]').should('be.visible');

    //     //filter
    //     cy.get('[data-cy="toolbar-button-button"]')
    //         .should('be.visible')
    //         .click();

    //     //status filter
    //     cy.get('[data-cy="dropdown-button-button"]')
    //         .should('be.visible')
    //         .click();

    //     cy.get('[data-cy="dropdown-div-4"]')
    //         .should('contain.text', 'active')
    //         .and('contain.text', 'inactive')
    //         .and('contain.text', 'pending')
    //         .and('contain.text', 'ongoing')
    //         .and('contain.text', 'completed');

    //     //batch filter
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(0)
    //         .should('be.visible')
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-input-placeholder"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="use-async-select-field-div-8"]')
    //         .should('be.visible')
    //         .and('contain.text', 'All')
    //         .and('contain.text', 'FBS-');

    //     //school name filter
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(1)
    //         .should('be.visible')
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-input-placeholder"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="use-async-select-field-div-8"]')
    //         .should('be.visible')
    //         .and('contain.text', 'All')
    //         .and('contain.text', 'University')
    //         .and('contain.text', 'College')
    //         .and('contain.text', 'Campus');

    //     //industry filter
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(2)
    //         .should('be.visible')
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-input-placeholder"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="use-async-select-field-div-8"]')
    //         .should('be.visible')
    //         .and('contain.text', 'All')
    //         .and('contain.text', 'Accounting')
    //         .and('contain.text', 'Information Technology');

    //     //level filter
    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(3)
    //         .should('be.visible')
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-input-placeholder"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="use-async-select-field-div-8"]')
    //         .should('be.visible')
    //         .and('contain.text', 'All')
    //         .and('contain.text', 'Continuing Studies')
    //         .and('contain.text', 'Fourth Year')
    //         .and('contain.text', 'Grade 12')
    //         .and('contain.text', 'Others');

    //     //program filter
    //     cy.get('[data-cy="use-async-multi-select-field-button-button"]')
    //         .eq(0)
    //         .should('be.visible')
    //         .click();
    //     cy.get('[data-cy="use-async-multi-select-field-input-search"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="use-async-multi-select-field-div-8"]')
    //         .should('be.visible')
    //         .and('contain.text', 'Select all')
    //         .and('contain.text', 'Bachelor of Science in Accountancy')
    //         .and(
    //             'contain.text',
    //             'Bachelor of Science in Business Administration',
    //         )
    //         .and('contain.text', 'Bachelor of Science in Computer Science')
    //         .and(
    //             'contain.text',
    //             'Bachelor of Science in Information Technology',
    //         );

    //     //program type filter
    //     cy.get('[data-cy="use-async-multi-select-field-button-button"]')
    //         .eq(1)
    //         .should('be.visible')
    //         .click();
    //     cy.get('[data-cy="use-async-multi-select-field-input-search"]').should(
    //         'be.visible',
    //     );
    //     cy.get('[data-cy="use-async-multi-select-field-div-8"]')
    //         .should('be.visible')
    //         .and('contain.text', 'Select all')
    //         .and('contain.text', 'College On-the-Job Training')
    //         .and('contain.text', 'Continuing Studies')
    //         .and('contain.text', 'Senior High School Work Immersion')
    //         .and('contain.text', 'Upskill Training');

    //     //first name filter
    //     cy.get('[data-cy="data-input-first_name"]').should('be.visible');

    //     //last name filter
    //     cy.get('[data-cy="data-input-last_name"]').should('be.visible');

    //     //email filter
    //     cy.get('[data-cy="data-input-email"]').should('be.visible');

    //     //sort display
    //     cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //     .should('have.length', 11)
    //     .and('contain.text', 'Status')
    //     .and('contain.text','Batch')
    //     .and('contain.text', 'School Name')
    //     .and('contain.text', 'Industry')
    //     .and('contain.text', 'Level')
    //     .and('contain.text', 'Program')
    //     .and('contain.text', 'Program Type')
    //     .and('contain.text', 'First Name')
    //     .and('contain.text', 'Last Name')
    //     .and('contain.text', 'Email');

    //     //page filter
    //     cy.filterPerPage();
    // });

    // //table display
    // it('should check if the table display and texts are correct', () => {
    //     cy.visit('/trainees')

    //     cy.get('[data-cy="settings-list-header-div-1"]')
    //     .should('contain.text', 'Full name')
    //     .and('contain.text', 'Batch')
    //     .and('contain.text', 'School')
    //     .and('contain.text', 'Academic program')
    //     .and('contain.text', 'Email')
    //     .and('contain.text', 'Required hrs')
    //     .and('contain.text', 'Status');

    //     cy.get('[data-cy="settings-row-div-4"]').should('be.visible');
    //     cy.get('[data-cy="pagination-span-5"]').should('be.visible');
    //     cy.get('[data-cy="pagination-div-6"]').should('be.visible');
    // });

    // //search function
    // it('should check if the search function is working', () => {
    //     cy.visit('/trainees');

    //     cy.get('[data-cy="toolbar-input-text"]').type('Margarete');

    //     cy.get('[data-cy="settings-row-div-4"]')
    //         .eq(0)
    //         .should('contain.text', 'Margarete');
    // });

    // //filter status
    // it('should check if the filter status is working', () => {
    //     cy.visit('/trainees');

    //     //active
    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     cy.get('[data-cy="dropdown-button-button"]').click();

    //     cy.get('[data-cy="dropdown-button-set-selected"]').eq(1).click();

    //     cy.get('[data-cy="settings-row-div-4"]').should(
    //         'contain.text',
    //         'Active',
    //     );

    //     //archive
    //     // cy.get('[data-cy="toolbar-button-button"]').click();

    //     // cy.get('[data-cy="dropdown-button-button"]').click();

    //     // cy.get('[data-cy="dropdown-button-set-selected"]').eq(2).click();

    //     // cy.get('[data-cy="settings-row-div-4"]').should(
    //     //     'contain.text',
    //     //     'Inactive',
    //     // );

    //     //completed
    //     cy.get('[data-cy="dropdown-button-button"]').click();

    //     cy.get('[data-cy="dropdown-button-set-selected"]').eq(4).click();

    //     cy.get('[data-cy="settings-row-div-4"]').should(
    //         'contain.text',
    //         'Completed',
    //     );
    // });

    // //filter batch
    // it('should check if the filtering of batches is working', () => {
    //     cy.visit('/trainees');

    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(0)
    //         .click();
    //     cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
    //         'FBS-8323',
    //         { timeout: 5000 },
    //     );
    //     cy.get('[data-cy="use-async-select-field-div-8"]')
    //         .contains('FBS-8323')
    //         .click();

    //     //verify
    //     cy.get('[data-cy="settings-row-div-4"]').should(
    //         'contain.text',
    //         'FBS-8323',
    //     );

    //     //clear
    //     cy.get('[data-cy="clear-all"]').click();
    // });

    // //filter school name
    // it('should check if the filtering of school name is working', () => {
    //     cy.visit('/trainees');

    //     cy.get('[data-cy="toolbar-button-button"]').click();

    //     cy.get('[data-cy="use-async-select-field-button-button"]')
    //         .eq(1)
    //         .click();

    //     cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
    //         'De La Salle University - Lipa',
    //         { timeout: 5000 },
    //     );

    //     cy.get('[data-cy="use-async-select-field-div-8"]')
    //         .contains('De La Salle University - Lipa')
    //         .click();

    //     //verify
    //     cy.get('[data-cy="settings-row-div-4"]').should(
    //         'contain.text',
    //         'De La Salle University - Lipa',
    //     );

    //     //clear
    //     cy.get('[data-cy="clear-all"]').click();
    // });

    //filter industry
    it('should check if the filtering of industry is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(2)
            .click();

        cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
            'Accounting',
            { timeout: 5000 },
        );

        cy.get('[data-cy="use-async-select-field-div-8"]')
            .contains('Accounting')
            .click();

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'Accounting',
        );

        //clear
        cy.get('[data-cy="clear-all"]').click();
    });
});
