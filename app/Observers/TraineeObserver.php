<?php

namespace App\Observers;

use App\Models\Trainees;
use App\Services\BillingService;

class TraineeObserver
{
    protected $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }
    public function saving(Trainees $trainee)
    {
        // Awtomatikong kalkulahin bago i-save sa database
        $this->billingService->calculateBilling($trainee);
    }
    public function saved(Trainees $trainee)
    {
        // Kung nagbago ang batch_id o school_id, i-recalculate ang group discounts para sa apektadong grupo
        if ($trainee->wasChanged(['batch_id', 'school_id']) || $trainee->wasRecentlyCreated) {
            $this->billingService->recalculateGroupForBatchAndSchool($trainee->batch_id, $trainee->school_id);
        }
    }
}
