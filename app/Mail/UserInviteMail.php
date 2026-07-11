<?php

// app/Mail/UserInviteMail.php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $resetUrl,
    ) {}

    public function build()
    {
        // Plain ->view() (not ->markdown()) — this is a fully custom, pre-styled
        // HTML table layout, not a markdown-component email, so we don't want
        // Laravel's default markdown theme CSS silently inlined on top of it.
        return $this
            ->subject('Set up your account')
            ->view('emails.users.invite')
            ->text('emails.users.invite-text')
            ->with([
                'user' => $this->user,
                'roleLabel' => $this->user->role?->label ?? 'Member',
                'resetUrl' => $this->resetUrl,
            ]);
    }
}
