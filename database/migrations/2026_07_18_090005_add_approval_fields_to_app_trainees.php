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
            $table->unsignedBigInteger('approved_by_id')->nullable()->after('user_id');
            $table->foreign('approved_by_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable()->after('approved_by_id');
            $table->text('decline_remarks')->nullable()->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropForeign(['approved_by_id']);
            $table->dropColumn(['approved_by_id', 'approved_at', 'decline_remarks']);
        });
    }
};
