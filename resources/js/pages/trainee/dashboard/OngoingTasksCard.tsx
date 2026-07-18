import { Link } from '@inertiajs/react';
import { ListChecks } from 'lucide-react';
import type { DashboardTask } from '@/types/modules/dashboard/trainee-dashboard';

export function OngoingTasksCard({ tasks }: { tasks: DashboardTask[] }) {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
                <ListChecks size={16} className="text-brand-500" />
                <h2 className="text-sm font-semibold text-ink">
                    Ongoing tasks
                </h2>
            </div>
            {tasks.length === 0 ? (
                <p className="text-xs text-neutral-500">No ongoing tasks.</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <Link
                                href="/trainee/tasks"
                                className="block rounded-md border border-neutral-100 px-3 py-2 transition-colors hover:bg-neutral-50"
                            >
                                <div className="text-sm font-medium text-ink">
                                    {task.task}
                                </div>
                                {task.description && (
                                    <div className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                                        {task.description}
                                    </div>
                                )}
                                <div className="mt-1 text-xs text-neutral-400">
                                    {task.trainer
                                        ? `${task.trainer.first_name} ${task.trainer.last_name}`
                                        : 'Unassigned trainer'}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
