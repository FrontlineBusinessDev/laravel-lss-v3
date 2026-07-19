<?php

namespace App\Support;

use App\Models\BiometricRecord;
use Carbon\Carbon;

/**
 * Shared attendance math for a 4-checkpoint daily biometric log, reused by
 * both the Admin biometrics list/print and the trainee detail tab so hours
 * and missing-punch exceptions are computed identically everywhere.
 */
class BiometricHours
{
    /**
     * Morning half-day (morning in -> lunch out) plus afternoon half-day
     * (afternoon in -> day out). A missing punch on either side of a half-day
     * contributes 0 hours for that half rather than throwing.
     */
    public static function totalHours(BiometricRecord $record): float
    {
        if ($record->on_leave) {
            return 0.0;
        }

        $morning = self::diffHours($record->morning_time_in, $record->lunch_time_out);
        $afternoon = self::diffHours($record->afternoon_time_in, $record->day_time_out);

        return round($morning + $afternoon, 2);
    }

    /**
     * @return array<int, string>
     */
    public static function exceptions(BiometricRecord $record): array
    {
        if ($record->on_leave) {
            return [];
        }

        $labels = [
            'morning_time_in' => 'Missing morning time in',
            'lunch_time_out' => 'Missing lunch out',
            'afternoon_time_in' => 'Missing after lunch time in',
            'day_time_out' => 'Missing day time out',
        ];

        $missing = [];
        foreach ($labels as $field => $label) {
            if (empty($record->{$field})) {
                $missing[] = $label;
            }
        }

        return $missing;
    }

    private static function diffHours(?string $start, ?string $end): float
    {
        if (empty($start) || empty($end)) {
            return 0.0;
        }

        $startTime = Carbon::createFromFormat('H:i:s', self::normalizeTime($start));
        $endTime = Carbon::createFromFormat('H:i:s', self::normalizeTime($end));

        if (! $startTime || ! $endTime || $endTime->lessThanOrEqualTo($startTime)) {
            return 0.0;
        }

        return $startTime->diffInMinutes($endTime) / 60;
    }

    private static function normalizeTime(string $value): string
    {
        return strlen($value) === 5 ? "{$value}:00" : $value;
    }
}
