<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\BaseController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\AcademicLearningOutcomes;
use App\Models\Trainees;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TraineesViewController extends BaseController
{
    use AuthorizesRequests;
    protected string $model = Trainees::class;
    protected string $view = 'developer/trainees/show/PersonalInfoTab';

    /** PersonalInformationTab tab — the default batch landing page (GET /trainees/{id}). */
    public function personalInformationTab(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/PersonalInfoTab', $id);
    }
    /** academic info tab (GET /trainees/{id}/academic-info). */
    public function academicInfoTab(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/AcademicInfoTab', $id);
    }
    /** documents tab (GET /trainees/{id}/documents). */
    public function documents(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/DocumentsTab', $id);
    }
    /** learning outcomes (GET /trainees/{id}/learning-outcomes). */
    public function learningOutcomes(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/LearningOutcomesTab', $id);
    }
    /** payment details (GET /trainees/{id}/payment-details). */
    public function paymentDetails(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/PaymentDetailsTab', $id);
    }
    /** ratings  (GET /trainees/{id}/ratings). */
    public function ratings(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/RatingsTab', $id);
    }
    /** certificate  (GET /trainees/{id}/certificate). */
    public function certificate(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/CertificateTab', $id);
    }
    /** biometrics  (GET /trainees/{id}/biometrics). */
    public function biometrics(int|string $id): mixed
    {
        return $this->renderTab('developer/trainees/show/BiometricsTab', $id);
    }
    // public function index(Request $request): mixed
    // {
    //     return Inertia::render('developer/trainees/show/detail')->asCsr();
    // }
    // /**
    //  * The id is looked up client-side against resources/js/data/mockData.ts
    //  * (see TraineesContext) — no trainees table exists yet.
    //  */
    // public function show(int|string $id): mixed
    // {
    //     return Inertia::render('developer/trainees/show/detail', ['id' => $id])->asCsr();
    // }
    /**
     * Load the trainees with its display relations and hand the
     * common props to the requested tab component.
     */
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
                'payments', 
                'user:id,first_name,last_name,email,status',
                'taskRatings:id,batch_id,trainee_id,task_name,rating,comments,evaluator_id,rated_at',
                'taskRatings.batch:id,batch_code',
                'taskRatings.evaluator:id,first_name,last_name',
                'behavioralEvaluations:id,batch_id,trainee_id,evaluator_id,total_score,remarks,updated_at',
                'behavioralEvaluations.evaluator:id,first_name,last_name',
                'behavioralEvaluations.answers:id,evaluation_id,question_id,score,text_answer',
                'behavioralEvaluations.answers.question:id,section,question,type',
            ])
            ->withSum(['tasks' => function ($query) {
                $query->where('status', 'completed');
                }], 'time_spent')
            ->findOrFail($id);

        $name = $trainee['first_name'] . " " . $trainee['last_name'];
        $this->authorize('view', $trainee);
        /** @disregard P1013 */
        $user = auth()->user();

        $documentsController = new TraineeDocumentsController();
        $documents = $trainee->documents->map(fn($document) => $documentsController->transform($document));

        // Full outcome catalog for the trainee's industry, each flagged with
        // this trainee's achieved status (defaults to 'inactive' if never toggled).
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
                'name' => $name,
                'outcomes' => $outcomes,
                'documents' => $documents,
            ]
        ]);
    }
}
