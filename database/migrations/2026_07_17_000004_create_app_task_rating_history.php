<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Append-only audit trail — one row per rating save, immutable
     * (no updated_at, see TaskRatingHistory::UPDATED_AT = null).
     */
    public function up(): void
    {
        Schema::create('app_task_rating_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_rating_id')->constrained('app_task_ratings')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comments')->nullable();
            $table->foreignId('evaluator_id')->constrained('users')->restrictOnDelete();
            $table->date('rated_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['task_rating_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_task_rating_history');
    }
};
