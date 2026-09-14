<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** Ad-hoc "send test email" for the Seminar Email Notifications template editor — not a lifecycle trigger. */
class SeminarTemplateTestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private readonly string $renderedSubject, private readonly string $renderedBody)
    {
    }

    public function build(): self
    {
        return $this->subject("[Test] {$this->renderedSubject}")
            ->html(nl2br(e($this->renderedBody)));
    }
}
