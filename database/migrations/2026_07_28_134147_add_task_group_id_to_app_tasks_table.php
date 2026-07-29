<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Groups the fan-out rows created by one "assign to batch" submission
     * (same task/date/batch/trainer, one row per selected trainee) so the
     * Task Management list can display them as a single row instead of one
     * per trainee. Existing rows predate grouping, so each is backfilled
     * with its own id as a singleton group rather than left null — a plain
     * `GROUP BY task_group_id` would otherwise collapse every legacy row
     * into one group, since SQL treats all NULLs as equal for grouping.
     */
    public function up(): void
    {
        Schema::table('app_tasks', function (Blueprint $table) {
            $table->string('task_group_id')->nullable()->after('id');
        });

        DB::statement('UPDATE app_tasks SET task_group_id = id WHERE task_group_id IS NULL');

        Schema::table('app_tasks', function (Blueprint $table) {
            $table->index('task_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_tasks', function (Blueprint $table) {
            $table->dropIndex(['task_group_id']);
            $table->dropColumn('task_group_id');
        });
    }
};
