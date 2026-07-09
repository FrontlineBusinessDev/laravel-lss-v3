<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_trainees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('app_batches')->restrictOnDelete();
            $table->foreignId('school_id')->constrained('app_settings_partner_schools')->restrictOnDelete();
            $table->string('public_url_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->date('birthday');
            $table->string('birth_place');
            $table->string('gender', 50); // male or female
            $table->string('mobile_number', 50);
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_number', 50);
            $table->decimal('required_hours', 5, 2);
            $table->date('date_completed')->nullable();
            $table->text('address');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_trainees');
    }
};
