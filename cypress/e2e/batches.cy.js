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
        cy.visit('/batches')
    }); 

    // afterEach(function () {
    //     if (this.currentTest.state === 'failed') {
    //         cy.screenshot(`Batches/${this.currentTest.title}`, {
    //             capture: 'runner',
    //         });
    //     }
    // });

    //check batches page display
it('should load the Batches Page', () => {

    //elements inside batches page
    cy.get('[data-cy="add-record-button"]').should('be.visible');
    cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    cy.get('[data-cy="toolbar-select-sort-by-change"]').should('be.visible');



    
    //     //filter
    //     cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
        
        cy.get('[data-cy="toolbar-button-button"]').click();
        
        // //program type
        // cy.get('[data-cy="use-async-select-field-button-button"]').eq(0).click();
        // cy.get('[data-cy="use-async-select-field-button-button-2"]')
        //     .should('contain.text','All')
        //     .and('contain.text','Accountancy, Business, and Management (ABM)')
        //     .and('contain.text','Science, Technology, Engineering, and Mathematics (STEM)')
        //     .and('contain.text','Humanities and Social Sciences')
        //     .and('contain.text','Information and Communications Technology (ICT)')
        //     // .and('contain.text','Bachelor of Science in Electronics Engineering')
        //     .and('contain.text','Bachelor of Science in Accountancy')
        //     .and('contain.text','Bachelor of Science in Business Administration')
        //     .and('contain.text','Bachelor of Science in Computer Engineering')
        //     .and('contain.text','Bachelor of Science in Computer Science')
        //     .and('contain.text','Bachelor of Science in Information Technology')
        //     .and('contain.text','Bachelor of Science in Psychology');

        // cy.screenshot('bachelor-of-science-in-electronics-engineering');
            
        // //industry
        // cy.get('[data-cy="use-async-select-field-button-button"]').eq(1).click();
        // cy.get('[data-cy="use-async-select-field-button-button-2"]')
        //     .should('contain.text','All')
        //     .and('contain.text','Accounting (ACCT)')
        //     .and('contain.text','Administration and Management (MGMT)')
        //     .and('contain.text','Information and Communication Technologies (ICT)');

        // //level
        // cy.get('[data-cy="use-async-select-field-button-button"]').eq(2).click();
        // cy.get('[data-cy="use-async-select-field-button-button-2"]')
        //     .should('contain.text','All')
        //     .and('contain.text','Grade 12')
        //     .and('contain.text','Continuing Studies')
        //     .and('contain.text','Fourth Year')
        //     .and('contain.text','Others');

        // //setup
        //  cy.get('[data-cy="use-async-select-field-button-button"]').eq(3).click();
        //  cy.get('[data-cy="use-async-select-field-button-button-2"]')
        //     .should('contain.text','All')
        //     .and('contain.text','Face to Face (F2F)')
        //     .and('contain.text','Online');
        
        // //status
        // cy.get('[data-cy="use-async-select-field-button-button"]').eq(4).click();
        //  cy.get('[data-cy="use-async-select-field-button-button-2"]')
        //     .should('contain.text','All')
        //     .and('contain.text','Active')
        //     .and('contain.text','Inactive')
        //     .and('contain.text','Completed')
        //     .and('contain.text','Terminated');
        
    cy.get('[data-cy="toolbar-button-button"]').click();
            
        
    //sort
    // cy.get('[data-cy="toolbar-select-sort-by-change"] option')
    //     .should('have.length', 4)
    //     .and('contain.text', 'Batch Code')
    //     .and('contain.text', 'Date Started')
    //     .and('contain.text', 'Projected End')
    //     .and('contain.text', 'Created')

    // //page filter
    // cy.filterPerPage();

    //table
    // cy.get('[data-cy="settings-list-header-div-1"]')
    //     .should('contain.text', 'Batch Code')
    //     .and('contain.text', 'Program')
    //     .and('contain.text', 'Industry')
    //     .and('contain.text', 'Setup')
    //     .and('contain.text', 'Trainees')

    // cy.get('[data-cy="settings-row-div-4"]').first().click();

    // cy.get('[data-cy="batch-detail-layout-link-batches"]').click();


    // // Verify initially disabled
    // cy.get('[data-cy="switch-button-aria-label"]')
    //     .should('have.attr', 'aria-checked', 'false');

    //     // Enable the switch
    //     cy.get('[data-cy="switch-button-aria-label"]').click();

    //     // Verify enabled
    //     cy.get('[data-cy="switch-button-aria-label"]')
    //         .should('have.attr', 'aria-checked', 'true');

    //     // Disable the switch again
    //     cy.get('[data-cy="switch-button-aria-label"]').click();

    //     // Verify disabled
    //     cy.get('[data-cy="switch-button-aria-label"]')
    //         .should('have.attr', 'aria-checked', 'false');

    //actions
    // cy.get('[data-cy="row-menu-button-row-actions"]').click();

    // cy.get('[data-cy="row-menu-div-3"]').eq(0)
    //     .should('contain.text', 'Edit');

    // cy.get('[data-cy="row-menu-button-4"]').eq(1)
    //     .should('contain.text', 'Registration QR');
    
    // cy.get('[data-cy="row-menu-button-4"]').eq(2)
    //     .should('contain.text', 'Copy link');
    
    // cy.get('[data-cy="row-menu-button-4"]').eq(3)
    //     .should('contain.text', 'Archive');

    // cy.get('[data-cy="row-menu-button-4"]').eq(4)
    //     .should('contain.text', 'Terminate');  

    // cy.get('[data-cy="row-menu-button-row-actions"]').click();


});

//add batch
it('should add a new batch', () => {

// //esc key
// cy.get('[data-cy="add-record-button"]').click();

// cy.get('body').type('{esc}'); //esc key

//cancel btn
// cy.get('[data-cy="add-record-button"]').click();

// cy.get('[data-cy="use-async-select-field-button-button"]')
//     .eq(0)
//     .click();

// //type/search option
// cy.get('[data-cy="use-async-select-field-input-placeholder"]')
//   .type('Bachelor of Science in Business Administration');

// //select result
// cy.contains('Bachelor of Science in Business Administration')
//    .click();

// cy.get('[data-cy="use-async-select-field-button-button"]')
//     .eq(1)
//     .click();

// cy.contains('Information Technology (IT)')
//    .click();

// cy.get('[data-cy="use-async-select-field-button-button"]')
//     .eq(2)
//     .click();

// cy.contains('Fourth Year')
//    .click();
  
// cy.get('[data-cy="create-batch-modal-button-button"]').click(); //cancel btn\


// //close btn
// cy.get('[data-cy="add-record-button"]').click();

// cy.get('[data-cy="modal-button-close-dialog"]').click(); //close btn

//save btn complete details
cy.get('[data-cy="add-record-button"]').click();

cy.get('[data-cy="use-async-select-field-button-button"]')
    .eq(0)
    .click();

//type/search option
// cy.get('[data-cy="use-async-select-field-input-placeholder"]')
//   .type('Bachelor of Science in Business Administration');

//select result
cy.contains('Accountancy, Business, and Management (ABM)')
   .click();

cy.get('[data-cy="use-async-select-field-button-button"]')
    .eq(1)
    .click();

cy.contains('Information Technology (IT)')
   .click();

cy.get('[data-cy="use-async-select-field-button-button"]')
    .eq(2)
    .click();

cy.contains('Fourth Year')
   .click();

cy.get('[data-cy="create-batch-modal-input-date"]')
    .type('07/27/2026');

cy.get('[data-cy="create-batch-modal-input-projected-end-date"]')
    .type('08/28/2026');

cy.get('[data-cy="create-batch-modal-input-checkbox"]')
  .check()
  .should('be.checked');

// cy.get('[data-cy="create-batch-modal-button-submit"]').click();



})

});

