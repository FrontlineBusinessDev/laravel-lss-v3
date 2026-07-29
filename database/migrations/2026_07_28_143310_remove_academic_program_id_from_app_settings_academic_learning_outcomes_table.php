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
        Schema::table('app_settings_academic_learning_outcomes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_program_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_academic_learning_outcomes', function (Blueprint $table) {
            $table->foreignId('academic_program_id')
                  ->nullable()
                  ->after('academic_industry_id')
                  ->constrained('app_settings_academic_program')
                  ->restrictOnDelete();
        });
    }
};
