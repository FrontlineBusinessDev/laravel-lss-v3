<?php

namespace App\Support\Reports;

use App\Models\Trainees;
use Illuminate\Support\Collection;

/**
 * Rolls up payment figures for a set of trainees. Terminated trainees are always
 * included in the sums (they still owe / may have paid), mirroring the previous
 * client-side computeGroupFinancials() in resources/js/pages/developer/reports/reportsUtils.ts.
 */
class BatchFinancialsCalculator
{
    /**
     * @param Collection<int, Trainees> $trainees
     * @return array{totalReceived:float,totalBalance:float,totalDue:float,traineeCount:int,completedCount:int,terminatedCount:int}
     */
    public static function forTrainees(Collection $trainees): array
    {
        $totalReceived = 0.0;
        $totalBalance = 0.0;
        $totalDue = 0.0;
        $completedCount = 0;
        $terminatedCount = 0;

        foreach ($trainees as $trainee) {
            $totalReceived += (float) $trainee->total_paid;
            $totalBalance += max(0, (float) $trainee->outstanding_balance);
            $totalDue += (float) $trainee->net_amount_required;

            $completedHours = (float) ($trainee->completed_hours ?? 0);
            if ($trainee->status === 'completed' || $completedHours >= (float) $trainee->required_hours) {
                $completedCount++;
            }
            if ($trainee->status === 'terminated') {
                $terminatedCount++;
            }
        }

        return [
            'totalReceived' => $totalReceived,
            'totalBalance' => $totalBalance,
            'totalDue' => $totalDue,
            'traineeCount' => $trainees->count(),
            'completedCount' => $completedCount,
            'terminatedCount' => $terminatedCount,
        ];
    }
}
