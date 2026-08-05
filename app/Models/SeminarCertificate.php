<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeminarCertificate extends Model
{
    protected $table = 'app_seminar_certificates';

    protected $fillable = [
        'seminar_participant_id',
        'certificate_no',
        'public_id',
        'citation_id',
        'template_id',
        'issued_at',
        'issued_by',
    ];

    protected $casts = [
        'issued_at' => 'date',
    ];

    protected $appends = ['verification_url'];

    public function participant(): BelongsTo
    {
        return $this->belongsTo(SeminarParticipant::class, 'seminar_participant_id');
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

    /** Public, unguessable QR/verification link — null until first issuance stamps public_id. */
    public function getVerificationUrlAttribute(): ?string
    {
        return $this->public_id ? route('public.certificates.show', $this->public_id) : null;
    }
}
