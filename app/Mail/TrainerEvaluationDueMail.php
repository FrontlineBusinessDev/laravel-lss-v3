<?php

namespace App\Mail;

use App\Models\Trainees;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TrainerEvaluationDueMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Trainees $trainee,
    ) {}

    public function build(): self
    {
        return $this
            ->subject('Your trainer evaluation is now due')
            ->view('emails.evaluation.trainer-evaluation-due')
            ->text('emails.evaluation.trainer-evaluation-due-text')
            ->with(['trainee' => $this->trainee]);
    }
}
