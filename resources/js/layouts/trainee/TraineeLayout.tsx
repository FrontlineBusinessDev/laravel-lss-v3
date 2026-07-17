import { ReactNode } from 'react';

interface TraineeLayoutProps {
    title: string;
    children: ReactNode;
}

export default function TraineeLayout({ title, children }: TraineeLayoutProps) {
    return (
        <div data-cy="trainee-layout-div-1">
            <h1
                className="mb-4 text-xl font-semibold text-ink"
                data-cy="trainee-layout-h1-title"
            >
                {title}
            </h1>
            {children}
        </div>
    );
}
