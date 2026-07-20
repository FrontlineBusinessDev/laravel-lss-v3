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
        Schema::table('app_evaluation_seminar_questions', function (Blueprint $table) {
            $table->string('category')->nullable()->after('section');
            $table->foreignId('created_by')->nullable()->after('is_critical')
                ->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_evaluation_seminar_questions', function (Blueprint $table) {
            $table->dropColumn('category');
            $table->dropConstrainedForeignId('created_by');
        });
    }
};
