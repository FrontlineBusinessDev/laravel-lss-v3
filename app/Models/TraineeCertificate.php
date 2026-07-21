<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TraineeCertificate extends Model
{
    protected $table = 'app_trainee_certificates';

    protected $fillable = [
        'trainee_id',
        'eligibility_status',
        'certificate_no',
        'citation_id',
        'template_id',
        'issued_at',
        'issued_by',
    ];

    protected $casts = [
        'issued_at' => 'date',
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function citation(): BelongsTo
    {
        return $this->belongsTo(CertificateCitation::class, 'citation_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'template_id');
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
