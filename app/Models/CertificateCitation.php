<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CertificateCitation extends Model
{
    protected $table = 'app_certificate_citations';

    protected $fillable = [
        'title',
        'applies_to',
        'body_text',
        'status',
        'critical',
        'created_by',
    ];

    protected $casts = [
        'critical' => 'boolean',
    ];

    public function traineeCertificates(): HasMany
    {
        return $this->hasMany(TraineeCertificate::class, 'citation_id');
    }

    public function seminarCertificates(): HasMany
    {
        return $this->hasMany(SeminarCertificate::class, 'citation_id');
    }
}
