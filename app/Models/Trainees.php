<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Trainees extends Model
{
    use HasFactory;
    protected $guarded = [];
    protected $table = 'app_trainees';

    protected $appends = ['avatar_url', 'initials', 'total_paid', 'outstanding_balance'];

    protected $fillable = [
        'status',
        'user_id',
        'batch_id',
        'school_id',
        'avatar_path',
        'public_url_id',
        'first_name',
        'last_name',
        'email',
        'birthday',
        'birth_place',
        'gender',
        'mobile_number',
        'landline_number',
        'emergency_contact_name',
        'emergency_contact_number',
        'required_hours',
        'completed_hours',
        'date_completed',
        'termination_remarks',
        'address',
        'override_rate_per_hour',
        'override_hours_discount_percent',
        'override_group_discount_percent',
        'applied_rate_per_hour',
        'hours_discount_percent',
        'group_discount_percent',
        'gross_amount',
        'total_discount_amount',
        'net_amount_required',
    ];

    protected $casts = [
        'birthday' => 'date',
        'date_completed' => 'date',
        'required_hours' => 'decimal:2',
        'completed_hours' => 'decimal:2',
        'override_rate_per_hour' => 'decimal:2',
        'override_hours_discount_percent' => 'decimal:2',
        'override_group_discount_percent' => 'decimal:2',
        'applied_rate_per_hour' => 'decimal:2',
        'hours_discount_percent' => 'decimal:2',
        'group_discount_percent' => 'decimal:2',
        'gross_amount' => 'decimal:2',
        'total_discount_amount' => 'decimal:2',
        'net_amount_required' => 'decimal:2',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function payments()
    {
        return $this->hasMany(TraineesPayments::class, 'trainee_id');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(PartnerSchools::class, 'school_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TraineeDocument::class, 'trainee_id');
    }

    public function learningOutcomes(): BelongsToMany
    {
        return $this->belongsToMany(
            AcademicLearningOutcomes::class,
            'app_trainees_learning_outcomes',
            'trainee_id',
            'learning_outcome_id',
        )
            ->withPivot('status')
            ->using(TraineeLearningOutcome::class)
            ->withTimestamps();
    }
    /** Presigned (or public) URL for the stored avatar, null when none is set. */
    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if (! $this->avatar_path) {
                    return null;
                }
                try {
                    return Storage::temporaryUrl($this->avatar_path, now()->addMinutes(60));
                } catch (\RuntimeException $e) {
                    return Storage::url($this->avatar_path);
                }
            },
        );
    }
    /** Two-letter initials derived from first/last name, e.g. "John Doe" -> "JD". */
    protected function initials(): Attribute
    {
        return Attribute::make(
            get: fn(): string => strtoupper(mb_substr($this->first_name ?? '', 0, 1))
                . strtoupper(mb_substr($this->last_name ?? '', 0, 1)),
        );
    }
    /** Calculations & Accessors */
    public function getTotalPaidAttribute()
    {
        return $this->payments()->sum('amount_paid');
    }
    public function getOutstandingBalanceAttribute()
    {
        return max(0, $this->net_amount_required - $this->total_paid);
    }
}
