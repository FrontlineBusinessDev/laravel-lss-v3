<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_level_id');
        });
    }

    /**
     * Restores the column structure only. Per-batch level values are not
     * restored — that data now lives on app_trainees, and a single batch can
     * span multiple trainee levels post-refactor, so there is no single
     * correct value to re-derive.
     */
    public function down(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->foreignId('academic_level_id')
                ->nullable()
                ->after('academic_industry_id')
                ->constrained('app_settings_academic_level')
                ->restrictOnDelete();
        });
    }
};
