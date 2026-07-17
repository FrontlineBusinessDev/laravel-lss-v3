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
        Schema::table('app_tasks', function (Blueprint $table) {
            $table->string('priority')->nullable()->after('status'); // high | medium | low
            $table->boolean('is_running')->default(false)->after('time_spent');
            $table->timestamp('started_at')->nullable()->after('is_running');

            $table->index('priority');
            $table->index('is_running');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_tasks', function (Blueprint $table) {
            $table->dropIndex(['priority']);
            $table->dropIndex(['is_running']);
            $table->dropColumn(['priority', 'is_running', 'started_at']);
        });
    }
};
