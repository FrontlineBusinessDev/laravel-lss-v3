<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveCategory extends Model
{
    protected $table = 'app_leave_categories';

    protected $fillable = [
        'status',
        'name',
        'max_days',
        'max_instances',
    ];

    protected $casts = [
        'max_days' => 'integer',
        'max_instances' => 'integer',
    ];

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class, 'leave_category_id');
    }
}
