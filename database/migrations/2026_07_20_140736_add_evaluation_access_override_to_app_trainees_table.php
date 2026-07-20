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
            // Admin bypass: lets a trainee reach the trainer-evaluation
            // gateway (Milestone 4) even while required documents are
            // incomplete.
            $table->boolean('evaluation_access_override')->default(false)->after('date_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropColumn('evaluation_access_override');
        });
    }
};
