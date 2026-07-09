<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Shared file-upload handling for Settings module controllers.
 *
 * Pairs with the frontend `type: 'file'` FieldDef, which sends:
 *
 *   single, new file picked     →  request->file($key)                  UploadedFile
 *   single, cleared by user     →  request->boolean("remove_{$key}")    true, no file present
 *   multiple, new files picked  →  request->file($key, [])              UploadedFile[]   (sent as "{$key}[]")
 *   multiple, removed existing  →  request->input("removed_{$key}", []) array of ids      (sent as "removed_{$key}[]")
 *
 * The request always arrives as multipart/form-data (browsers can't send
 * Files as JSON), POSTed with `_method` spoofing the real verb — so update()
 * methods still work normally, you don't need to special-case the verb here.
 *
 * Usage inside a controller's store()/update():
 *
 *   // single file field, e.g. 'avatar'
 *   if ($path = $this->storeUploadedFile($request, 'avatar', 'public', 'avatars')) {
 *       $this->deleteStoredFile($user->avatar_path); // drop the old one
 *       $user->avatar_path = $path;
 *   } elseif ($this->fileWasRemoved($request, 'avatar')) {
 *       $this->deleteStoredFile($user->avatar_path);
 *       $user->avatar_path = null;
 *   }
 *
 *   // multiple file field, e.g. 'attachments'
 *   foreach ($this->storeUploadedFiles($request, 'attachments', 'public', 'attachments') as $path) {
 *       $model->attachments()->create(['path' => $path]);
 *   }
 *   $model->attachments()->whereIn('id', $this->removedFileIds($request, 'attachments'))->get()
 *       ->each(function ($attachment) {
 *           $this->deleteStoredFile($attachment->path);
 *           $attachment->delete();
 *       });
 */
trait HandlesFileUploads
{
    /**
     * Store a single uploaded file (type: 'file', multiple: false).
     * Returns the stored path, or null if no new file was sent on this request.
     */
    protected function storeUploadedFile(
        Request $request,
        string $key,
        string $disk = 'public',
        string $directory = '',
    ): ?string {
        $file = $request->file($key);

        if (! $file instanceof UploadedFile) {
            return null;
        }

        return $file->store($directory ?: $key, $disk);
    }

    /**
     * Store every uploaded file for a multi-file field (type: 'file', multiple: true).
     * Returns the stored paths, in the same order they were uploaded.
     */
    protected function storeUploadedFiles(
        Request $request,
        string $key,
        string $disk = 'public',
        string $directory = '',
    ): array {
        $files = $request->file($key, []);

        return array_values(array_map(
            fn(UploadedFile $file) => $file->store($directory ?: $key, $disk),
            array_filter($files, fn($file) => $file instanceof UploadedFile),
        ));
    }

    /**
     * True only when the user explicitly cleared a single-file field
     * (ticked "remove" and did not pick a replacement in the same request).
     */
    protected function fileWasRemoved(Request $request, string $key): bool
    {
        return $request->boolean("remove_{$key}") && ! $request->hasFile($key);
    }

    /** Ids the user removed from a multi-file field's existing attachments. */
    protected function removedFileIds(Request $request, string $key): array
    {
        return $request->input("removed_{$key}", []);
    }

    /** Deletes a stored file from disk. Safe to call with null/missing paths. */
    protected function deleteStoredFile(?string $path, string $disk = 'public'): void
    {
        if ($path) Storage::disk($disk)->delete($path);
    }

    /**
     * Map of field name => storage subfolder.
     * Override in child controllers.
     * e.g. ['image' => 'partner-schools', 'attachment' => 'documents']
     */

    protected function beforeSave(array $validated, ?Model $model = null): array
    {
        $disk = config('filesystems.default');
        $projectFolder = env('AWS_S3_STORAGE', 'laravel-ls-system');

        foreach ($this->fileFieldFolders as $field => $folder) {
            $pointer = $field; // request field key
            $storagePath = $projectFolder . '/' . $folder; // e.g. laravel-ls-system/partner-school

            if ($path = $this->storeUploadedFile(request(), $pointer, $disk, $storagePath)) {
                if ($model?->{$field}) {
                    $this->deleteStoredFile($model->{$field}, $disk);
                }
                $validated[$field] = $path;
            } elseif ($this->fileWasRemoved(request(), $pointer)) {
                $this->deleteStoredFile($model?->{$field}, $disk);
                $validated[$field] = null;
            }
        }
        return $validated;
    }

    protected function transformFileUrls(Model $model): Model
    {
        if (empty($this->fileFields)) {
            return $model;
        }

        foreach ($this->fileFields as $field) {
            if (!empty($model->{$field})) {
                try {
                    $model->{$field} = Storage::temporaryUrl($model->{$field}, now()->addMinutes($this->fileUrlExpiry));
                } catch (\RuntimeException $e) {
                    // Driver doesn't support temporaryUrl (e.g. local/public)
                    $model->{$field} = Storage::url($model->{$field});
                }
            }
        }

        return $model;
    }
}
