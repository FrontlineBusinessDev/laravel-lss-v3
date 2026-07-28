<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /** Collected at public self-registration, replacing Academic Level there. */
    public function up(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->after('school_id')
                  ->constrained('app_settings_academic_program_type')
                  ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_program_type_id');
        });
    }
};
