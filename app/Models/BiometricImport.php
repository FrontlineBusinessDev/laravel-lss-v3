<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BiometricImport extends Model
{
    protected $table = 'app_biometric_imports';

    protected $fillable = [
        'file_name',
        'imported_by_id',
        'total_rows',
        'success_count',
        'error_count',
        'status',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(BiometricRecord::class, 'biometric_import_id');
    }

    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by_id');
    }
}
