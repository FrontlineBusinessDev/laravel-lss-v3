describe('Settings - Users - Users Tab Page', () => {
    beforeEach(() => {
        cy.session('admin', () => {
            cy.login();
        });

        cy.visit('/settings/users');
    });

    // Check Users tab page display
    it('should display the Users tab page correctly', () => {

        cy.get('[data-cy="settings-primary-layout-h1-settings"]')
            .should('be.visible')
            .and('have.text', 'Settings');

        cy.get(
            '[data-cy="settings-primary-layout-p-manage-user-accounts-partner-schools-and"]',
        )
            .should('be.visible')
            .and(
                'have.text',
                'Manage user accounts, partner schools, and academic reference data',
            );
    });
});
