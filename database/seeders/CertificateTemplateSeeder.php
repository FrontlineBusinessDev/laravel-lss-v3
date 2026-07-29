<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

/**
 * Seeds the two default certificate templates, styled after the reference
 * "FBS Learning Center Solution System" certificate: org header, recipient
 * name, a dynamic body paragraph (token `citationText` — the actual wording
 * with hours/program/date-range placeholders lives on the linked
 * CertificateCitation, not here), and a footer signing line. The trainee
 * template additionally shows a two-column "LEARNING OUTCOMES" list.
 */
class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        CertificateTemplate::query()->updateOrCreate(
            ['name' => 'Standard Trainee Certificate'],
            [
                'certificate_type' => 'trainee',
                'layout' => [
                    ['id' => 'org_title', 'type' => 'text', 'text' => 'Frontline Business Solutions, Inc.', 'x' => 10, 'y' => 6, 'width' => 80, 'height' => 5, 'fontSize' => 14, 'fontWeight' => 'bold', 'align' => 'center'],
                    ['id' => 'org_subtitle', 'type' => 'text', 'text' => 'Learning Solutions System', 'x' => 10, 'y' => 11, 'width' => 80, 'height' => 4, 'fontSize' => 9, 'align' => 'center', 'color' => '#6b7280'],
                    ['id' => 'divider', 'type' => 'line', 'x' => 35, 'y' => 17, 'width' => 30, 'color' => '#0b3d66'],
                    ['id' => 'name', 'type' => 'text', 'token' => 'recipientName', 'x' => 10, 'y' => 22, 'width' => 80, 'height' => 8, 'fontSize' => 26, 'fontWeight' => 'bold', 'align' => 'center'],
                    ['id' => 'body', 'type' => 'text', 'token' => 'citationText', 'x' => 12, 'y' => 32, 'width' => 76, 'height' => 14, 'fontSize' => 11, 'align' => 'center'],
                    ['id' => 'outcomes_heading', 'type' => 'text', 'text' => 'LEARNING OUTCOMES', 'x' => 10, 'y' => 48, 'width' => 80, 'height' => 4, 'fontSize' => 11, 'fontWeight' => 'bold', 'align' => 'center'],
                    ['id' => 'outcomes', 'type' => 'outcomes', 'x' => 12, 'y' => 53, 'width' => 76, 'height' => 28, 'fontSize' => 10, 'columns' => 2],
                    ['id' => 'footer', 'type' => 'text', 'token' => 'issuedDate', 'x' => 15, 'y' => 85, 'width' => 70, 'height' => 4, 'fontSize' => 9, 'align' => 'center'],
                    ['id' => 'cert_no', 'type' => 'text', 'token' => 'certificateNo', 'x' => 10, 'y' => 90, 'width' => 50, 'height' => 3, 'fontSize' => 8, 'color' => '#6b7280'],
                    ['id' => 'qr', 'type' => 'qr', 'token' => 'certificateNo', 'x' => 82, 'y' => 88, 'width' => 10, 'height' => 10],
                ],
                'page_size' => 'a4',
                'orientation' => 'portrait',
                'is_default' => true,
                'background_color' => '#ffffff',
                'border_color' => '#0b3d66',
                'status' => 'active',
            ],
        );

        CertificateTemplate::query()->updateOrCreate(
            ['name' => 'Standard Seminar Certificate'],
            [
                'certificate_type' => 'seminar',
                'layout' => [
                    ['id' => 'org_title', 'type' => 'text', 'text' => 'Frontline Business Solutions, Inc.', 'x' => 10, 'y' => 8, 'width' => 80, 'height' => 6, 'fontSize' => 14, 'fontWeight' => 'bold', 'align' => 'center'],
                    ['id' => 'org_subtitle', 'type' => 'text', 'text' => 'Learning Solutions System', 'x' => 10, 'y' => 14, 'width' => 80, 'height' => 4, 'fontSize' => 9, 'align' => 'center', 'color' => '#6b7280'],
                    ['id' => 'divider', 'type' => 'line', 'x' => 35, 'y' => 22, 'width' => 30, 'color' => '#0b3d66'],
                    ['id' => 'title', 'type' => 'text', 'text' => 'Certificate of Participation', 'x' => 10, 'y' => 28, 'width' => 80, 'height' => 6, 'fontSize' => 16, 'fontWeight' => 'bold', 'align' => 'center', 'color' => '#0b3d66'],
                    ['id' => 'name', 'type' => 'text', 'token' => 'recipientName', 'x' => 10, 'y' => 38, 'width' => 80, 'height' => 10, 'fontSize' => 26, 'fontWeight' => 'bold', 'align' => 'center'],
                    ['id' => 'body', 'type' => 'text', 'token' => 'citationText', 'x' => 15, 'y' => 52, 'width' => 70, 'height' => 16, 'fontSize' => 12, 'align' => 'center'],
                    ['id' => 'footer', 'type' => 'text', 'token' => 'issuedDate', 'x' => 15, 'y' => 78, 'width' => 70, 'height' => 5, 'fontSize' => 10, 'align' => 'center'],
                    ['id' => 'cert_no', 'type' => 'text', 'token' => 'certificateNo', 'x' => 10, 'y' => 88, 'width' => 50, 'height' => 4, 'fontSize' => 8, 'color' => '#6b7280'],
                    ['id' => 'qr', 'type' => 'qr', 'token' => 'certificateNo', 'x' => 85, 'y' => 82, 'width' => 10, 'height' => 10],
                ],
                'page_size' => 'a4',
                'orientation' => 'landscape',
                'is_default' => true,
                'background_color' => '#ffffff',
                'border_color' => '#0b3d66',
                'status' => 'active',
            ],
        );
    }
}
