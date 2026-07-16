describe('Batches Module', () => {
    beforeEach(() => {
        cy.session('admin', () => {
            cy.login(); //login in system
        });
        cy.visit('/batches')
    }); 
    //check batches page display
it('should load the Batches Page', () => {

    //elements inside batches page
    cy.get('[data-cy="add-record-button"]').should('be.visible');
    cy.get('[data-cy="toolbar-input-text"]').should('be.visible');
    
        //filter
        cy.get('[data-cy="toolbar-button-button"]').should('be.visible');
        
        cy.get('[data-cy="toolbar-button-button"]').click();
        
        //program type
        cy.get('[data-cy="use-async-select-field-div-1"]')
            .should('contain.text',"All")
        
        cy.get('[data-cy="use-async-select-field-button-button"]').eq(0).click();
        cy.get('[data-cy="use-async-select-field-div-1"]')
            
        
        
        
        
    
});

});

