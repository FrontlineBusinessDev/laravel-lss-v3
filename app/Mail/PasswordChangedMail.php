<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
    ) {}

    public function build(): self
    {
        return $this
            ->subject('Your password was changed')
            ->view('emails.auth.password-changed')
            ->text('emails.auth.password-changed-text')
            ->with(['user' => $this->user]);
    }
}
