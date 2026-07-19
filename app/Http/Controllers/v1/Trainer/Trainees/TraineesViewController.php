<?php

namespace App\Http\Controllers\v1\Trainer\Trainees;

use App\Http\Controllers\v1\BaseController;
use App\Http\Controllers\v1\Developer\Trainees\TraineeDocumentsController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\AcademicLearningOutcomes;
use App\Models\Trainees;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Trainer-facing trainee detail: Personal Info, Academic Info, Documents,
 * and Learning Outcomes tabs only — Ratings/Biometrics/Certificate/Payment
 * Details stay admin-only (Ratings has its own trainer module; the rest are
 * out of Phase-1 scope). Every entry point asserts the trainee's batch is
 * one of the trainer's assigned batches before rendering.
 */
class TraineesViewController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Trainees::class;

    protected string $view = 'trainer/trainees/show/PersonalInfoTab';

    public function personalInformationTab(int|string $id): mixed
    {
        return $this->renderTab('trainer/trainees/show/PersonalInfoTab', $id);
    }

    public function academicInfoTab(int|string $id): mixed
    {
        return $this->renderTab('trainer/trainees/show/AcademicInfoTab', $id);
    }

    public function documents(int|string $id): mixed
    {
        return $this->renderTab('trainer/trainees/show/DocumentsTab', $id);
    }

    public function learningOutcomes(int|string $id): mixed
    {
        return $this->renderTab('trainer/trainees/show/LearningOutcomesTab', $id);
    }

    /** Toggle a single learning outcome's achieved status for this trainee. */
    public function updateLearningOutcomeStatus(Request $request, int|string $id, int|string $outcomeId): JsonResponse
    {
        $trainee = Trainees::findOrFail($id);
        $this->assertBatchAssigned($trainee->batch_id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $outcome = AcademicLearningOutcomes::findOrFail($outcomeId);
        abort_if(
            $outcome->academic_industry_id !== $trainee->batch?->academic_industry_id,
            403,
            'This learning outcome does not belong to the trainee\'s industry.',
        );

        $trainee->learningOutcomes()->syncWithoutDetaching([
            $outcome->id => ['status' => $validated['status']],
        ]);

        return $this->sendResponse(['status' => $validated['status']], 'Learning outcome updated successfully.');
    }

    private function renderTab(string $view, int|string $id): mixed
    {
        $trainee = Trainees::query()
            ->with([
                'school:id,school_name',
                'batch:id,batch_code,date_started,setup,academic_industry_id,academic_program_id,academic_level_id',
                'batch.academicIndustry:id,name',
                'batch.academicProgram:id,name,course_name',
                'batch.academicLevel:id,name,year_level',
                'documents:id,trainee_id,status,document_type,original_name,file_name,file_path,mime_type,url_link,file_size,created_at',
                'learningOutcomes:id,learning_outcomes',
            ])
            ->findOrFail($id);

        $this->assertBatchAssigned($trainee->batch_id);

        /** @disregard P1013 */
        $user = auth()->user();

        $documentsController = new TraineeDocumentsController();
        $documents = $trainee->documents->map(fn($document) => $documentsController->transform($document));

        $achievedStatuses = $trainee->learningOutcomes->pluck('pivot.status', 'id');
        $outcomes = AcademicLearningOutcomes::query()
            ->where('academic_industry_id', $trainee->batch?->academic_industry_id)
            ->where('status', self::STATUS_ACTIVE)
            ->orderBy('learning_outcomes')
            ->get(['id', 'learning_outcomes'])
            ->map(fn($outcome) => [
                'id' => $outcome->id,
                'title' => $outcome->learning_outcomes,
                'status' => $achievedStatuses->get($outcome->id, 'inactive'),
            ]);

        return InertiaPageResponse::csr($view, [
            'user' => $user,
            'trainee' => [
                ...$trainee->toArray(),
                'name' => "{$trainee->first_name} {$trainee->last_name}",
                'outcomes' => $outcomes,
                'documents' => $documents,
            ],
        ]);
    }
}
