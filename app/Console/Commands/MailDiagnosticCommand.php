<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

#[Signature('mail:diagnose {to : Email address to send the test message to}')]
#[Description('Sends a one-off test email and logs success/failure, to isolate SMTP config issues from queue/scheduler issues in production.')]
class MailDiagnosticCommand extends Command
{
    public function handle(): int
    {
        $to = $this->argument('to');

        $this->info("Mailer: " . config('mail.default'));
        $this->info("Sending a synchronous (non-queued) test email to {$to}...");

        try {
            Mail::raw(
                'This is a test email from ' . config('app.name') . ' sent via `php artisan mail:diagnose` at ' . now()->toDateTimeString() . '.',
                function (Message $message) use ($to) {
                    $message->to($to)->subject('Mail diagnostic test');
                },
            );

            $this->info('Sent successfully. If MAIL_MAILER=log, check storage/logs/laravel.log instead of an inbox.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            Log::error('Mail diagnostic test failed', [
                'to' => $to,
                'mailer' => config('mail.default'),
                'message' => $e->getMessage(),
            ]);

            $this->error("Failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }
}
