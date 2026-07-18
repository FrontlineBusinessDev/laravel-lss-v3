<?php

namespace App\Http\Controllers\v1;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Polled in-app notification feed (no broadcasting infra — TopBar/NotificationBell
 * refetches this on an interval). Every action is scoped to the authenticated
 * user's own rows; there is no cross-user access here. Shared across every
 * role, so it doesn't extend any role-scoped base controller.
 */
class NotificationController
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $unreadCount = Notification::where('user_id', $userId)->whereNull('read_at')->count();
        $notifications = Notification::where('user_id', $userId)
            ->orderByRaw('read_at IS NOT NULL')
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, int|string $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->update(['read_at' => now()]);

        return response()->json(['success' => true, 'data' => $notification]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
