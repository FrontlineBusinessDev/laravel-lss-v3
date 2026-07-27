<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_settings_academic_level', function (Blueprint $table) {
            $table->dropColumn('year_level');
        });
    }

    public function down(): void
    {
        Schema::table('app_settings_academic_level', function (Blueprint $table) {
            // Nullable on the way back in — dropped values aren't recoverable,
            // so restoring the original NOT NULL constraint would break existing rows.
            $table->string('year_level', 150)->nullable()->after('name');
        });
    }
};
