<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CertificateTemplate extends Model
{
    protected $table = 'app_certificate_templates';

    protected $fillable = [
        'certificate_type',
        'name',
        'layout',
        'page_size',
        'orientation',
        'is_default',
        'status',
        'created_by',
    ];

    protected $casts = [
        'layout' => 'array',
        'is_default' => 'boolean',
    ];

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('certificate_type', $type);
    }
}
