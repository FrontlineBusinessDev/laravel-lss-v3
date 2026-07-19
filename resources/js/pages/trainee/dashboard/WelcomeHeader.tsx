import { Avatar } from '@/components/Avatar';
import type { DashboardTrainee } from '@/types/modules/dashboard/trainee-dashboard';

export function WelcomeHeader({ trainee }: { trainee: DashboardTrainee }) {
    const name = `${trainee.first_name} ${trainee.last_name}`.trim();

    return (
        <div className="mb-6 flex items-center gap-3">
            <Avatar src={trainee.avatar_url} name={name} size="lg" />
            <div>
                <h1 className="text-xl font-semibold text-ink">
                    Welcome, {name}!
                </h1>
                <p className="text-sm text-neutral-500">
                    Here's what's happening in your training today.
                </p>
            </div>
        </div>
    );
}
