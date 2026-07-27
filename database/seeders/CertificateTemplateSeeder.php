<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        CertificateTemplate::query()->updateOrCreate(
            ['name' => 'Standard Trainee Certificate'],
            [
                'certificate_type' => 'trainee',
                'layout' => [
                    ['id' => 'title', 'type' => 'text', 'text' => 'Certificate of Completion', 'x' => 10, 'y' => 20, 'width' => 80, 'height' => 10, 'fontSize' => 28, 'align' => 'center'],
                    ['id' => 'name', 'type' => 'text', 'token' => 'trainee_name', 'x' => 10, 'y' => 45, 'width' => 80, 'height' => 10, 'fontSize' => 20, 'align' => 'center'],
                    ['id' => 'qr', 'type' => 'qr', 'token' => 'certificate_no', 'x' => 85, 'y' => 80, 'width' => 10, 'height' => 10],
                ],
                'page_size' => 'a4',
                'orientation' => 'landscape',
                'is_default' => true,
                'status' => 'active',
            ],
        );
    }
}
