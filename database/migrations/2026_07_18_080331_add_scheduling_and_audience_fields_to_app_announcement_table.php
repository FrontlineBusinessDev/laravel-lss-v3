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
        Schema::table('app_announcement', function (Blueprint $table) {
            $table->timestamp('scheduled_at')->nullable()->after('audience');
            $table->timestamp('notified_at')->nullable()->after('scheduled_at');
            $table->string('audience_type')->default('all')->after('notified_at');
            // No FK constraint: adding one alongside other new columns in the same
            // blueprint forces SQLite's grammar to rebuild the table, which was
            // observed (via --pretend) to reconstruct it from only the newly
            // added columns and drop every pre-existing one. Validated at the
            // app layer instead (exists:app_batches,id in the controller).
            $table->unsignedBigInteger('audience_batch_id')->nullable()->after('audience_type');
            $table->json('audience_user_ids')->nullable()->after('audience_batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_announcement', function (Blueprint $table) {
            $table->dropColumn(['scheduled_at', 'notified_at', 'audience_type', 'audience_batch_id', 'audience_user_ids']);
        });
    }
};
