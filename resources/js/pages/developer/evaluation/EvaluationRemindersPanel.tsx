import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { evaluationOverviewService } from '@/api-service-layer/admin/evaluation';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/use-auth';

/**
 * Manual, repeatable "trainee hasn't submitted their Trainer Evaluation yet"
 * nudge tool — distinct from the automatic one-shot HourThresholdDispatcher
 * notice fired on task completion. Admins can re-send this at any time.
 */
export function EvaluationRemindersPanel() {
    const { showToast } = useToast();
    const { displayName } = useAuth();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState(true);
    const [chat, setChat] = useState(true);
    const [sending, setSending] = useState(false);

    const { data: candidates = [], isLoading } = useQuery({
        queryKey: ['evaluation-reminder-candidates'],
        queryFn: evaluationOverviewService.reminders,
    });

    async function notifyAll() {
        setSending(true);
        try {
            const { notified } = await evaluationOverviewService.notifyReminders({
                email,
                chat,
            });
            showToast(`Reminder sent to ${notified} trainee(s).`, 'success');
            await queryClient.invalidateQueries({
                queryKey: ['evaluation-reminder-candidates'],
            });
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : 'Failed to send reminders.',
                'error',
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 p-4">
                <div className="flex items-start gap-2">
                    <Bell size={15} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                        <h2 className="text-sm font-semibold text-ink">
                            Evaluation reminders
                        </h2>
                        <p className="text-xs text-neutral-500">
                            Auto-detected: trainees whose rendered hours have
                            met their required hours but haven't submitted
                            their trainer evaluation yet.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 p-3">
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="text-xs font-medium text-neutral-500 uppercase">
                        Send via:
                    </span>
                    <label className="flex items-center gap-1.5">
                        <input
                            type="checkbox"
                            checked={email}
                            onChange={(e) => setEmail(e.target.checked)}
                            className="h-3.5 w-3.5 accent-brand-500"
                        />
                        Email
                    </label>
                    <label className="flex items-center gap-1.5">
                        <input
                            type="checkbox"
                            checked={chat}
                            onChange={(e) => setChat(e.target.checked)}
                            className="h-3.5 w-3.5 accent-brand-500"
                        />
                        Google Chat
                    </label>
                </div>
                <Button
                    size="sm"
                    variant="primary"
                    icon={Bell}
                    disabled={candidates.length === 0 || (!email && !chat) || sending}
                    onClick={notifyAll}
                >
                    Notify all eligible ({candidates.length})
                </Button>
            </div>

            <div className="divide-y divide-neutral-100">
                {isLoading && (
                    <div className="px-4 py-8 text-center text-xs text-neutral-400">
                        Loading...
                    </div>
                )}
                {!isLoading &&
                    candidates.map((c) => (
                        <div
                            key={c.trainee_id}
                            className="flex items-center justify-between gap-3 px-4 py-2.5"
                        >
                            <span className="text-sm text-ink">{c.name}</span>
                            <span className="text-xs text-neutral-500">
                                {c.batch_code ?? 'Unassigned batch'}
                            </span>
                        </div>
                    ))}
                {!isLoading && candidates.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-neutral-400">
                        No trainees currently need an evaluation reminder.
                    </div>
                )}
            </div>

            <div className="border-t border-neutral-100 p-3 text-xs text-neutral-400">
                Signed in as {displayName}. Reminders are logged to the
                trainee notification history.
            </div>
        </div>
    );
}
