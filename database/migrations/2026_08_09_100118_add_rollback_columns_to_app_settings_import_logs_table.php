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
            $table->json('created_ids')->nullable()->after('warnings');
            $table->timestamp('rolled_back_at')->nullable()->after('created_ids');
            $table->foreignId('rolled_back_by_id')->nullable()->after('rolled_back_at')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_import_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rolled_back_by_id');
            $table->dropColumn(['created_ids', 'rolled_back_at']);
        });
    }
};
