<?php

namespace App\Support;

/**
 * Generates the next sequential certificate number for a given certificate
 * model/prefix, scoped to a year (e.g. CERT-2026-0001, SEM-CERT-2026-0001).
 * Extracted from the identical logic previously duplicated in
 * TraineeCertificateController and SeminarCertificateController.
 */
final class CertificateNumberGenerator
{
    /** @param class-string $modelClass */
    public static function next(string $modelClass, string $prefix, int $year): string
    {
        $sequence = $modelClass::whereYear('created_at', $year)->count() + 1;

        return sprintf('%s%d-%04d', $prefix, $year, $sequence);
    }
}
