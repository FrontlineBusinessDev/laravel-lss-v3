<?php

namespace App\Http\Controllers\v1\Trainer\Trainees;

use App\Http\Controllers\v1\BaseController;
use App\Http\Controllers\v1\Developer\Trainees\TraineeDocumentsController as AdminTraineeDocumentsController;
use App\Models\TraineeDocument;
use App\Models\Trainees;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Trainer-facing document upload/delete — same storage mechanics as the
 * admin controller (5MB cap, private disk, presigned URLs), guarded by
 * assertBatchAssigned() instead of the coarse `manage trainees` permission
 * the admin controller relies on.
 */
class TraineeDocumentsController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = TraineeDocument::class;

    private const DOCUMENT_TYPES = [
        'resume',
        'endorsement-letter',
        'moa',
        'liability-waiver',
        'scanned-evaluations',
    ];

    public function uploadDocument(Request $request, int|string $traineeId): JsonResponse
    {
        $trainee = $this->resolveTrainee($traineeId);

        $validated = $request->validate([
            'document_type' => ['required', 'string', Rule::in(self::DOCUMENT_TYPES)],
            'file' => ['required_without:url_link', 'nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'],
            'url_link' => ['required_without:file', 'nullable', 'url', 'max:2048'],
        ]);

        $disk = config('filesystems.default');
        $document = new TraineeDocument([
            'status' => self::STATUS_ACTIVE,
            'trainee_id' => $trainee->id,
            'document_type' => $validated['document_type'],
        ]);

        if ($request->hasFile('file')) {
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

        $transform = new AdminTraineeDocumentsController();

        return $this->sendResponse($transform->transform($document), 'Document uploaded successfully.', 201);
    }

    public function deleteDocument(int|string $traineeId, int|string $documentId): JsonResponse
    {
        $trainee = $this->resolveTrainee($traineeId);

        $document = TraineeDocument::where('trainee_id', $trainee->id)->findOrFail($documentId);

        if ($document->file_path) {
            $this->deleteStoredFile($document->file_path, config('filesystems.default'));
        }
        $document->delete();

        return response()->json(null, 204);
    }

    private function resolveTrainee(int|string $traineeId): Trainees
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->assertBatchAssigned($trainee->batch_id);

        return $trainee;
    }
}
