describe('Settings - Partner School Tab Page', () => {
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

        cy.visit('/settings/partner-schools');
    });

    // check partner school display
    it('should display partner school page correctly', () => {
        cy.viewport(1280, 720);

        //check settings title
        cy.verifySettingsModuleHeader();

        cy.get('[data-cy="add-record-button"]').should('be.visible'); //add btn
        cy.get('[data-cy="toolbar-input-text"]').should('be.visible'); //search btn

        //sort
        cy.get('[data-cy="toolbar-select-sort-by-change"] option')
            .should('have.length', 9)
            .and('contain.text', 'Status')
            .and('contain.text', 'School Name')
            .and('contain.text', 'Abbreviation')
            .and('contain.text', 'Logo')
            .and('contain.text', 'First name')
            .and('contain.text', 'Last name')
            .and('contain.text', 'Email')
            .and('contain.text', 'Address')
            .and('contain.text', 'Joined');

        //pages
        cy.filterPerPage();

        //filter
        cy.get('[data-cy="toolbar-button-button"]').click();

        //status
        cy.get('[data-cy="dropdown-button-button"]').click();

        cy.contains('All Status').should('be.visible');
        cy.contains('Active').should('be.visible');
        cy.contains('Inactive').should('be.visible');

        //filter input fields
        cy.get('[data-cy="data-input-school_name"]').should('be.visible');
        cy.get('[data-cy="data-input-abbreviation"]').should('be.visible');
        cy.get('[data-cy="data-input-contact_first_name"]').should(
            'be.visible',
        );
        cy.get('[data-cy="data-input-contact_last_name"]').should('be.visible');
        cy.get('[data-cy="data-input-contact_email"]').should('be.visible');
        cy.get('[data-cy="data-input-physical_address"]').should('be.visible');

        //table column
        cy.get('[data-cy="settings-list-header-div-1"]')
            .should('contain.text', 'Logo')
            .and('contain.text', 'School Name')
            .and('contain.text', 'Abbreviation')
            .and('contain.text', 'Contact Name')
            .and('contain.text', 'Email')
            .and('contain.text', 'Status');

        //actions
        cy.get('[data-cy="row-menu-button-row-actions"]').first().click();
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('contain.text', 'Edit');

        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('contain.text', 'Archive');
    });

    // search and clear
    it('should search and clear the search input', () => {
        cy.get('[data-cy="toolbar-input-text"]').type('Bicol');
        cy.get('[data-cy="toolbar-x-7"]').click();

        cy.get('[data-cy="toolbar-input-text"]').type('Lipa');
        cy.get('[data-cy="clear-all"]').click();
    });

    // filter
    it('should filter partner schools by status', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="dropdown-button-button"]').click();
        cy.get('[data-cy="dropdown-button-set-selected"]')
            .contains('Active')
            .should('be.visible')
            .first()
            .click();
    });
    it('should filter partner schools by school name', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-school_name"]', { timeout: 1000 }).type(
            'Greenville',
        );
    });
    it('should filter partner schools by abbreviation', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-abbreviation"]', { timeout: 1000 }).type(
            'BSU - Lipa',
        );
    });
    it('should filter partner schools by first name', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-contact_first_name"]', {
            timeout: 1000,
        }).type('Emilio');
    });
    it('should filter partner schools by last name', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-contact_last_name"]', {
            timeout: 1000,
        }).type('Coronado');
    });
    it('should filter partner schools by email', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-contact_email"]', { timeout: 1000 }).type(
            'naborda@nu-laguna.edu.ph',
        );
    });
    it('should filter partner schools by address', () => {
        cy.get('[data-cy="toolbar-button-button"]').click();
        cy.get('[data-cy="data-input-physical_address"]', {
            timeout: 1000,
        }).type('38M6+6VQ, Cosico Ave, San Pablo City, 4000 Laguna');
    });

    //  sorting

    it('should sort partner schools by status', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Status')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Status',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by school name', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('School Name')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: School Name',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by abbreviation', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Abbreviation')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Abbreviation',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by logo', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Logo')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Logo',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by first name', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('First name')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: First name',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by first name', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('First name')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: First name',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by last name', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Last name')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Last name',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by email', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Email')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Email',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by address', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Address')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Address',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });
    it('should sort partner schools by joined', () => {
        cy.intercept('GET', '**/pagination-search*').as('sortPartnerSchools');

        cy.get('[data-cy="toolbar-option-sort"]')
            .contains('Joined')
            .should('exist');

        cy.get('[data-cy="toolbar-select-sort-by-change"]').select(
            'Sort: Joined',
        );

        cy.wait('@sortPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });

    //   // per page
    it('should display correct number of records when changing rows per page', () => {
        cy.intercept('GET', '**/pagination-search*').as('getPartnerSchools');

        cy.get('[data-cy="toolbar-select-rows-per-page"]').select('25');

        cy.wait('@getPartnerSchools')
            .its('response.statusCode')
            .should('eq', 200);
    });

    // create
    it('should create partner school', () => {
        cy.viewport(1200, 720);

        //esc key
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-image"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="input-status"]').select('Active'); //status

        cy.get('[data-cy="input-school-name"]').type('Sample School'); // school name

        cy.get('[data-cy="input-abbreviation"]').type('SS'); //abbreviation

        cy.get('[data-cy="input-contact-first-name"]').type('Mayeng'); //First name

        cy.get('[data-cy="input-contact-last-name"]').type('Mendoza'); //Last name

        cy.get('[data-cy="input-contact-email"]').type(
            'torresherlynmae@gmail.com',
        ); //Email

        cy.get('[data-cy="input-physical-address"]').type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="input-link"]').type(
            'https://lss.frontlinebusiness.com.ph/',
        ); // website

        cy.get('[data-cy="input-description"]').type('Sample Description'); //description

        cy.get('body').type('{esc}'); //esc key

        // cancel btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-image"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="input-status"]').select('Active'); //status

        cy.get('[data-cy="input-school-name"]').type('Sample School'); // school name

        cy.get('[data-cy="input-abbreviation"]').type('SS'); //abbreviation

        cy.get('[data-cy="input-contact-first-name"]').type('Mayeng'); //First name

        cy.get('[data-cy="input-contact-last-name"]').type('Mendoza'); //Last name

        cy.get('[data-cy="input-contact-email"]').type(
            'torresherlynmae@gmail.com',
        ); //Email

        cy.get('[data-cy="input-physical-address"]').type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="input-link"]').type(
            'https://lss.frontlinebusiness.com.ph/',
        ); // website

        cy.get('[data-cy="input-description"]').type('Sample Description'); //description

        cy.get('[data-cy="close-button"]').click(); //cancel btn\

        // close btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-image"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="input-status"]').select('Active'); //status

        cy.get('[data-cy="input-school-name"]').type('Sample School'); // school name

        cy.get('[data-cy="input-abbreviation"]').type('SS'); //abbreviation

        cy.get('[data-cy="input-contact-first-name"]').type('Mayeng'); //First name

        cy.get('[data-cy="input-contact-last-name"]').type('Mendoza'); //Last name

        cy.get('[data-cy="input-contact-email"]').type(
            'torresherlynmae@gmail.com',
        ); //Email

        cy.get('[data-cy="input-physical-address"]').type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="input-link"]').type(
            'https://lss.frontlinebusiness.com.ph/',
        ); // website

        cy.get('[data-cy="input-description"]').type('Sample Description'); //description

        cy.get('[data-cy="modal-center-button-close"]').click(); //close btn

        // save btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="input-image"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="input-status"]').select('Active'); //status

        cy.get('[data-cy="input-school-name"]').type('Sample School'); // school name

        cy.get('[data-cy="input-abbreviation"]').type('SS'); //abbreviation

        cy.get('[data-cy="input-contact-first-name"]').type('Mayeng'); //First name

        cy.get('[data-cy="input-contact-last-name"]').type('Mendoza'); //Last name

        cy.get('[data-cy="input-contact-email"]').type(
            'torresherlyn028@gmail.com',
        ); //Email

        cy.get('[data-cy="input-physical-address"]').type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="input-link"]').type(
            'https://lss.frontlinebusiness.com.ph/',
        ); // website

        cy.get('[data-cy="input-description"]').type('Sample Description'); //description

        cy.intercept('POST', '**/partner-schools').as('createPartnerSchool');

        cy.get('[data-cy="submit-button"]').click(); //save btn

        cy.wait('@createPartnerSchool').then((interception) => {
            console.log(interception.response);
        });

        cy.get('[data-cy="toolbar-input-text"]').type('Sample School');

        cy.contains('Sample School', { timeout: 1000 }).should('be.visible');
    });

    // update
    it('should update partner school', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchPartnerSchools');

        cy.intercept('POST', '**/settings/partner-schools/**').as(
            'updatePartnerSchool',
        );
        // close btn
        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="modal-center-button-close"]').click();

        // cancel btn
        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="close-button"]').click();

        // esc btn
        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('body').type('{esc}'); //esc key

        // cancel btn
        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        cy.get('[data-cy="close-button"]').click();

        // save btn

        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        cy.wait('@searchPartnerSchools');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Edit
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(0)
            .should('be.visible')
            .click();

        // Update First Name
        cy.get('[data-cy="input-contact-first-name"]')
            .clear()
            .type('Herlyn')
            .should('have.value', 'Herlyn');

        // Update Last Name
        cy.get('[data-cy="input-contact-last-name"]')
            .clear()
            .type('Bacay')
            .should('have.value', 'Bacay');

        // Save
        cy.get('[data-cy="submit-button"]').click();

        // Verify update request
        cy.wait('@updatePartnerSchool');

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    // archive
    it('should archive partner school', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchPartnerSchools');
        cy.intercept('GET', '**/settings/partner-schools/**').as(
            'archivePartnerSchool',
        );
        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        cy.wait('@searchPartnerSchools');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Archive
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.wait('@archivePartnerSchool');

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    // restore
    it('should restore partner school', () => {
        cy.intercept('GET', '**/pagination-search*').as('searchPartnerSchools');
        cy.intercept('GET', '**/settings/partner-schools/**').as(
            'restorePartnerSchool',
        );
        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        cy.wait('@searchPartnerSchools');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click restore
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        cy.wait('@restorePartnerSchool');

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
    });

    // delete
    it('should delete partner school', () => {
        // cancel
        cy.intercept('GET', '**/pagination-search*').as('searchPartnerSchools');
        cy.intercept('GET', '**/settings/partner-schools/**').as(
            'archivePartnerSchool',
        );
        cy.intercept('DELETE', '**/settings/partner-schools/**').as(
            'deletePartnerSchool',
        );

        // delete

        // Search Partner School
        cy.get('[data-cy="toolbar-input-text"]').clear().type('Sample School');

        cy.wait('@searchPartnerSchools');

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click Archive
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(1)
            .should('be.visible')
            .click();

        // Open action menu of Sample School
        cy.contains('[data-cy="settings-row-div-4"]', 'Sample School')
            .should('be.visible')
            .parent()
            .find('[data-cy="row-menu-button-row-actions"]')
            .click();

        // Click DELETE
        cy.get('[data-cy="row-menu-button-4"]')
            .eq(2)
            .should('be.visible')
            .click();

        // Click delete confirmation
        cy.get('[data-cy="confirm-delete-modal-button-button-2"]')
            .should('be.visible')
            .click();

        cy.wait('@deletePartnerSchool');

        cy.get('[data-cy="toast-div-3"]').should('be.visible');
        //data-cy="confirm-delete-modal-button-button"
        //data-cy="confirm-delete-modal-button-button-2"
    });
});
