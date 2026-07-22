<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->foreignId('academic_level_id')
                ->nullable()
                ->after('school_id')
                ->constrained('app_settings_academic_level')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_level_id');
        });
    }
};
