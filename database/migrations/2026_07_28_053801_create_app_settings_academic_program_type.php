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
        Schema::create('app_settings_academic_program_type', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->string('name', 155);
            $table->string('abbreviation', 50)->nullable();
            $table->timestamps();
        });
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->constrained('app_settings_academic_program_type')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_settings_academic_program', function (Blueprint $table) {
            $table->dropForeign(['academic_program_type_id']);
            $table->dropColumn('academic_program_type_id');
        });
        Schema::dropIfExists('app_settings_academic_program_type');
    }
};
