<?php

use App\Models\LeaveCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds `leave_category_id` alongside the existing free-text `leave_type`
     * column, then backfills it by creating a LeaveCategory row per distinct
     * `leave_type` value seen in the table. `leave_type` is kept (nullable
     * going forward is not required — existing rows are untouched) as a
     * legacy/display fallback for one release cycle; new writes should target
     * `leave_category_id` only.
     */
    public function up(): void
    {
        Schema::table('app_leave_requests', function (Blueprint $table) {
            $table->foreignId('leave_category_id')
                ->nullable()
                ->after('batch_id')
                ->constrained('app_leave_categories')
                ->restrictOnDelete();
        });

        $distinctTypes = DB::table('app_leave_requests')
            ->whereNotNull('leave_type')
            ->distinct()
            ->pluck('leave_type');

        foreach ($distinctTypes as $leaveType) {
            $category = LeaveCategory::firstOrCreate(
                ['name' => $leaveType],
                ['status' => 'active'],
            );

            DB::table('app_leave_requests')
                ->where('leave_type', $leaveType)
                ->update(['leave_category_id' => $category->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_leave_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('leave_category_id');
        });
    }
};
