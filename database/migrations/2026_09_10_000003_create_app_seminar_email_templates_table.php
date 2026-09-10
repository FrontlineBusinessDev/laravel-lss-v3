<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Template management only for this pass (see plan) — no automatic send
 * triggers are wired to these yet. Seeded with the 6 fixed template keys
 * from the requirements doc so the admin UI isn't empty on first load;
 * copy carried over verbatim from the previous mock data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_seminar_email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('trigger_description');
            $table->string('subject');
            $table->text('body');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('app_seminar_email_templates')->insert([
            [
                'key' => 'acknowledgement',
                'name' => 'Registration Acknowledgement',
                'trigger_description' => 'Sent immediately after registration.',
                'subject' => 'We received your registration for {{seminarTopic}}',
                'body' => "Hi {{name}},\n\nThanks for registering for \"{{seminarTopic}}\" on {{seminarDate}}. We'll follow up shortly with payment instructions.\n\n— FBS Learning Solutions System",
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'payment_instructions',
                'name' => 'Payment Instructions',
                'trigger_description' => 'Sent when the admin requests payment.',
                'subject' => 'Complete your payment for {{seminarTopic}}',
                'body' => "Hi {{name}},\n\nPlease settle your registration fee of PHP {{fee}} for \"{{seminarTopic}}\" via GCash or bank transfer, then reply with your reference number.\n\n— FBS Learning Solutions System",
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'successful_registration',
                'name' => 'Successful Registration',
                'trigger_description' => 'Sent after payment confirmation.',
                'subject' => "You're confirmed for {{seminarTopic}}",
                'body' => "Hi {{name}},\n\nYour payment has been confirmed. You're officially registered for \"{{seminarTopic}}\" on {{seminarDate}} at {{venue}}. See you there!\n\n— FBS Learning Solutions System",
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'seminar_reminder',
                'name' => 'Seminar Reminder',
                'trigger_description' => 'Sent before the seminar date.',
                'subject' => 'Reminder: {{seminarTopic}} is coming up',
                'body' => "Hi {{name}},\n\nThis is a reminder that \"{{seminarTopic}}\" is happening on {{seminarDate}} at {{venue}}. See you soon!\n\n— FBS Learning Solutions System",
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'feedback_request',
                'name' => 'Feedback Form Request',
                'trigger_description' => 'Sent after the seminar.',
                'subject' => 'How was {{seminarTopic}}?',
                'body' => "Hi {{name}},\n\nThanks for attending \"{{seminarTopic}}\"! Please take a minute to complete the feedback form so we can issue your certificate.\n\n— FBS Learning Solutions System",
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'certificate_release',
                'name' => 'Certificate Release',
                'trigger_description' => "Sent when the participant's certificate is generated.",
                'subject' => 'Your certificate for {{seminarTopic}} is ready',
                'body' => "Hi {{name}},\n\nYour certificate of attendance for \"{{seminarTopic}}\" is attached. Congratulations on completing the seminar!\n\n— FBS Learning Solutions System",
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_seminar_email_templates');
    }
};
