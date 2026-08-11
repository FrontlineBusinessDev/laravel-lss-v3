<?php

namespace App\Support;

use App\Models\Holiday;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Syncs public holidays from the free, no-API-key Nager.Date API
 * (https://date.nager.at) into app_holidays, so the dashboard calendar reads
 * from the local table rather than calling out on every page load. Never
 * throws — the dashboard/calendar must keep working even if the external
 * API is down; failures are logged and treated as "synced nothing".
 */
class HolidaySync
{
    public static function syncYear(int $year, ?string $countryCode = null): int
    {
        $countryCode = $countryCode ?? config('services.holiday_api.country', 'PH');

        try {
            $response = Http::timeout(10)->get("https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}");

            if (! $response->successful()) {
                Log::error('holiday sync failed', ['year' => $year, 'country' => $countryCode, 'status' => $response->status()]);

                return 0;
            }

            $synced = 0;
            foreach ($response->json() ?? [] as $entry) {
                if (! isset($entry['date'], $entry['name'])) {
                    continue;
                }

                Holiday::updateOrCreate(
                    ['date' => $entry['date'], 'name' => $entry['name'], 'country_code' => $countryCode],
                    ['source' => 'api'],
                );
                $synced++;
            }

            return $synced;
        } catch (Throwable $e) {
            Log::error('holiday sync failed', ['year' => $year, 'country' => $countryCode, 'message' => $e->getMessage()]);

            return 0;
        }
    }
}
