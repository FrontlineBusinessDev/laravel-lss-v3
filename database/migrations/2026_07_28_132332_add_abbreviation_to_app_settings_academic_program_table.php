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
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->string('abbreviation', 50)->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->dropColumn('abbreviation');
        });
    }
};
