<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Deleting a user should unassign them from historical/audit records rather
 * than being blocked by (or cascading through) them. These 5 FKs were
 * restrictOnDelete, which would reject `DELETE FROM users ...` outright;
 * switch them to nullOnDelete like every other users.id FK in this app.
 * app_notifications.user_id and app_batch_trainer.trainer_id are
 * deliberately left as cascadeOnDelete (see UserController's in-use guard,
 * which blocks deleting a trainer still assigned to a batch).
 */
return new class extends Migration
{
    /** @var array<string, string> table => column */
    private array $columns = [
        'app_tasks' => 'trainer_id',
        'app_task_ratings' => 'evaluator_id',
        'app_task_rating_history' => 'evaluator_id',
        'app_behavioral_evaluations' => 'evaluator_id',
        'app_trainer_evaluations' => 'trainer_id',
    ];

    public function up(): void
    {
        foreach ($this->columns as $table => $column) {
            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->dropForeign([$column]);
            });

            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->unsignedBigInteger($column)->nullable()->change();
            });

            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->foreign($column)->references('id')->on('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->columns as $table => $column) {
            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->dropForeign([$column]);
            });

            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->unsignedBigInteger($column)->nullable(false)->change();
            });

            Schema::table($table, function (Blueprint $table) use ($column) {
                $table->foreign($column)->references('id')->on('users')->restrictOnDelete();
            });
        }
    }
};
