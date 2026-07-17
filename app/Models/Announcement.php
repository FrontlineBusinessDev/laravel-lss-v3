<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'app_announcement';

    protected $fillable = [
        'status',
        'subject',
        'description',
        'audience',
    ];
}
