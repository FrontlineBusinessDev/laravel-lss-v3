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
        Schema::create('app_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('open'); // open | completed | locked
            $table->foreignId('batch_id')->constrained('app_batches')->restrictOnDelete();
            $table->foreignId('trainee_id')->constrained('app_trainees')->restrictOnDelete();
            $table->foreignId('trainer_id')->constrained('users')->restrictOnDelete();
            $table->string('task');
            $table->text('description')->nullable();
            $table->decimal('time_goal', 5, 2);
            $table->decimal('time_spent', 5, 2)->default(0);
            $table->date('date');
            $table->text('remarks')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->index(['batch_id', 'status']);
            $table->index(['trainee_id', 'date']);
            $table->index(['status', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_tasks');
    }
};
