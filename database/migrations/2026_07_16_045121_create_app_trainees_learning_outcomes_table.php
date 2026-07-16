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
        Schema::create('app_trainees_learning_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_id')->constrained('app_trainees')->cascadeOnDelete();
            $table->foreignId('learning_outcome_id')->constrained('app_settings_academic_learning_outcomes')->cascadeOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('inactive');
            $table->timestamps();

            $table->unique(['trainee_id', 'learning_outcome_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_trainees_learning_outcomes');
    }
};
