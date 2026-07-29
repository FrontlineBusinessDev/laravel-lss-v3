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
     * Academic Level moves back onto Batch (it was dropped from here in
     * 2026_07_22_000003 in favor of collecting it per-trainee at
     * registration — that's now replaced by Academic Program Type, see
     * add_academic_program_type_id_to_app_trainees_table). Nullable since
     * existing batches predate this column.
     */
    public function up(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->foreignId('academic_level_id')
                  ->nullable()
                  ->after('academic_program_id')
                  ->constrained('app_settings_academic_level')
                  ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->dropForeign(['academic_level_id']);
            $table->dropColumn('academic_level_id');
        });
    }
};
