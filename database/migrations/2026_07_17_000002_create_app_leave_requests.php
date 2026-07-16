<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Minimal leave table, scoped only to what the Daily Task Sheet's
     * approved-leave check needs (force Time Spent to 0, autofill Remarks).
     * Not wired to the full /leave module.
     */
    public function up(): void
    {
        Schema::create('app_leave_requests', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('pending'); // pending | approved | declined
            $table->foreignId('trainee_id')->constrained('app_trainees')->restrictOnDelete();
            $table->foreignId('batch_id')->constrained('app_batches')->restrictOnDelete();
            $table->string('leave_type'); // Sick Leave | Vacation Leave | School-Related Leave | Bereavement Leave
            $table->date('leave_date');
            $table->date('return_date');
            $table->text('reason');
            $table->text('decision_remarks')->nullable();
            $table->timestamps();

            $table->index(['trainee_id', 'status', 'leave_date', 'return_date'], 'app_leave_requests_trainee_lookup_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_leave_requests');
    }
};
