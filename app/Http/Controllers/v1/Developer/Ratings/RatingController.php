<?php

namespace App\Http\Controllers\v1\Developer\Ratings;

use App\Http\Controllers\v1\Developer\Controller;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RatingController extends Controller
{
    /**
     * Behavioral Rating — questions/answers still live client-side in
     * resources/js/data/mockData.ts (see that file's docblock), but the
     * batch/trainee selection is real/DB-backed via trainees() below,
     * mirroring TaskRatingController::trainees().
     */
    public function index(): Response
    {
        return Inertia::render('developer/ratings/behavioral-rating')->asCsr();
    }

    /** Active trainees in a batch, for the behavioral evaluation table. */
    public function trainees(Request $request): JsonResponse
    {
        $validated = $request->validate(['batch_id' => ['required', 'integer', 'exists:app_batches,id']]);

        $trainees = Trainees::where('batch_id', $validated['batch_id'])
            ->where('status', 'active')
            ->with('school:id,school_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'school_id']);

        return response()->json(['data' => $trainees]);
    }
}
