<?php

namespace App\Http\Controllers\v1\Concerns;

use Illuminate\Http\JsonResponse;

/**
 * The `{success, message, data}` / `{success, message, errors}` envelope
 * every controller was hand-rolling via response()->json(...). Extracted out
 * of BaseController so non-CRUD controllers (ApiController and its children)
 * can send the same shape without inheriting the full CRUD engine.
 */
trait JsonResponds
{
    protected function sendResponse(mixed $data, string $message = '', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    protected function sendError(string $message, array $errors = [], int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
    }
}
