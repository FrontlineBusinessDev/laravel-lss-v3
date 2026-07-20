<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->dropColumn('completed_hours');
        });
    }

    public function down(): void
    {
        Schema::table('app_trainees', function (Blueprint $table) {
            $table->decimal('completed_hours', 5, 2)->nullable()->after('required_hours');
        });
    }
};
