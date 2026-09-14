<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Admin-facing "notify me when..." toggles from the Email Notifications tab. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_seminar_admin_alert_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->string('description');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('app_seminar_admin_alert_settings')->insert([
            [
                'key' => 'new_registration',
                'label' => 'New registration received',
                'description' => 'Notify all active admin users when a new registration is received.',
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'feedback_submitted',
                'label' => 'Feedback form submitted',
                'description' => 'Notify admins when a participant submits a feedback form.',
                'enabled' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'capacity_reached',
                'label' => 'Seminar capacity reached',
                'description' => 'Notify admins when a seminar reaches its maximum number of participants.',
                'enabled' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_seminar_admin_alert_settings');
    }
};
