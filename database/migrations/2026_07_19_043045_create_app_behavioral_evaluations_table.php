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
        Schema::create('app_behavioral_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('app_batches')->restrictOnDelete();
            $table->foreignId('trainee_id')->constrained('app_trainees')->restrictOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->restrictOnDelete();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['batch_id', 'trainee_id'], 'app_behavioral_evaluations_unique_current');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_behavioral_evaluations');
    }
};
