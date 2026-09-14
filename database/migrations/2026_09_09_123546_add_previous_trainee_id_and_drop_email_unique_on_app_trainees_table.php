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
            $table->dropUnique('app_trainees_email_unique');
            $table->index('email');
            $table->foreignId('previous_trainee_id')->nullable()->after('id')
                ->constrained('app_trainees')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('previous_trainee_id');
            $table->dropIndex('app_trainees_email_index');
            $table->unique('email');
        });
    }
};
