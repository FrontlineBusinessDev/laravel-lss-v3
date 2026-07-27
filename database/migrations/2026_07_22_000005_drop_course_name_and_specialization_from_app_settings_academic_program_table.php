<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->dropColumn(['course_name', 'specialization']);
        });
    }

    public function down(): void
    {
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->string('course_name', 150)->nullable()->after('name');
            $table->text('specialization')->nullable()->after('course_name');
        });
    }
};
