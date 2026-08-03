<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Trainee registration now collects Academic Program and Academic Level
     * instead of Academic Program Type — that moves to batch creation instead
     * (see swap_academic_program_and_level_on_app_batches_table).
     */
    public function up(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_program_type_id');

            $table->foreignId('academic_program_id')
                  ->after('school_id')
                  ->constrained('app_settings_academic_program')
                  ->restrictOnDelete();
            $table->foreignId('academic_level_id')
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
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropForeign(['academic_program_id']);
            $table->dropColumn('academic_program_id');
            $table->dropForeign(['academic_level_id']);
            $table->dropColumn('academic_level_id');

            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->after('school_id')
                  ->constrained('app_settings_academic_program_type')
                  ->restrictOnDelete();
        });
    }
};
