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

    //check trainees management display
    it('should check the trainees management display', () => {
        //title
        cy.get('[data-cy="index-h1-trainees"]')
            .should('be.visible')
            .and('contain.text', 'Trainees');
        cy.get('[data-cy="index-p-manage-trainees"]')
            .should('be.visible')
            .and('contain.text', 'Manage Trainees data.');

        //search bar
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible');

        //filter
        cy.get('[data-cy="toolbar-button-button"]')
            .should('be.visible')
            .click();

        //status filter
        cy.get('[data-cy="dropdown-button-button"]')
            .should('be.visible')
            .click();

        cy.get('[data-cy="dropdown-div-4"]')
            .should('contain.text', 'All Status')
            .and('contain.text', 'Active')
            .and('contain.text', 'Archived')
            .and('contain.text', 'Pending')
            .and('contain.text', 'Completed');

        //batch filter
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(0)
            .should('be.visible')
            .click();
        cy.get('[data-cy="use-async-select-field-input-placeholder"]').should(
            'be.visible',
        );
        cy.get('[data-cy="use-async-select-field-div-8"]')
            .should('be.visible')
            .and('contain.text', 'All')
            .and('contain.text', 'FBS-');

        //school name filter
        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .should('be.visible')
            .click();
        cy.get('[data-cy="use-async-select-field-input-placeholder"]').should(
            'be.visible',
        );
        cy.get('[data-cy="use-async-select-field-div-8"]')
            .should('be.visible')
            .and('contain.text', 'All')
            .and('contain.text', 'University')
            .and('contain.text', 'College')
            .and('contain.text', 'Campus');

        //program filter
        cy.get('[data-cy="use-async-multi-select-field-button-button"]')
            .eq(0)
            .should('be.visible')
            .click();
        cy.get('[data-cy="use-async-multi-select-field-input-search"]').should(
            'be.visible',
        );
        cy.get('[data-cy="use-async-multi-select-field-div-8"]')
            .should('be.visible')
            .and('contain.text', 'Select all')
            .and('contain.text', 'Bachelor of Science in Accountancy')
            .and(
                'contain.text',
                'Bachelor of Science in Business Administration',
            )
            .and('contain.text', 'Bachelor of Science in Computer Science')
            .and(
                'contain.text',
                'Bachelor of Science in Information Technology',
            );

        //first name filter
        cy.get('[data-cy="data-input-first_name"]').should('be.visible');

        //last name filter
        cy.get('[data-cy="data-input-last_name"]').should('be.visible');

        //email filter
        cy.get('[data-cy="data-input-email"]').should('be.visible');

        //sort display
        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
        .should('have.length', 10)
        .and('contain.text', 'status')
        .and('contain.text','Batch')
        .and('contain.text', 'School Name')
        .and('contain.text', 'Industry')
        .and('contain.text', 'Level')
        .and('contain.text', 'Program')
        .and('contain.text', 'Program Type')
        .and('contain.text', 'First Name')
        .and('contain.text', 'Last Name')
        .and('contain.text', 'Email');

        //page filter
        cy.filterPerPage();
    });

    //table display
    it('should check if the table display and texts are correct', () => {
        cy.visit('/trainees')

        cy.get('[data-cy="settings-list-header-div-1"]')
        .should('contain.text', 'Full name')
        .and('contain.text', 'Batch')
        .and('contain.text', 'School')
        .and('contain.text', 'Academic program')
        .and('contain.text', 'Email')
        .and('contain.text', 'Required hrs')
        .and('contain.text', 'Status');

        cy.get('[data-cy="settings-row-div-4"]').should('be.visible');
        cy.get('[data-cy="pagination-span-5"]').should('be.visible');
        cy.get('[data-cy="pagination-div-6"]').should('be.visible');
    });

    //search function
    it('should check if the search function is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-input-text"]').type('Margarete');

        cy.get('[data-cy="settings-row-div-4"]')
            .eq(0)
            .should('contain.text', 'Margarete');
    });

    //filter status
    it('should check if the filter status is working', () => {
        cy.visit('/trainees');

        //active
        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="dropdown-button-button"]').click();

        cy.get('[data-cy="dropdown-button-set-selected"]').eq(1).click();

        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'Active',
        );

        //archive
        // cy.get('[data-cy="toolbar-button-button"]').click();

        // cy.get('[data-cy="dropdown-button-button"]').click();

        // cy.get('[data-cy="dropdown-button-set-selected"]').eq(2).click();

        // cy.get('[data-cy="settings-row-div-4"]').should(
        //     'contain.text',
        //     'Inactive',
        // );

        //completed
        cy.get('[data-cy="dropdown-button-button"]').click();

        cy.get('[data-cy="dropdown-button-set-selected"]').eq(4).click();

        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'Completed',
        );
    });

    //filter batch
    it('should check if the filtering of batches is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(0)
            .click();
        cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
            'FBS-8323',
            { timeout: 5000 },
        );
        cy.get('[data-cy="use-async-select-field-div-8"]')
            .contains('FBS-8323')
            .click();

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'FBS-8323',
        );

        //clear
        cy.get('[data-cy="clear-all"]').click();
    });

    //filter school name
    it('should check if the filtering of school name is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="use-async-select-field-button-button"]')
            .eq(1)
            .click();

        cy.get('[data-cy="use-async-select-field-input-placeholder"]').type(
            'De La Salle University - Lipa',
            { timeout: 5000 },
        );

        cy.get('[data-cy="use-async-select-field-div-8"]')
            .contains('De La Salle University - Lipa')
            .click();

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'De La Salle University - Lipa',
        );

        //clear
        cy.get('[data-cy="clear-all"]').click();
    });

    //filter program
    it('should check if the filtering of program is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="use-async-multi-select-field-button-button"]')
            .eq(0)
            .click();

        cy.get('[data-cy="use-async-multi-select-field-input-search"]')
            .clear()
            .type('Accountancy', { timeout: 5000 });

        cy.get('[data-cy="use-async-multi-select-field-button-button-2"]')
            .contains('Accountancy')
            .click();

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'Bachelor of Science in Accountancy',
        );
    });

    //filter first name
    it('should check if the filtering of first name is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="data-input-first_name"]').type('Verni');

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should(
            'contain.text',
            'Verni',
        );
    });

    //filter last name
    it('should check if the filtering of last name is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="data-input-last_name"]').type('Ba');

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should('contain.text', 'Ba');
    });

    //filter email
    it('should check if the filtering of email is working', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="toolbar-button-button"]').click();

        cy.get('[data-cy="data-input-email"]').type('green');

        //verify
        cy.get('[data-cy="settings-row-div-4"]').should('contain.text', 'green');
    });

    //sort status
    it('should check if the sorting of status is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as('sortstatusTrainees');

        // select status sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: status',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortstatusTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortstatusTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');
    });

    //sort batch
    it('should check if the sorting of batches is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as('sortbatchTrainees');

        // select batch sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Batch',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortbatchTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortbatchTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');
    });

    //sort school name
    it('should check if the sorting of school name is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as(
            'sortschoolnameTrainees',
        );

        // select schoolname sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: School Name',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortschoolnameTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortschoolnameTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');
    });

    //sort program
    it('should check if the sorting of program is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as('sortprogramTrainees');

        // select program sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Program',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortprogramTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortprogramTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');
    });

    //sort first name
    it('should check if the sorting of first name is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as('sortfirstnameTrainees');

        // select firstname sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: First Name',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortfirstnameTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortfirstnameTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');

        cy.get('[data-cy="index-span-name"]').first().invoke('text').then((text) => {
        const firstName = text.split('\n')[0].trim();

        expect(firstName).to.match(/^Z/i);
        });
    });

    //sort last name
    it('should check if the sorting of last name is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as('sortlastnameTrainees');

        // select lastname sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Last Name',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortlastnameTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortlastnameTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');

        cy.get('[data-cy="index-span-name"]')
            .first()
            .invoke('text')
            .then((text) => {
                const fullName = text.trim();
                const lastName = fullName.split(' ').pop();

                expect(lastName).to.match(/^[Zz]/);
            });
    });

    //sort email
    it('should check if the sorting of email is working', () => {
        cy.visit('/trainees');

        // intercept sorting request
        cy.intercept('GET', '**/pagination-search*').as('sortemailTrainees');

        // select email sorting
        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Email',
        );

        // verify ascending sorting request was successful
        cy.get('[data-cy="toolbar-arrow-up-15"]').should('be.visible');

        cy.wait('@sortemailTrainees').its('request.url');

        //click descending btn
        cy.get('[data-cy="toolbar-arrow-up-15"]').click();

        // verify descending sorting request was successful
        cy.wait('@sortemailTrainees').its('request.url');

        cy.get('[data-cy="toolbar-arrow-down-16"]').should('be.visible');

        cy.get('[data-cy="settings-row-div-1"]')
            .first()
            .invoke('text')
            .then((text) => {
                const email = text.split('\n')[0].trim();

                expect(email).to.match(/^Z/i);
            });
    });

    //per page 15
    it('should check if the number of records displays correctly when the rows per page changed to 15', () => {
        cy.visit('/trainees');

        cy.intercept('GET', '**/pagination-search*').as('changeRowsPerPage');

        // change rows per page to 15
        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('15');

        // wait for updated records
        cy.wait('@changeRowsPerPage')
            .its('response.statusCode')
            .should('eq', 200);

        // verify that 15 records are displayed
        cy.get('[data-cy="settings-row-div-4"]').should('have.length', 15);
    });

    //per page 25
    it('should check if the number of records displays correctly when the rows per page changed to 25', () => {
        cy.visit('/trainees');

        cy.intercept('GET', '**/pagination-search*').as('changeRowsPerPage');

        // change rows per page to 25
        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('25');

        // wait for updated records
        cy.wait('@changeRowsPerPage')
            .its('response.statusCode')
            .should('eq', 200);

        // verify that 25 records are displayed
        cy.get('[data-cy="settings-row-div-4"]').should('have.length', 25);
    });

    //per page 50
    it('should check if the number of records displays correctly when the rows per page changed to 50', () => {
        cy.visit('/trainees');

        cy.intercept('GET', '**/pagination-search*').as('changeRowsPerPage');

        // change rows per page to 50
        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('50');

        // wait for updated records
        cy.wait('@changeRowsPerPage')
            .its('response.statusCode')
            .should('eq', 200);

        // verify that 50 records are displayed
        cy.get('[data-cy="settings-row-div-4"]').should('have.length', 50);
    });

    //per page 100
    it('should check if the number of records displays correctly when the rows per page changed to 100', () => {
        cy.visit('/trainees');

        cy.intercept('GET', '**/pagination-search*').as('changeRowsPerPage');

        // change rows per page to 100
        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('100');

        // wait for updated records
        cy.wait('@changeRowsPerPage')
            .its('response.statusCode')
            .should('eq', 200);

        // verify that 100 records are displayed
        cy.get('[data-cy="settings-row-div-4"]').should('have.length', 100);
    });

    //archive trainee
    it('should archive a trainee', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="settings-row-div-4"]')
            .eq(0)
            .find('[data-cy="row-menu-more-horizontal-2"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]').eq(0).click();

        //verify archive
        cy.get('[data-cy="toast-div-3"]')
            .should('be.visible')
            .and('contain.text', 'Archived');
    });

    //restore trainee
    it('should restore archived trainee', () => {
        cy.visit('/trainees');

        cy.get('[data-cy="settings-row-div-4"]')
            .eq(0)
            .find('[data-cy="row-menu-more-horizontal-2"]')
            .click();

        cy.get('[data-cy="row-menu-button-4"]').eq(0).click();

        //verify archive
        cy.get('[data-cy="toast-div-3"]')
            .should('be.visible')
            .and('contain.text', 'Restored');
    });

    //delete trainee
    it('should check if delete trainee button is working', () => {
        cy.visit('/trainees');

        //search a trainee
        cy.get('[data-cy="toolbar-input-text"]').type('Matilda', {
            timeout: 5000,
        });

        cy.contains('[data-cy="settings-row-div-4"]', 'Matilda')
            .eq(0)
            .find('[data-cy="row-menu-more-horizontal-2"]')
            .click({ timeout: 5000 });

        cy.get('[data-cy="row-menu-button-4"]').eq(1).click();

        //delete modal
        cy.get('[data-cy="confirm-delete-modal-div-2"]').should('be.visible');

        //cancel
        cy.get('[data-cy="confirm-delete-modal-button-button"]').click();
    });
});
