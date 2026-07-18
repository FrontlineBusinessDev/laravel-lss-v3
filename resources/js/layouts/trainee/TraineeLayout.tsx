import { ReactNode } from 'react';

interface TraineeLayoutProps {
    title: string;
    description?: string;
    actionNode?: ReactNode;
    children: ReactNode;
}

export default function TraineeLayout({
    title,
    description,
    actionNode,
    children,
}: TraineeLayoutProps) {
    return (
        <div data-cy="trainee-layout-div-1">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1
                        className="text-xl font-semibold text-ink"
                        data-cy="trainee-layout-h1-title"
                    >
                        {title}
                    </h1>
                    {description && (
                        <p className="mb-4 text-sm text-neutral-500">
                            {description}
                        </p>
                    )}
                </div>
                {actionNode && actionNode}
            </div>
            {children}
        </div>
    );
}
