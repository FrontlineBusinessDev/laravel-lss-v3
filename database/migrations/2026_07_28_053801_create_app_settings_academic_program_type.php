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
        Schema::create('app_settings_academic_program_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 155);
            $table->string('abbreviation', 50)->nullable();
            $table->timestamps();
        });
        Schema::table('app_settings_academic_learning_outcomes', function (Blueprint $table) {
            // 1. Drop the existing foreign key and column
            $table->dropForeign(['academic_program_id']);
            $table->dropColumn('academic_program_id');
            // 2. Add the new foreign key column with constraint
            $table->foreignId('academic_program_type_id')
                  ->constrained('app_settings_academic_program_types')
                  ->restrictOnDelete();
        });
        Schema::table('app_batches', function (Blueprint $table) {
            // 1. Drop the existing foreign key and column
            $table->dropForeign(['academic_program_id']);
            $table->dropColumn('academic_program_id');
            // 2. Add the new foreign key column with constraint
            $table->foreignId('academic_program_type_id')
                  ->constrained('app_settings_academic_program_types')
                  ->restrictOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings_academic_program_types');
        Schema::table('app_settings_academic_learning_outcomes', function (Blueprint $table) {
            // Revert changes back to original state
            $table->dropForeign(['academic_program_type_id']);
            $table->dropColumn('academic_program_type_id');
            $table->foreignId('academic_program_id')
                  ->constrained('app_settings_academic_program')
                  ->restrictOnDelete();
        }); 
        Schema::table('app_batches', function (Blueprint $table) {
            // Revert changes back to original state
            $table->dropForeign(['academic_program_type_id']);
            $table->dropColumn('academic_program_type_id');
            $table->foreignId('academic_program_id')
                  ->constrained('app_settings_academic_program')
                  ->restrictOnDelete();
        }); 
    }
};
