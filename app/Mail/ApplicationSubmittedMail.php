<?php

namespace App\Mail;

use App\Models\Trainees;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ApplicationSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Trainees $trainee,
    ) {}

    public function build(): self
    {
        return $this
            ->subject('Your application has been submitted')
            ->view('emails.trainees.application-submitted')
            ->text('emails.trainees.application-submitted-text')
            ->with(['trainee' => $this->trainee]);
    }
}
