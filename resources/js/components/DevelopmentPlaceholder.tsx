interface DevelopmentPlaceholderProps {
    feature?: string;
}

export function DevelopmentPlaceholder({ feature }: DevelopmentPlaceholderProps) {
    return (
        <div
            className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white text-sm text-neutral-400"
            data-cy="development-placeholder-div-1"
        >
            {feature ? `${feature} module coming soon` : 'Under development'}
        </div>
    );
}
