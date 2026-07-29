<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /** Academic Level moves back to Batch — see add_academic_level_id_to_app_batches_table. */
    public function up(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_level_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->foreignId('academic_level_id')
                  ->nullable()
                  ->after('school_id')
                  ->constrained('app_settings_academic_level')
                  ->restrictOnDelete();
        });
    }
};
