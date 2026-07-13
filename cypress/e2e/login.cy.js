describe('Login Page', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    //check log in display
    it('should display login page correctly', () => {
        cy.get('[data-cy="logo-div-2"]').should('be.visible');
        cy.contains('Log in to your account').should('be.visible');
        cy.contains('Enter your credentials to continue.').should('be.visible');

        cy.get('input[data-cy="login-input-email"]').should('exist');
        cy.get('input[data-cy="login-input-enter-your-password"]').should(
            'exist',
        );
        cy.get('[data-cy="router-compat-inertia-link-to"]').should('exist');
        cy.get('[data-cy="button-button-1"]').should('exist');

        cy.contains(
            'Your role and dashboard are detected automatically after login.',
        ).should('be.visible');
    });

    // check input fields
    it('should allow users to input their email and password, with a Show/Hide button', () => {
        cy.get('input[data-cy="login-input-email"]')
            .type('admin.test@gmail.com')
            .should('have.value', 'admin.test@gmail.com');

        cy.get('input[data-cy="login-input-enter-your-password"]')
            .type('Admintest123*')
            .should('have.value', 'Admintest123*');

        cy.get('[data-cy="login-eye-16"]').click();
        cy.get('[data-cy="login-eye-off-15"]').click();
    });

    // check invalid credentials
    it('should display an error message when the user enters invalid credentials', () => {
        cy.get('input[data-cy="login-input-email"]')
            .type('herlyn.torres@frontlinebusiness.com.ph')
            .should('have.value', 'herlyn.torres@frontlinebusiness.com.ph');

        cy.get('input[data-cy="login-input-enter-your-password"]').type(
            'Herlyntest123*',
        );
        cy.get('[data-cy="login-eye-16"]').click();
        cy.get('[data-cy="login-eye-off-15"]').click();
        cy.get('[data-cy="button-button-1"]').click();
    });

    //check forgot password modal display
    it('should redirect the user to the forgot password page when clicking the forgot password link', () => {
        cy.get('[data-cy="router-compat-inertia-link-to"]').click();
        cy.get('[data-cy="forgot-password-div-3"]').should('exist');
        cy.get('[data-cy="forgot-password-h1-forgot-your-password"]').should(
            'be.visible',
        );
        cy.get(
            '[data-cy="forgot-password-p-enter-the-email-linked-to-your"]',
        ).should('be.visible');
        cy.get('input[data-cy="forgot-password-input-email"]').should('exist');
        cy.get('[data-cy="button-button-1"]').should('exist');
        cy.get('[data-cy="router-compat-inertia-link-to"]').should('exist');
    });

    //check forgot password without inputing email
    it('should display a validation message when submitting forgot password without an email', () => {
        cy.get('[data-cy="router-compat-inertia-link-to"]').click(); // click forgot password
        cy.get('[data-cy="button-button-1"]').click();
        cy.get('[data-cy="router-compat-inertia-link-to"]').click(); // click back to login
    });

    //check forgot password inputing unregistered email
    it('should display a validation message when submitting forgot password without an email', () => {
        cy.get('[data-cy="router-compat-inertia-link-to"]').click(); // click forgot password
        cy.get('input[data-cy="forgot-password-input-email"]')
            .type('herlyn.torres@frontlinebusiness.com.ph')
            .should('have.value', 'herlyn.torres@frontlinebusiness.com.ph');
        cy.get('[data-cy="button-button-1"]').click();
    });

    //check forgot password inputing registered email
    it('should allow the user to request a password reset', () => {
        cy.get('[data-cy="router-compat-inertia-link-to"]').click(); // click forgot password
        cy.get('input[data-cy="forgot-password-input-email"]')
            .type('vincent.ramirez@frontlinebusiness.com.ph')
            .should('have.value', 'vincent.ramirez@frontlinebusiness.com.ph');
        cy.get('[data-cy="button-button-1"]').click();
    });

    //check login page with valid credentials
    
});
