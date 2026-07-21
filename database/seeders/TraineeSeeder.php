<?php

namespace Database\Seeders;

use App\Models\Batches;
use App\Models\Trainees;
use App\Services\BillingService;
use Illuminate\Database\Seeder;

/**
 * Seeds trainees per batch and runs them through the real BillingService so
 * applied_rate_per_hour / discounts / net_amount_required are snapshotted the
 * same way live trainee creation does — no re-derived math here.
 */
class TraineeSeeder extends Seeder
{
    public function run(): void
    {
        $billing = app(BillingService::class);

        Batches::query()->each(function (Batches $batch) use ($billing) {
            $count = fake()->numberBetween(5, 15);
            $statuses = $this->statusMix($count);

            for ($i = 0; $i < $count; $i++) {
                $trainee = Trainees::factory()
                    ->for($batch, 'batch')
                    ->state(['status' => $statuses[$i]])
                    ->make();

                if ($statuses[$i] === 'completed') {
                    $trainee->date_completed = fake()->dateTimeBetween($batch->date_started, 'now');
                }
                if ($statuses[$i] === 'terminated') {
                    $trainee->termination_remarks = fake()->sentence();
                }

                $billing->calculateBilling($trainee);
                $trainee->save();
            }
        });
    }

    /** @return string[] */
    protected function statusMix(int $count): array
    {
        $statuses = [];
        for ($i = 0; $i < $count; $i++) {
            $statuses[] = match (true) {
                $i % 5 === 0 => 'terminated',
                $i % 3 === 0 => 'completed',
                default => 'active',
            };
        }
        return $statuses;
    }
}
