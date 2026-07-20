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
    it('should display Partner School Page correctly', () => {
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

    //create
    it('should create partner school', () => {
        cy.viewport(1200, 720);

        //esc key
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="use-file-upload-field-input-file"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="record-modal-field-select-change"]').select('Active'); //status

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(0)
            .type('Sample School'); // school name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(1)
            .type('SS'); //abbreviation

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(2)
            .type('Mayeng'); //First name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(3)
            .type('Mendoza'); //Last name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(4)
            .type('torresherlynmae@gmail.com'); //Email

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(0)
            .type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(5)
            .type('https://lss.frontlinebusiness.com.ph/'); // website

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(1)
            .type('Sample Description'); //description

        cy.get('body').type('{esc}'); //esc key

        // cancel btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="use-file-upload-field-input-file"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="record-modal-field-select-change"]').select('Active'); //status

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(0)
            .type('Sample School'); // school name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(1)
            .type('SS'); //abbreviation

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(2)
            .type('Mayeng'); //First name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(3)
            .type('Mendoza'); //Last name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(4)
            .type('torresherlynmae@gmail.com'); //Email

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(0)
            .type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(5)
            .type('https://lss.frontlinebusiness.com.ph/'); // website

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(1)
            .type('Sample Description'); //description

        cy.get('[data-cy="close-button"]').click(); //cancel btn\

        // close btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="use-file-upload-field-input-file"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="record-modal-field-select-change"]').select('Active'); //status

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(0)
            .type('Sample School'); // school name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(1)
            .type('SS'); //abbreviation

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(2)
            .type('Mayeng'); //First name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(3)
            .type('Mendoza'); //Last name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(4)
            .type('torresherlynmae@gmail.com'); //Email

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(0)
            .type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(5)
            .type('https://lss.frontlinebusiness.com.ph/'); // website

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(1)
            .type('Sample Description'); //description

        cy.get('[data-cy="modal-center-button-close"]').click(); //close btn

        // save btn
        cy.get('[data-cy="add-record-button"]').click();

        cy.get('[data-cy="use-file-upload-field-input-file"]').selectFile(
            'cypress/fixtures/FBS-LCSS-LOGO.webp',
            { force: true },
        ); //upload img

        cy.get('[data-cy="record-modal-field-select-change"]').select('Active'); //status

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(0)
            .type('Sample School'); // school name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(1)
            .type('SS'); //abbreviation

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(2)
            .type('Mayeng'); //First name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(3)
            .type('Mendoza'); //Last name

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(4)
            .type('torresherlyn028@gmail.com'); //Email

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(0)
            .type('Dolores Quezon'); //P-Address

        cy.get('[data-cy="record-modal-field-input-field-placeholder"]')
            .eq(5)
            .type('https://lss.frontlinebusiness.com.ph/'); // website

        cy.get('[data-cy="record-modal-field-textarea-field-placeholder"]')
            .eq(1)
            .type('Sample Description'); //description

        cy.intercept('POST', '**/partner-schools').as('createPartnerSchool');

        cy.get('[data-cy="submit-button"]').click(); //save btn

        cy.wait('@createPartnerSchool').then((interception) => {
            console.log(interception.response);
        });

        cy.get('[data-cy="toolbar-input-text"]').type('Sample School');

        cy.contains('Sample School', { timeout: 1000 }).should('be.visible');
    });
});
