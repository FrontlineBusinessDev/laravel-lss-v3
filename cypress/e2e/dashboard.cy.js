describe('Dashboard Module', () => {
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

        cy.intercept('GET', '**/dashboard/metrics').as('metrics');
        cy.intercept('GET', '**/dashboard/upcoming-ends').as('upcomingEnds');
        cy.intercept('GET', '**/dashboard/calendar-events*').as(
            'calendarEvents',
        );
        cy.intercept('GET', '**/dashboard/on-leave').as('onLeave');
        cy.intercept('GET', '**/dashboard/ongoing-tasks').as('ongoingTasks');
        cy.intercept('GET', '**/dashboard/announcements').as('announcements');
        cy.intercept('GET', '**/dashboard/document-compliance').as(
            'documentCompliance',
        );
        cy.intercept('GET', '**/dashboard/trainee-growth').as(
            'traineeGrowth',
        );
        cy.intercept('GET', '**/dashboard/status-breakdown').as(
            'statusBreakdown',
        );
        cy.intercept('GET', '**/dashboard/recent-batches').as(
            'recentBatches',
        );

        cy.visit('/dashboard');

        cy.wait([
            '@metrics',
            '@upcomingEnds',
            '@calendarEvents',
            '@onLeave',
            '@ongoingTasks',
            '@announcements',
            '@documentCompliance',
            '@traineeGrowth',
            '@statusBreakdown',
            '@recentBatches',
        ]);
    });

    it('should load the dashboard page with its header', () => {
        cy.contains('h1', 'Dashboard').should('be.visible');
        cy.contains('Overview across all active programs').should(
            'be.visible',
        );
    });

    it('should display the top-line metric cards', () => {
        cy.get('[data-cy="stat-card-div-1"]').should('have.length', 4);

        cy.get('[data-cy="stat-card-span-3"]')
            .should('contain.text', 'Total batches')
            .and('contain.text', 'Total trainees')
            .and('contain.text', 'Ongoing trainees')
            .and('contain.text', 'Overall LS program rating');

        cy.get('[data-cy="stat-card-div-5"]').each(($value) => {
            cy.wrap($value).should('not.have.text', '—');
        });
    });

    it('should render every dashboard widget without an error state', () => {
        [
            'Trainees on leave',
            'Nearing training end date',
            'Trainees with incomplete documents',
            'Announcements',
            'Ongoing tasks',
            'Recent batches',
        ].forEach((title) => {
            cy.contains('h2', title).should('be.visible');
        });

        cy.get('.bg-danger-50').should('not.exist');
    });

    it('should open an announcement in a modal when clicked', () => {
        cy.contains('h2', 'Announcements')
            .parents('.rounded-lg')
            .first()
            .then(($card) => {
                if ($card.find('button').length === 0) {
                    cy.log('No announcements available to open');
                    return;
                }

                cy.wrap($card).find('button').first().click();
                cy.get('[role="dialog"], .modal, [data-headlessui-state]')
                    .should('exist');
            });
    });

    it('should navigate to a batch when a recent batch row is clicked', () => {
        cy.contains('h2', 'Recent batches')
            .parents('.rounded-lg')
            .first()
            .then(($card) => {
                if ($card.find('button').length === 0) {
                    cy.log('No recent batches available to open');
                    return;
                }

                cy.wrap($card).find('button').first().click();
                cy.url().should('match', /\/batches\/\d+$/);
            });
    });

    it('should refetch calendar events when navigating to another month', () => {
        cy.intercept('GET', '**/dashboard/calendar-events*').as(
            'nextMonthEvents',
        );

        cy.get('[data-cy="mini-calendar-button-next-month"]').click();

        cy.wait('@nextMonthEvents');
    });
});
