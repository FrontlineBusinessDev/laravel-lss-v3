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
            if (! Schema::hasColumn('app_settings_import_logs', 'created_ids')) {
                $table->json('created_ids')->nullable()->after('warnings');
            }
            if (! Schema::hasColumn('app_settings_import_logs', 'rolled_back_at')) {
                $table->timestamp('rolled_back_at')->nullable()->after('created_ids');
            }
            if (! Schema::hasColumn('app_settings_import_logs', 'rolled_back_by_id')) {
                $table->foreignId('rolled_back_by_id')->nullable()->after('rolled_back_at')->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_import_logs', function (Blueprint $table) {
            if (Schema::hasColumn('app_settings_import_logs', 'rolled_back_by_id')) {
                $table->dropConstrainedForeignId('rolled_back_by_id');
            }

            $columns = array_values(array_filter(
                ['created_ids', 'rolled_back_at'],
                fn (string $c) => Schema::hasColumn('app_settings_import_logs', $c),
            ));
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
