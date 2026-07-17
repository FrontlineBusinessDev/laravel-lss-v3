<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $resetUrl,
    ) {}

    public function build(): self
    {
        return $this
            ->subject('Reset your password')
            ->view('emails.auth.forgot-password')
            ->text('emails.auth.forgot-password-text')
            ->with([
                'user' => $this->user,
                'resetUrl' => $this->resetUrl,
            ]);
    }
}
