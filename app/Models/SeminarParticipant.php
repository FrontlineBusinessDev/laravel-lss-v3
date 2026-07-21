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
    ];

    protected $casts = [
        'is_student' => 'boolean',
        'registered_at' => 'datetime',
    ];

    public function seminar(): BelongsTo
    {
        return $this->belongsTo(Seminar::class, 'seminar_id');
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(SeminarCertificate::class, 'seminar_participant_id');
    }
}
