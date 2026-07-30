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
     * Academic Program Type is not a categorization of Academic Program —
     * it's an independent selectable field on Batch registration (see
     * migration that adds academic_program_type_id to app_batches instead).
     */
    public function up(): void
    {
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->dropForeign(['academic_program_type_id']);
            $table->dropColumn('academic_program_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->constrained('app_settings_academic_program_type')
                  ->nullOnDelete();
        });
    }
};
