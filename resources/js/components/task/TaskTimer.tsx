import { Pause, Play, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ApiTask } from '@/types/task';

/**
 * Play → Running[Pause] → Paused[Resume, Save] timer control for one task row.
 * Local tick display only — never polls the server per second. "Pause" and
 * "Resume" map to the existing stop/run actions (stop already persists
 * time_spent on every pause, so no new backend endpoints are needed). "Save"
 * is a confirmatory affordance — since pausing already persisted, it's
 * disabled whenever there's nothing new to save (i.e. never while running).
 * Once time_spent >= time_goal, Pause/Resume are hidden — only Save/Complete remain.
 */
interface Props {
    task: ApiTask;
    onRun: () => void;
    onStop: () => void;
    disabled?: boolean;
}

function formatElapsed(hours: number): string {
    const totalSeconds = Math.max(0, Math.round(hours * 3600));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TaskTimer({ task, onRun, onStop, disabled }: Props) {
    const baseSpent = Number(task.time_spent ?? 0);
    const timeGoal = Number(task.time_goal ?? 0);
    const goalReached = timeGoal > 0 && baseSpent >= timeGoal;
    const isPaused = !task.is_running && baseSpent > 0;
    const [liveSpent, setLiveSpent] = useState(baseSpent);

    useEffect(() => {
        if (!task.is_running || !task.started_at) {
            setLiveSpent(baseSpent);
            return;
        }
        const startedAtMs = new Date(task.started_at).getTime();
        const tick = () => {
            const elapsedHours = (Date.now() - startedAtMs) / 3_600_000;
            setLiveSpent(baseSpent + elapsedHours);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [task.is_running, task.started_at, baseSpent]);

    if (task.status !== 'open') {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-500">
                {formatElapsed(liveSpent)}
            </span>

            {/* Idle — never started, or goal already reached */}
            {!task.is_running && !isPaused && !goalReached && (
                <button
                    type="button"
                    onClick={onRun}
                    disabled={disabled}
                    title="Play"
                    className="rounded-md p-1 text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
                >
                    <Play className="size-4" />
                </button>
            )}

            {/* Running */}
            {task.is_running && !goalReached && (
                <button
                    type="button"
                    onClick={onStop}
                    disabled={disabled}
                    title="Pause"
                    className="text-warning-700 rounded-md p-1 transition-colors hover:bg-warning-50 disabled:opacity-50"
                >
                    <Pause className="size-4" />
                </button>
            )}

            {/* Paused — resumable, plus a confirmatory (already-saved) Save affordance */}
            {isPaused && !goalReached && (
                <button
                    type="button"
                    onClick={onRun}
                    disabled={disabled}
                    title="Resume"
                    className="rounded-md p-1 text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
                >
                    <Play className="size-4" />
                </button>
            )}
            {isPaused && (
                <button
                    type="button"
                    disabled
                    title="Saved"
                    className="text-success-700 rounded-md p-1 opacity-50"
                >
                    <Save className="size-4" />
                </button>
            )}
        </div>
    );
}
