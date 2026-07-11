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
        // View names map to resources/views/users/invite{,-text}.blade.php.
        return $this
            ->subject('Set up your account')
            ->view('users.invite')
            ->text('users.invite-text')
            ->with([
                'user' => $this->user,
                // User has no singular `role` relation — read the Spatie role name.
                'roleLabel' => ucfirst($this->user->getRoleNames()->first() ?? 'Member'),
                'resetUrl' => $this->resetUrl,
            ]);
    }
}
