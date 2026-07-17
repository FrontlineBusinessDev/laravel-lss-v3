<?php

namespace App\Providers;

use App\Models\AcademicIndustry;
use App\Models\AcademicLearningOutcomes;
use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\Batches;
use App\Models\PartnerSchools;
use App\Models\Trainees;
use App\Models\TraineeDocument;
use App\Models\User;
use App\Observers\AppLoggerObserver;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Role;

/**
 * Registers the audit observer against the domain models whose lifecycle should
 * be logged. Kept as an explicit allowlist (rather than a blanket global model
 * event) so framework/pivot/audit tables are never logged, and so the full set
 * of audited models is visible in one place. Add a model here to audit it.
 */
class ActivityLogServiceProvider extends ServiceProvider
{
    /** @var list<class-string<\Illuminate\Database\Eloquent\Model>> */
    private array $auditedModels = [
        Batches::class,
        User::class,
        Trainees::class,
        TraineeDocument::class,
        AcademicIndustry::class,
        AcademicLevel::class,
        AcademicProgram::class,
        AcademicLearningOutcomes::class,
        PartnerSchools::class,
        Role::class,
    ];

    public function boot(): void
    {
        foreach ($this->auditedModels as $model) {
            $model::observe(AppLoggerObserver::class);
        }
    }
}
