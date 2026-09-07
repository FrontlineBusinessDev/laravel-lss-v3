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
        Schema::table('app_settings_import_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('app_settings_import_logs', 'errors')) {
                $table->json('errors')->nullable()->after('warnings');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_import_logs', function (Blueprint $table) {
            if (Schema::hasColumn('app_settings_import_logs', 'errors')) {
                $table->dropColumn('errors');
            }
        });
    }
};
