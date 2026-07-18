<?php

namespace App\Mail;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AnnouncementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Announcement $announcement,
    ) {}

    public function build(): self
    {
        return $this
            ->subject($this->announcement->subject)
            ->view('emails.announcements.published')
            ->text('emails.announcements.published-text')
            ->with(['announcement' => $this->announcement]);
    }
}
