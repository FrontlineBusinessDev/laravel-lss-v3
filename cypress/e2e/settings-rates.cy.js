describe('Settings - Rates', () => {
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
        cy.visit('/settings/rates');
    });

    //check rates display
    // it('should display rates page correctly', () => {
    //     cy.verifySettingsModuleHeader();

    //     cy.get('[data-cy="rates-title"]')
    //         .should('be.visible')
    //         .and('have.text', 'Default hourly rates');

    //     cy.get('[data-cy="rates-description"]')
    //         .should('be.visible')
    //         .and(
    //             'contain.text',
    //             'Base rate per training hour, inherited by trainees',
    //         );

    //     cy.get('[data-cy="form-field-label-1"]')
    //         .eq(0)
    //         .should('contain.text', 'Face-to-Face rate');
    //     cy.get('[data-cy="form-field-label-1"]')
    //         .eq(1)
    //         .should('contain.text', 'Online rate');

    //     cy.get('[data-cy="form-field-input-5"]').eq(0).should('be.visible');
    //     cy.get('[data-cy="form-field-input-5"]').eq(1).should('be.visible');

    //     cy.get('[data-cy="button-button-1"]').should('be.visible');
    // });

    //update the rate f2f or online
    it('should update the rate', () => {
        cy.intercept('POST', '**settings-rates/**').as('updateRates');

        cy.get('[data-cy="form-field-input-5"]').eq(0).clear().type('20');
        cy.get('[data-cy="form-field-input-5"]').eq(1).clear().type('27');
    });
});
