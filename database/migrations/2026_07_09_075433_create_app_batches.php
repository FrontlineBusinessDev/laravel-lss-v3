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
        Schema::create('app_batches', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->string('batch_code')->unique();
            $table->string('public_url_id')->unique();
            $table->date('date_started');
            $table->string('setup', 50); // f2f or online
            $table->foreignId('academic_industry_id')->constrained('app_settings_academic_industry')->restrictOnDelete();
            $table->foreignId('academic_level_id')->constrained('app_settings_academic_level')->restrictOnDelete();
            $table->foreignId('academic_program_id')->constrained('app_settings_academic_program')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_batches');
    }
};
