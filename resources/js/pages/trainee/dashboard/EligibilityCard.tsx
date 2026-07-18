import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type {
    DashboardEligibility,
    EligibilityStatus,
} from '@/types/modules/dashboard/trainee-dashboard';

const STATUS_META: Record<
    EligibilityStatus,
    { label: string; icon: typeof CheckCircle2; className: string; dot: string }
> = {
    eligible: {
        label: 'Eligible for Certification',
        icon: CheckCircle2,
        className: 'border-success-200 bg-success-50 text-success-800',
        dot: 'bg-success-500',
    },
    pending_requirements: {
        label: 'Pending Requirements',
        icon: AlertTriangle,
        className: 'border-warning-200 bg-warning-50 text-warning-800',
        dot: 'bg-warning-500',
    },
    outstanding_balance: {
        label: 'Outstanding Balance',
        icon: XCircle,
        className: 'border-danger-200 bg-danger-50 text-danger-800',
        dot: 'bg-danger-500',
    },
    not_eligible: {
        label: 'Not Eligible for Certification',
        icon: XCircle,
        className: 'border-danger-200 bg-danger-50 text-danger-800',
        dot: 'bg-danger-500',
    },
};

function maskBalanceReason(reason: string, visible: boolean): string {
    if (visible || !reason.startsWith('Outstanding balance of')) {
        return reason;
    }
    return 'Outstanding balance of ••••••••';
}

export function EligibilityCard({
    eligibility,
}: {
    eligibility: DashboardEligibility;
}) {
    const [open, setOpen] = useState(false);
    const [balanceVisible, setBalanceVisible] = useState(false);
    const meta = STATUS_META[eligibility.status];
    const Icon = meta.icon;

    return (
        <div className={`rounded-lg border p-4 ${meta.className}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="text-sm font-semibold">
                        {meta.label}
                    </span>
                </div>
                {eligibility.status !== 'eligible' && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        View details
                    </Button>
                )}
            </div>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Certification requirements"
                description="Resolve the items below to become eligible."
            >
                <ul className="flex flex-col gap-2">
                    {eligibility.reasons.map((reason, i) => {
                        const isBalance = reason.startsWith(
                            'Outstanding balance of',
                        );
                        return (
                            <li
                                key={i}
                                className="flex items-center justify-between gap-2 rounded-md border border-neutral-100 px-3 py-2 text-sm text-neutral-700"
                            >
                                <span>
                                    {maskBalanceReason(reason, balanceVisible)}
                                </span>
                                {isBalance && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setBalanceVisible((v) => !v)
                                        }
                                        aria-label={
                                            balanceVisible
                                                ? 'Hide amount'
                                                : 'Show amount'
                                        }
                                        className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-100"
                                    >
                                        {balanceVisible ? (
                                            <EyeOff size={14} />
                                        ) : (
                                            <Eye size={14} />
                                        )}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                    {eligibility.reasons.length === 0 && (
                        <li className="text-sm text-neutral-500">
                            No outstanding items.
                        </li>
                    )}
                </ul>
            </Modal>
        </div>
    );
}
