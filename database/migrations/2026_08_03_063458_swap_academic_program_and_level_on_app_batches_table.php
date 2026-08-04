<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Batch now collects Academic Program Type instead of Academic Program /
     * Academic Level — those two move to trainee registration instead (see
     * swap_academic_program_type_and_academic_program_on_app_trainees_table).
     */
    public function up(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->dropForeign(['academic_program_id']);
            $table->dropColumn('academic_program_id');
            $table->dropForeign(['academic_level_id']);
            $table->dropColumn('academic_level_id');

            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->after('academic_industry_id')
                  ->constrained('app_settings_academic_program_type')
                  ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_program_type_id');

            $table->foreignId('academic_program_id')
                  ->after('academic_industry_id')
                  ->constrained('app_settings_academic_program')
                  ->restrictOnDelete();
            $table->foreignId('academic_level_id')
                  ->nullable()
                  ->after('academic_program_id')
                  ->constrained('app_settings_academic_level')
                  ->restrictOnDelete();
        });
    }
};
