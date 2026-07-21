<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Thin wrapper around the incoming Google Chat webhook
 * (services.google_chat.webhook_url) shared by HourThresholdDispatcher's
 * automatic one-shot alert and the Evaluation Overview's manual reminder tool.
 * No-ops silently when the webhook isn't configured.
 */
class GoogleChatAlert
{
    public static function send(string $text): void
    {
        $webhookUrl = config('services.google_chat.webhook_url');
        if (! $webhookUrl) {
            return;
        }

        try {
            Http::timeout(5)->post($webhookUrl, ['text' => $text]);
        } catch (Throwable $e) {
            Log::error('google chat alert failed', ['message' => $e->getMessage()]);
        }
    }
}
