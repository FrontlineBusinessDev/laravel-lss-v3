describe('Batches Module', () => {
    beforeEach(() => {
        cy.session('admin', () => {
            cy.login(); //login in system
        });
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
    // cy.get('[data-cy="add-record-button"]').should('be.visible');
    // cy.get('[data-cy="toolbar-input-text"]').should('be.visible');



    
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

        //setup
         cy.get('[data-cy="use-async-select-field-button-button"]').eq(3).click();
         cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .should('contain.text','All')
            .and('contain.text','Face to Face (F2F)')
            .and('contain.text','Online');
        
        //status
        cy.get('[data-cy="use-async-select-field-button-button"]').eq(4).click();
         cy.get('[data-cy="use-async-select-field-button-button-2"]')
            .should('contain.text','All')
            .and('contain.text','Active')
            .and('contain.text','Inactive')
            .and('contain.text','Completed')
            .and('contain.text','Terminated');
        
            
        
        
        
    
});

});

