<?php

// app/Support/TicketClassifier.php

namespace App\Support;

class TicketClassifier
{
    public const PRIORITY_URGENT = 'urgent';

    public const PRIORITY_MEDIUM = 'medium';

    public const PRIORITY_LOW = 'low';

    /**
     * category slug => priority. Keys match dashboard-meta.ts's catMeta()
     * keys exactly, including its legacy aliases (problem/question/request/billing).
     */
    private const MAP = [
        'system_error' => self::PRIORITY_URGENT,
        'bug' => self::PRIORITY_URGENT,
        'account' => self::PRIORITY_URGENT,
        'feature' => self::PRIORITY_MEDIUM,
        'content' => self::PRIORITY_MEDIUM,
        'general' => self::PRIORITY_LOW,
        // Legacy aliases, so older-style category values still classify sanely.
        'problem' => self::PRIORITY_URGENT,
        'question' => self::PRIORITY_LOW,
        'request' => self::PRIORITY_MEDIUM,
        'billing' => self::PRIORITY_URGENT,
    ];

    /**
     * Auto-classify a ticket's priority from its category.
     * Falls back to the DB column's own default when the category is
     * missing or unrecognized.
     */
    public static function priorityForCategory(?string $category): string
    {
        return self::MAP[$category] ?? self::PRIORITY_MEDIUM;
    }

    /**
     * Sort rank per priority — lower sorts first (higher priority first).
     * For SQL ordering, see the literal CASE expression in
     * TicketsController::board() instead of interpolating this array.
     */
    public static function priorityRank(): array
    {
        return [
            self::PRIORITY_URGENT => 1,
            self::PRIORITY_MEDIUM => 2,
            self::PRIORITY_LOW => 3,
        ];
    }
}
