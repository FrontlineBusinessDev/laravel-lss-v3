<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainees extends Model
{
    use HasFactory;

    protected $table = 'app_trainees';

    protected $fillable = [
        'status',
        'batch_id',
        'school_id',
        'public_url_id',
        'first_name',
        'last_name',
        'email',
        'birthday',
        'birth_place',
        'gender',
        'mobile_number',
        'landline_number',
        'emergency_contact_name',
        'emergency_contact_number',
        'required_hours',
        'completed_hours',
        'date_completed',
        'termination_remarks',
        'address',
    ];

    protected $casts = [
        'birthday' => 'date',
        'date_completed' => 'date',
        'required_hours' => 'decimal:2',
        'completed_hours' => 'decimal:2',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(PartnerSchools::class, 'school_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TraineeDocument::class, 'trainee_id');
    }
}
