<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\TraineeDocument;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class TraineeDocumentsController extends BaseController
{
    protected string $model = TraineeDocument::class;
    protected string $view = 'developer/trainees/show/DocumentsTab';
    // Presigned view/download URLs are built manually in transform() below
    // (two derived URLs per row, not a single file column), so this stays empty.
    protected array $fileFields = [];

    private const DOCUMENT_TYPES = [
        'resume',
        'endorsement-letter',
        'moa',
        'liability-waiver',
        'scanned-evaluations',
    ];

    public function uploadDocument(Request $request, int|string $traineeId): JsonResponse
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->authorize('update', $trainee);

        $validated = $request->validate([
            'document_type' => ['required', 'string', Rule::in(self::DOCUMENT_TYPES)],
            'file' => ['required_without:url_link', 'nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
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

        return $this->sendResponse($this->transform($document), 'Document uploaded successfully.', 201);
    }

    public function deleteDocument(int|string $traineeId, int|string $documentId): JsonResponse
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->authorize('update', $trainee);

        $document = TraineeDocument::where('trainee_id', $trainee->id)->findOrFail($documentId);

        if ($document->file_path) {
            $this->deleteStoredFile($document->file_path, config('filesystems.default'));
        }
        $document->delete();

        return response()->json(null, 204);
    }

    /** Serialize a document with presigned view/download URLs for a private upload, or its raw link. */
    public function transform(TraineeDocument $document): array
    {
        $url = null;
        if ($document->file_path) {
            try {
                $url = Storage::temporaryUrl($document->file_path, now()->addMinutes($this->fileUrlExpiry));
            } catch (\RuntimeException $e) {
                $url = Storage::url($document->file_path);
            }
        }

        return [
            ...$document->toArray(),
            'view_url' => $url ?? $document->url_link,
            'download_url' => $url ?? $document->url_link,
        ];
    }
}
