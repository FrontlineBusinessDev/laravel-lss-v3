<?php

namespace App\Support;

use App\Models\CertificateTemplate;

/**
 * Resolves the active default template for a certificate type, used when no
 * template is explicitly chosen at issuance. Extracted from the identical
 * logic previously duplicated in TraineeCertificateController and
 * SeminarCertificateController.
 */
final class CertificateTemplateResolver
{
    public static function defaultTemplateId(string $certificateType): ?int
    {
        return CertificateTemplate::where('certificate_type', $certificateType)
            ->where('is_default', true)
            ->where('status', 'active')
            ->value('id');
    }
}
