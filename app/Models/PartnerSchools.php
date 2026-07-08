<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class PartnerSchools extends Model
{
    use HasRoles;
    protected $table = 'app_settings_partner_schools';
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['name', 'status', 'abbreviation', 'email', 'contact', 'image', 'physical_address'];
    /**
     * Columns available for per-column dropdown / exact filtering.
     * These will be sent to the frontend so it knows which column headers get a filter control.
     */
    protected array $filterable = [
        'name',
        'status',
        'abbreviation',
        'contact',
        'email',
        'physical_address',
    ];
    /**
     * Columns included in the global search (LIKE %term%).
     * These will be sent to the frontend so it knows which columns are searched.
     */
    protected array $searchable = [
        'name',
        'status',
        'abbreviation',
        'contact',
        'email',
        'physical_address',
    ];
}
