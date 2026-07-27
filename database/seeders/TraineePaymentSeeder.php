<?php

namespace Database\Seeders;

use App\Models\Trainees;
use App\Models\TraineesPayments;
use Illuminate\Database\Seeder;

/**
 * Sizes payments per trainee so roughly a third land in each of
 * unpaid / partially paid / fully paid, exercising Trainees::payment_status.
 */
class TraineePaymentSeeder extends Seeder
{
    public function run(): void
    {
        Trainees::query()->each(function (Trainees $trainee, int $index) {
            $due = (float) $trainee->net_amount_required;
            if ($due <= 0) {
                return;
            }

            $bucket = $index % 3;

            if ($bucket === 0) {
                return; // unpaid
            }

            $target = $bucket === 1 ? $due * fake()->randomFloat(2, 0.2, 0.7) : $due;
            $installments = fake()->numberBetween(1, 3);
            $remaining = $target;

            for ($i = 0; $i < $installments; $i++) {
                $amount = $i === $installments - 1 ? $remaining : round($remaining / 2, 2);
                if ($amount <= 0) {
                    continue;
                }
                TraineesPayments::factory()->for($trainee, 'trainee')->create(['amount_paid' => $amount]);
                $remaining -= $amount;
            }
        });
    }
}
