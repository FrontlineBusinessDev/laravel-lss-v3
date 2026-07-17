<?php

namespace App\Services;

use App\Models\Batches;
use App\Models\Trainees;
use Illuminate\Support\Facades\DB;

class BillingService
{
    /**
     * Kinakalkula ang tamang rate at discounts ng trainee.
     */
    public function calculateBilling(Trainees $trainee)
    {
        $batch = $trainee->batch ?? Batches::find($trainee->batch_id);

        // 1. RATE PER HOUR (Default rate base sa setup)
        if ($trainee->override_rate_per_hour !== null) {
            $rate = $trainee->override_rate_per_hour;
        } else {
            $rateSetting = DB::table('app_settings_rates')
                ->where('setup', $batch->setup)
                ->first();
            $rate = $rateSetting ? $rateSetting->rate_per_hour : 0.00;
        }

        // 2. HOURS DISCOUNT PERCENTAGE
        if ($trainee->override_hours_discount_percent !== null) {
            $hoursDiscountPercent = $trainee->override_hours_discount_percent;
        } else {
            $hoursDiscountSetting = DB::table('app_settings_hours_discounts')
                ->where('min_hours', '<=', $trainee->required_hours)
                ->orderBy('min_hours', 'desc')
                ->first();
            $hoursDiscountPercent = $hoursDiscountSetting ? $hoursDiscountSetting->discount_percentage : 0.00;
        }

        // 3. GROUP DISCOUNT PERCENTAGE
        if ($trainee->override_group_discount_percent !== null) {
            $groupDiscountPercent = $trainee->override_group_discount_percent;
        } else {
            // Bilangin ang kaklase mula sa parehong batch at school
            $traineeCount = Trainees::where('batch_id', $trainee->batch_id)
                ->where('school_id', $trainee->school_id)
                ->count();

            $groupDiscountSetting = DB::table('app_settings_group_discounts')
                ->where('min_trainees', '<=', $traineeCount)
                ->orderBy('min_trainees', 'desc')
                ->first();
            $groupDiscountPercent = $groupDiscountSetting ? $groupDiscountSetting->discount_percentage : 0.00;
        }

        // 4. FINANCIAL CALCULATIONS
        $grossAmount = $trainee->required_hours * $rate;

        $hoursDiscountAmount = $grossAmount * ($hoursDiscountPercent / 100);
        $groupDiscountAmount = $grossAmount * ($groupDiscountPercent / 100);
        $totalDiscountAmount = $hoursDiscountAmount + $groupDiscountAmount;

        $netAmountRequired = max(0, $grossAmount - $totalDiscountAmount);

        // I-save ang values sa model instance
        $trainee->applied_rate_per_hour = $rate;
        $trainee->hours_discount_percent = $hoursDiscountPercent;
        $trainee->group_discount_percent = $groupDiscountPercent;
        $table_total_discount = $totalDiscountAmount;

        $trainee->gross_amount = $grossAmount;
        $trainee->total_discount_amount = $totalDiscountAmount;
        $trainee->net_amount_required = $netAmountRequired;
    }

    /**
     * Kapag may bagong sumali sa school sa parehong batch, 
     * nagbabago ang bilang nila kaya dapat ma-recalculate ang group discount ng lahat sa batch/school na iyon.
     */
    public function recalculateGroupForBatchAndSchool($batchId, $schoolId)
    {
        $trainees = Trainees::where('batch_id', $batchId)
            ->where('school_id', $schoolId)
            ->get();

        foreach ($trainees as $trainee) {
            $this->calculateBilling($trainee);
            $trainee->saveQuietly(); // para iwas infinite loop sa model observers
        }
    }
}
