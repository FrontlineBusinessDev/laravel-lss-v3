<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_trainee_certificates', function (Blueprint $table) {
            $table->enum('eligibility_status', ['eligible', 'pending', 'ineligible'])
                ->default('pending')
                ->after('trainee_id');
        });
    }

    public function down(): void
    {
        Schema::table('app_trainee_certificates', function (Blueprint $table) {
            $table->dropColumn('eligibility_status');
        });
    }
};
