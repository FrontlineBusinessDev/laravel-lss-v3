<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettingsImportLog extends Model
{
    protected $table = 'app_settings_import_logs';

    protected $fillable = [
        'type',
        'file_name',
        'imported_by_id',
        'total_rows',
        'success_count',
        'error_count',
        'status',
        'warnings',
        'created_ids',
        'rolled_back_at',
        'rolled_back_by_id',
    ];

    protected $casts = [
        'warnings' => 'array',
        'created_ids' => 'array',
        'rolled_back_at' => 'datetime',
    ];

    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by_id');
    }

    public function rolledBackBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rolled_back_by_id');
    }
}
