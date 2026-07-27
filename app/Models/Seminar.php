<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seminar extends Model
{
    use HasFactory;
    protected $table = 'app_seminars';

    protected $fillable = [
        'topic',
        'description',
        'date',
        'venue',
        'fee',
        'max_participants',
        'status',
        'type',
        'registration_link',
    ];

    protected $casts = [
        'date' => 'date',
        'fee' => 'decimal:2',
    ];

    public function participants(): HasMany
    {
        return $this->hasMany(SeminarParticipant::class, 'seminar_id');
    }
}
