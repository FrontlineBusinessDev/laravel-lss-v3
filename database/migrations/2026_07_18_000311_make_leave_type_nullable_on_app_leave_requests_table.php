<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * `leave_type` is superseded by `leave_category_id` (see the prior
     * migration's backfill) but kept as a legacy/display fallback column —
     * new LeaveRequestController::store() calls no longer populate it, so it
     * must stop being NOT NULL or every new submission fails the constraint.
     */
    public function up(): void
    {
        Schema::table('app_leave_requests', function (Blueprint $table) {
            $table->string('leave_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_leave_requests', function (Blueprint $table) {
            $table->string('leave_type')->nullable(false)->change();
        });
    }
};
