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
        Schema::table('app_trainees', function (Blueprint $table) {
            // Overrides (Null kung gagamit ng default system-calculated rate/discount)
            $table->decimal('override_rate_per_hour', 8, 2)->nullable()->after('required_hours');
            $table->decimal('override_hours_discount_percent', 5, 2)->nullable()->after('override_rate_per_hour');
            $table->decimal('override_group_discount_percent', 5, 2)->nullable()->after('override_hours_discount_percent');

            // Calculated Snapshots (Para mabilis i-query at hindi nagbabago kapag nag-iba ang settings)
            $table->decimal('applied_rate_per_hour', 8, 2)->default(0.00)->after('override_group_discount_percent');
            $table->decimal('hours_discount_percent', 5, 2)->default(0.00)->after('applied_rate_per_hour');
            $table->decimal('group_discount_percent', 5, 2)->default(0.00)->after('hours_discount_percent');

            $table->decimal('gross_amount', 10, 2)->default(0.00)->after('group_discount_percent');
            $table->decimal('total_discount_amount', 10, 2)->default(0.00)->after('gross_amount');
            $table->decimal('net_amount_required', 10, 2)->default(0.00)->after('total_discount_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropColumn('override_rate_per_hour');
            $table->dropColumn('override_hours_discount_percent');
            $table->dropColumn('override_group_discount_percent');
            $table->dropColumn('applied_rate_per_hour');
            $table->dropColumn('hours_discount_percent');
            $table->dropColumn('group_discount_percent');
            $table->dropColumn('gross_amount');
            $table->dropColumn('total_discount_amount');
            $table->dropColumn('net_amount_required');
        });
    }
};
