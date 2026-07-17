import { ReactNode } from 'react';

interface TrainerLayoutProps {
    title: string;
    children: ReactNode;
}

export default function TrainerLayout({ title, children }: TrainerLayoutProps) {
    return (
        <div data-cy="trainer-layout-div-1">
            <h1
                className="mb-4 text-xl font-semibold text-ink"
                data-cy="trainer-layout-h1-title"
            >
                {title}
            </h1>
            {children}
        </div>
    );
}
