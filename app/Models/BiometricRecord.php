<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BiometricRecord extends Model
{
    protected $table = 'app_biometric_records';

    protected $fillable = [
        'trainee_id',
        'biometric_import_id',
        'date',
        'morning_time_in',
        'lunch_time_out',
        'afternoon_time_in',
        'day_time_out',
        'on_leave',
        'remarks',
    ];

    protected $casts = [
        'date' => 'date',
        'on_leave' => 'boolean',
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function import(): BelongsTo
    {
        return $this->belongsTo(BiometricImport::class, 'biometric_import_id');
    }
}
