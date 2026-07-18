<?php

namespace App\Mail;

use App\Models\Batches;
use App\Models\Trainees;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewApplicationAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Trainees $trainee,
        public Batches $batch,
    ) {}

    public function build(): self
    {
        return $this
            ->subject('New trainee application received')
            ->view('emails.trainees.new-application-admin')
            ->text('emails.trainees.new-application-admin-text')
            ->with([
                'trainee' => $this->trainee,
                'batch' => $this->batch,
                'reviewUrl' => route('trainees.personalInformationTab', $this->trainee->id),
            ]);
    }
}
