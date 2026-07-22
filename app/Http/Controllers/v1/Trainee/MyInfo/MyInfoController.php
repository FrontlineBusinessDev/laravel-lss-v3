<?php

namespace App\Http\Controllers\v1\Trainee\MyInfo;

use App\Http\Controllers\v1\Developer\Trainees\TraineeDocumentsController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\AcademicLearningOutcomes;
use App\Models\TraineeDocument;
use App\Models\Trainees;
use App\Support\RequiredDocumentTypes;
use App\Support\Statuses;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Trainee self-service "My Info" page — read-only mirror of the developer
 * trainee-detail view, scoped to the logged-in trainee's own record. Only
 * document uploads for the three types below are writable; everything else
 * (profile fields, academic info, payments, ratings, certificate) is
 * display-only, matching TraineesPolicy::viewOwn()/uploadOwnDocument().
 */
class MyInfoController
{
    use AuthorizesRequests;

    private const UPLOADABLE_DOCUMENT_TYPES = RequiredDocumentTypes::TYPES;

    public function index(): mixed
    {
        $trainee = $this->resolveOwnTrainee();
        $this->authorize('viewOwn', $trainee);

        $trainee->load([
            'school:id,school_name',
            'academicLevel:id,name',
            'batch:id,batch_code,date_started,setup,academic_industry_id,academic_program_id',
            'batch.academicIndustry:id,name',
            'batch.academicProgram:id,name',
            'documents:id,trainee_id,status,document_type,original_name,file_name,file_path,mime_type,url_link,file_size,created_at',
            'learningOutcomes:id,learning_outcomes',
            'payments',
            'certificate.citation:id,name',
            // Aggregate-only view (per RBAC decision: trainees see hours/task-
            // completion badges, not per-task score/comments/evaluator).
            'taskRatings:id,trainee_id,rating,rated_at',
        ]);
        // Use loadSum on an already existing model instance
        $trainee->loadSum(['tasks' => function ($query) {
            $query->where('status', 'completed');
        }], 'time_spent');

        $documentsController = new TraineeDocumentsController();
        $documents = $trainee->documents->map(fn ($document) => $documentsController->transform($document));

        $achievedStatuses = $trainee->learningOutcomes->pluck('pivot.status', 'id');
        $outcomes = AcademicLearningOutcomes::query()
            ->where('academic_industry_id', $trainee->batch?->academic_industry_id)
            ->where('status', Statuses::ACTIVE)
            ->orderBy('learning_outcomes')
            ->get(['id', 'learning_outcomes'])
            ->map(fn ($outcome) => [
                'id' => $outcome->id,
                'title' => $outcome->learning_outcomes,
                'status' => $achievedStatuses->get($outcome->id, 'inactive'),
            ]);

        return InertiaPageResponse::csr('trainee/my-info/index', [
            'trainee' => [
                ...$trainee->toArray(),
                'name' => trim("{$trainee->first_name} {$trainee->last_name}"),
                'outcomes' => $outcomes,
                'documents' => $documents,
            ],
            'uploadableDocumentTypes' => self::UPLOADABLE_DOCUMENT_TYPES,
        ]);
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $trainee = $this->resolveOwnTrainee();

        $validated = $request->validate([
            'document_type' => ['required', 'string', Rule::in(self::UPLOADABLE_DOCUMENT_TYPES)],
            'file' => ['required_without:url_link', 'nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'],
            'url_link' => ['required_without:file', 'nullable', 'url', 'max:2048'],
        ]);

        $this->authorize('uploadOwnDocument', [$trainee, $validated['document_type']]);

        $document = new TraineeDocument([
            'status' => Statuses::ACTIVE,
            'trainee_id' => $trainee->id,
            'document_type' => $validated['document_type'],
        ]);

        if ($request->hasFile('file')) {
            $disk = config('filesystems.default');
            $file = $request->file('file');
            $folder = env('AWS_S3_STORAGE', 'laravel-ls-system') . '/trainee-documents';
            $document->file_path = Storage::disk($disk)->putFile($folder, $file, 'private');
            $document->original_name = $file->getClientOriginalName();
            $document->file_name = basename($document->file_path);
            $document->mime_type = $file->getClientMimeType();
            $document->file_size = $file->getSize();
        } else {
            $document->url_link = $validated['url_link'];
        }

        $document->save();

        $documentsController = new TraineeDocumentsController();

        return response()->json([
            'data' => $documentsController->transform($document),
            'message' => 'Document uploaded successfully.',
        ], 201);
    }

    public function deleteDocument(int|string $documentId): JsonResponse
    {
        $trainee = $this->resolveOwnTrainee();
        $document = TraineeDocument::where('trainee_id', $trainee->id)->findOrFail($documentId);

        $this->authorize('deleteOwnDocument', [$trainee, $document->document_type]);

        if ($document->file_path) {
            Storage::disk(config('filesystems.default'))->delete($document->file_path);
        }
        $document->delete();

        return response()->json(null, 204);
    }

    private function resolveOwnTrainee(): Trainees
    {
        return Trainees::where('user_id', auth()->id())->firstOrFail();
    }
}
