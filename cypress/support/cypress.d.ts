declare global {
    namespace Cypress {
        interface Chainable {
            login(): Chainable<void>;
            verifySettingsModuleHeader(): Chainable<void>;
            filterPerPage(): Chainable<void>;
        }
    }
}

export {};
