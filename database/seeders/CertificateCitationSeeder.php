<?php

namespace Database\Seeders;

use App\Models\CertificateCitation;
use Illuminate\Database\Seeder;

class CertificateCitationSeeder extends Seeder
{
    public function run(): void
    {
        $citations = [
            ['title' => 'Successful Completion of On-the-Job Training', 'applies_to' => 'trainee', 'critical' => true],
            ['title' => 'Outstanding Performance Award', 'applies_to' => 'trainee', 'critical' => false],
            ['title' => 'Certificate of Attendance', 'applies_to' => 'seminar', 'critical' => false],
        ];

        foreach ($citations as $citation) {
            CertificateCitation::query()->updateOrCreate(
                ['title' => $citation['title']],
                [
                    'applies_to' => $citation['applies_to'],
                    'body_text' => "This certifies that the recipient has met the criteria for: {$citation['title']}.",
                    'status' => 'active',
                    'critical' => $citation['critical'],
                ],
            );
        }
    }
}
