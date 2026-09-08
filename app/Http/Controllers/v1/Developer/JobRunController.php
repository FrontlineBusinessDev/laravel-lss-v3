<?php

namespace App\Http\Controllers\v1\Developer;

use App\Http\Controllers\v1\Controller;
use App\Models\JobRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

/**
 * Generic status/cancel endpoints for any queued job tracked via JobRun —
 * polled by the frontend's reusable progress-toast system (see
 * resources/js/components/AsyncOperations.tsx / useAsyncJobs()). Not scoped
 * to Tasks specifically; any future queued bulk action reuses the same two
 * routes by dispatching its own job and creating a JobRun row.
 */
class JobRunController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(['auth']),
        ];
    }

    public function show(string $id): JsonResponse
    {
        $jobRun = JobRun::where('user_id', auth()->id())->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $jobRun->id,
                'status' => $jobRun->status,
                'total' => $jobRun->total,
                'processed' => $jobRun->processed,
                'result' => $jobRun->result,
                'error' => $jobRun->error,
            ],
        ]);
    }

    public function cancel(string $id): JsonResponse
    {
        $jobRun = JobRun::where('user_id', auth()->id())->findOrFail($id);

        if (in_array($jobRun->status, ['queued', 'running'], true)) {
            $jobRun->update(['status' => 'cancelled']);
        }

        return response()->json(['success' => true, 'data' => null]);
    }
}
