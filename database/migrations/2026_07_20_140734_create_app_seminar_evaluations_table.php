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
        Schema::create('app_seminar_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seminar_id')->constrained('app_seminars')->restrictOnDelete();
            // The attendee submitting the evaluation.
            $table->foreignId('participant_id')->constrained('app_seminar_participants')->restrictOnDelete();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['seminar_id', 'participant_id'], 'app_seminar_evaluations_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_seminar_evaluations');
    }
};
