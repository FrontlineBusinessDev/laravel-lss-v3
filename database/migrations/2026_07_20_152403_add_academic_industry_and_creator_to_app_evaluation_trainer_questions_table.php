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
        Schema::table('app_evaluation_trainer_questions', function (Blueprint $table) {
            $table->foreignId('academic_industry_id')->nullable()->after('section')
                ->constrained('app_settings_academic_industry')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->after('is_critical')
                ->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_evaluation_trainer_questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('academic_industry_id');
            $table->dropConstrainedForeignId('created_by');
        });
    }
};
