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
        Schema::create('app_task_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('app_batches')->restrictOnDelete();
            $table->string('task_name'); // free text — deduped task/project name within a batch, not FK'd to app_tasks
            $table->foreignId('trainee_id')->constrained('app_trainees')->restrictOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comments')->nullable();
            $table->foreignId('evaluator_id')->constrained('users')->restrictOnDelete();
            $table->date('rated_at');
            $table->timestamps();

            $table->unique(['batch_id', 'task_name', 'trainee_id'], 'app_task_ratings_unique_current');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_task_ratings');
    }
};
