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
        Schema::create('app_settings_academic_learning_outcomes', function (Blueprint $table) {
            $table->id();
            $table->text('learning_outcomes');
            $table->foreignId('academic_industry_id')->constrained('app_settings_academic_industry')->restrictOnDelete();
            $table->foreignId('academic_program_id')->constrained('app_settings_academic_program')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings_academic_learning_outcomes');
    }
};
