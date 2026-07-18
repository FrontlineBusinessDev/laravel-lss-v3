<?php

namespace App\Mail;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LeaveSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public LeaveRequest $leaveRequest,
    ) {}

    public function build(): self
    {
        $this->leaveRequest->loadMissing(['trainee', 'leaveCategory']);

        return $this
            ->subject('New leave request submitted')
            ->view('emails.leave.submitted')
            ->text('emails.leave.submitted-text')
            ->with(['leaveRequest' => $this->leaveRequest]);
    }
}
