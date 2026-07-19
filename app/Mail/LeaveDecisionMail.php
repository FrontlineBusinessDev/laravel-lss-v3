<?php

namespace App\Mail;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LeaveDecisionMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public LeaveRequest $leaveRequest,
    ) {}

    public function build(): self
    {
        $this->leaveRequest->loadMissing(['trainee', 'leaveCategory']);
        $approved = $this->leaveRequest->status === 'approved';

        return $this
            ->subject($approved ? 'Your leave request was approved' : 'Your leave request was declined')
            ->view('emails.leave.decision')
            ->text('emails.leave.decision-text')
            ->with([
                'leaveRequest' => $this->leaveRequest,
                'approved' => $approved,
            ]);
    }
}
