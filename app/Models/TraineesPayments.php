<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TraineesPayments extends Model
{
    protected $table = 'app_trainees_payments';
    protected $fillable = [
        'trainee_id',
        'amount_paid',
        'payment_date',
        'reference_no',
        'notes',
        'official_receipt_number',
    ];

    protected $appends = ['receipt_view_url', 'receipt_download_url'];

    public function trainee()
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function getReceiptViewUrlAttribute(): ?string
    {
        return $this->resolveReceiptUrl();
    }

    public function getReceiptDownloadUrlAttribute(): ?string
    {
        return $this->resolveReceiptUrl();
    }

    private function resolveReceiptUrl(): ?string
    {
        if (! $this->receipt_path) {
            return null;
        }

        try {
            return Storage::temporaryUrl($this->receipt_path, now()->addMinutes(60));
        } catch (\RuntimeException $e) {
            return Storage::url($this->receipt_path);
        }
    }
}
