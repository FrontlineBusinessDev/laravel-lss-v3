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
     * Academic Program Type moves to trainee registration instead (see
     * add_academic_program_type_id_to_app_trainees_table) — Academic Level
     * takes its place back on Batch (see add_academic_level_id_to_app_batches_table).
     */
    public function up(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->dropForeign(['academic_program_type_id']);
            $table->dropColumn('academic_program_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->constrained('app_settings_academic_program_type')
                  ->restrictOnDelete();
        });
    }
};
