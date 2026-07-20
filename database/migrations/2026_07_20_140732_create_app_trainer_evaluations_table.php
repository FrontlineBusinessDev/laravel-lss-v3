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
        Schema::create('app_trainer_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('app_batches')->restrictOnDelete();
            $table->foreignId('trainee_id')->constrained('app_trainees')->restrictOnDelete();
            // The trainer being evaluated — trainers are Users with the
            // `trainer` role (see App\Traits\ScopesToAssignedBatches).
            $table->foreignId('trainer_id')->constrained('users')->restrictOnDelete();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            // One evaluation per trainee->trainer per batch — blocks duplicate
            // submissions (Milestone 4's trainee-portal gateway relies on this).
            $table->unique(['batch_id', 'trainee_id', 'trainer_id'], 'app_trainer_evaluations_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_trainer_evaluations');
    }
};
