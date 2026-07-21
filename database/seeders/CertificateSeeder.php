<?php

namespace Database\Seeders;

use App\Models\CertificateCitation;
use App\Models\CertificateTemplate;
use App\Models\TraineeCertificate;
use App\Models\Trainees;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Only creates certificate rows for trainees who actually qualify (completed,
 * finished their required hours, and no outstanding balance) — no placeholder
 * pending/ineligible rows, per the confirmed seeding scope.
 */
class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        $citationId = CertificateCitation::where('applies_to', 'trainee')->value('id');
        $templateId = CertificateTemplate::where('certificate_type', 'trainee')->value('id');
        $issuerId = User::role(['admin', 'developer'])->value('id');

        $eligibleTrainees = Trainees::query()
            ->where('status', 'completed')
            ->withCompletedHours()
            ->get()
            ->filter(fn(Trainees $trainee) => (float) ($trainee->completed_hours ?? 0) >= (float) $trainee->required_hours
                && $trainee->outstanding_balance <= 0);

        $year = now()->year;
        $sequence = 1;

        foreach ($eligibleTrainees as $trainee) {
            TraineeCertificate::create([
                'trainee_id' => $trainee->id,
                'eligibility_status' => 'eligible',
                'certificate_no' => sprintf('CERT-%d-%04d', $year, $sequence++),
                'citation_id' => $citationId,
                'template_id' => $templateId,
                'issued_at' => fake()->dateTimeBetween($trainee->date_completed ?? '2020-01-01', 'now'),
                'issued_by' => $issuerId,
            ]);
        }
    }
}
