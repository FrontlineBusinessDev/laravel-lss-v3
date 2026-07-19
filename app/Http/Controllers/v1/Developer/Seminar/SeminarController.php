<?php

namespace App\Http\Controllers\v1\Developer\Seminar;

use App\Http\Controllers\v1\Controller;
use App\Models\Seminar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SeminarController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('developer/seminars/index')->asCsr();
    }

    /**
     * Minimal lookup feed for the Seminar Certificate page's async filter.
     * Full seminar management (create/register) isn't built yet, so this
     * table is expected to be empty until that module exists.
     */
    public function lookup(Request $request): JsonResponse
    {
        $q = $request->string('q')->toString();

        $query = Seminar::query()
            ->when($q !== '', fn($query) => $query->where('topic', 'like', "%{$q}%"))
            ->orderBy('topic');

        $paginator = $query->paginate(
            perPage: (int) $request->input('per_page', 20),
            columns: ['id', 'topic'],
            page: (int) $request->input('page', 1),
        );

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }
}
