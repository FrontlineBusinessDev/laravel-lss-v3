<?php

namespace App\Support\Reports;

use App\Models\Seminar;

/**
 * Real-schema equivalent of the previous client-side seminarEarningsTotal()
 * (resources/js/pages/developer/seminars/seminarUtils.ts). The mock model tracked
 * a per-participant payment amount; the real schema only has a per-seminar fee, so
 * "earned" is approximated as fee * paid-participant-count, where a participant
 * counts as paid once they're past the 'Pending Payment' status.
 */
class SeminarEarnings
{
    public static function total(?string $from = null, ?string $to = null): float
    {
        return (float) Seminar::query()
            ->when($from, fn($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('date', '<=', $to))
            ->withCount(['participants' => function ($q) {
                $q->where('status', '!=', 'Pending Payment');
            }])
            ->get()
            ->sum(fn(Seminar $seminar) => $seminar->fee * $seminar->participants_count);
    }
}
