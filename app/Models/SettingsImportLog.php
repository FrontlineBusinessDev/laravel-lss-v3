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
    ];

    protected $casts = [
        'warnings' => 'array',
    ];

    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by_id');
    }
}
