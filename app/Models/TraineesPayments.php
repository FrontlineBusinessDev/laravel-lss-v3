<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TraineesPayments extends Model
{
    protected $table = 'app_trainee_payments';
    protected $fillable = ['trainee_id', 'amount_paid', 'payment_date', 'reference_no', 'notes'];

    public function trainee()
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }
}
