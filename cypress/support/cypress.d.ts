declare global {
    namespace Cypress {
        interface Chainable {
            login(): Chainable<void>;
            verifySettingsModuleHeader(): Chainable<void>;
        }
    }
}

export {};
