export default function PlaceholderPage({
  title
}: {
  title: string;
}) {
  return <div data-cy="placeholder-div-1">
      <h1 className="mb-3 text-xl font-semibold text-ink" data-cy="placeholder-h1-2">{title}</h1>
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white text-sm text-neutral-400" data-cy="placeholder-div-module-coming-soon">
        {title} module coming soon
      </div>
    </div>;
}