<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SeminarParticipant extends Model
{
    use HasFactory;
    protected $table = 'app_seminar_participants';

    protected $fillable = [
        'seminar_id',
        'name',
        'email',
        'mobile',
        'location',
        'profession',
        'is_student',
        'student_id',
        'status',
        'registered_at',
        'registration_done',
        'payment_done',
        'seminar_proper_done',
        'feedback_form_done',
        'certificate_done',
        'payment_status',
        'payment_date',
        'amount_paid',
        'reference_no',
        'payment_remarks',
    ];

    protected $casts = [
        'is_student' => 'boolean',
        'registered_at' => 'datetime',
        'registration_done' => 'boolean',
        'payment_done' => 'boolean',
        'seminar_proper_done' => 'boolean',
        'feedback_form_done' => 'boolean',
        'certificate_done' => 'boolean',
        'payment_date' => 'date',
        'amount_paid' => 'decimal:2',
    ];

    public function seminar(): BelongsTo
    {
        return $this->belongsTo(Seminar::class, 'seminar_id');
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(SeminarCertificate::class, 'seminar_participant_id');
    }

    public function evaluation(): HasOne
    {
        return $this->hasOne(SeminarEvaluation::class, 'participant_id');
    }

    /**
     * Overall lifecycle status, derived from the progress checklist rather than
     * stored independently — keeps the two from ever drifting out of sync.
     * ponytail: collapses the requirement doc's 7 suggested statuses to the 5
     * that are actually distinguishable from this checklist (Registered and
     * Completed aren't separable from Pending Payment / Certificate Sent here);
     * promote to a real state machine if that distinction becomes load-bearing.
     */
    public function getStatusAttribute(): string
    {
        if (! $this->payment_done) {
            return 'Pending Payment';
        }
        if (! $this->seminar_proper_done) {
            return 'Confirmed';
        }
        if (! $this->feedback_form_done) {
            return 'Attended';
        }
        if (! $this->certificate_done) {
            return 'Feedback Completed';
        }

        return 'Certificate Sent';
    }
}
