describe('Login Page', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    // afterEach(function () {
    //     if (this.currentTest.state === 'failed') {
    //         cy.screenshot(`Login/${this.currentTest.title}`, {
    //             capture: 'runner',
    //         });
    //     }
    // });

    //check log in display
    it('should display login page correctly', () => {
        cy.get('[data-cy="logo-div-2"]').should('be.visible');
        cy.contains('Log in to your account').should('be.visible');
        cy.contains('Enter your credentials to continue.').should('be.visible');

        cy.get('input[data-cy="login-input-email"]').should('exist');
        cy.get('input[data-cy="login-input-enter-your-password"]').should(
            'exist',
        );
        cy.get(
            '[data-cy="router-compat-inertia-link-to-/forgot-password"]',
        ).should('exist');
        cy.get('[data-cy="button-button-1"]').should('exist');

        cy.contains(
            'Your role and dashboard are detected automatically after login.',
        ).should('be.visible');
    });

    // check input fields
    it('should allow users to input their email and password, with a show/hide button', () => {
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

    // check login invalid email format
    it('should display validation error for invalid email format', () => {
        cy.get('[data-cy="login-input-email"]').type('invalid-email');

        cy.get('[data-cy="login-input-enter-your-password"]').type(
            'Testpassword123*',
        );

        cy.get('[data-cy="button-button-1"]').click();

        cy.get('[data-cy="login-input-email"]')
            .should('have.prop', 'validationMessage')
            .and('not.be.empty');
    });

    //check forgot password modal display
    it('should redirect the user to the forgot password page when clicking the forgot password link', () => {
        cy.get(
            '[data-cy="router-compat-inertia-link-to-/forgot-password"]',
        ).click();
        cy.get('[data-cy="forgot-password-div-3"]').should('exist');
        cy.get('[data-cy="forgot-password-h1-forgot-your-password"]').should(
            'be.visible',
        );
        cy.get(
            '[data-cy="forgot-password-p-enter-the-email-linked-to-your"]',
        ).should('be.visible');
        cy.get('input[data-cy="forgot-password-input-email"]').should('exist');
        cy.get('[data-cy="button-button-1"]').should('exist');
        cy.get('[data-cy="button-button-1"]').should('exist');
    });

    //check forgot password without inputing email
    it('should display a validation message when submitting forgot password without an email', () => {
        cy.get(
            '[data-cy="router-compat-inertia-link-to-/forgot-password"]',
        ).click(); // click forgot password
        cy.get('[data-cy="button-button-1"]').click();
        cy.get('[data-cy="router-compat-inertia-link-to-/login"]').click(); // click back to login
    });

    //check forgot password inputing unregistered email
    it('should display a validation message when submitting forgot password with unregistered email', () => {
        cy.get(
            '[data-cy="router-compat-inertia-link-to-/forgot-password"]',
        ).click(); // click forgot password
        cy.get('input[data-cy="forgot-password-input-email"]')
            .type('herlyn.torres@frontlinebusiness.com.ph')
            .should('have.value', 'herlyn.torres@frontlinebusiness.com.ph');
        cy.get('[data-cy="button-button-1"]').click();
    });

    //check forgot password inputing registered email
    it('should allow the registered user to request a password reset', () => {
        cy.get(
            '[data-cy="router-compat-inertia-link-to-/forgot-password"]',
        ).click(); // click forgot password
        cy.get('input[data-cy="forgot-password-input-email"]')
            .type('vincent.ramirez@frontlinebusiness.com.ph')
            .should('have.value', 'vincent.ramirez@frontlinebusiness.com.ph');
        cy.get('[data-cy="button-button-1"]').click();
    });

    //check login empty fields
    it('should prevent login submission when fields are empty', () => {
        cy.get('[data-cy="button-button-1"]').click();

        cy.get('[data-cy="login-input-email"]')
            .should('have.prop', 'validationMessage')
            .and('not.be.empty');

        cy.get('[data-cy="login-input-enter-your-password"]')
            .should('have.prop', 'validationMessage')
            .and('not.be.empty');
    });

    //check valid credentials when pressing enter key
    it('should allow user to login by pressing enter key', () => {
        cy.intercept('POST', '**/login', (req) => {
            req.reply((res) => {
                res.setDelay(2000);
            });
        }).as('loginRequest');

        cy.get('input[data-cy="login-input-email"]').type(Cypress.env('email'));

        cy.get('input[data-cy="login-input-enter-your-password"]')
            .type(Cypress.env('password'))
            .type('{enter}');

        cy.wait('@loginRequest');

        cy.url().should('include', '/dashboard');
    });

    // check valid credentials
    it('should disable login button while request is processing', () => {
        cy.intercept('POST', '**/login', (req) => {
            req.reply((res) => {
                res.setDelay(2000);
            });
        }).as('loginRequest');

        cy.get('input[data-cy="login-input-email"]').type(Cypress.env('email'));
        cy.get('input[data-cy="login-input-enter-your-password"]').type(
            Cypress.env('password'),
        );

        cy.get('[data-cy="login-eye-16"]').click();
        cy.get('[data-cy="login-eye-off-15"]').click();

        cy.get('[data-cy="button-button-1"]').click();

        // btn should be disabled while waiting for the response
        cy.get('[data-cy="button-button-1"]').should('be.disabled');

        cy.wait('@loginRequest');

        // user should be redirected after a successful login
        cy.url().should('include', '/dashboard');
    });
});
