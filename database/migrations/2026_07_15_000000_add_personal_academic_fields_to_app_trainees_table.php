<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->string('landline_number', 50)->nullable()->after('mobile_number');
            $table->decimal('completed_hours', 5, 2)->nullable()->after('required_hours');
            $table->text('termination_remarks')->nullable()->after('date_completed');
        });
    }

    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropColumn(['landline_number', 'completed_hours', 'termination_remarks']);
        });
    }
};
