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
        Schema::table('app_trainee_certificates', function (Blueprint $table) {
            // Frozen at issue()/reissue() time — the certificate keeps showing
            // whatever outcomes were achieved at that moment even if the
            // trainee's live outcomes change afterward, matching every other
            // certificate field (citation/template/hours) already being a
            // point-in-time snapshot rather than a live read.
            $table->json('learning_outcomes_snapshot')->nullable()->after('issued_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainee_certificates', function (Blueprint $table) {
            $table->dropColumn('learning_outcomes_snapshot');
        });
    }
};
