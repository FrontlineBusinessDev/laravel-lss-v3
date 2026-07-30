<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Academic Program Type is a third, independent classification on Batch
     * registration — a sibling of academic_industry_id/academic_program_id,
     * not nested under either. Nullable so existing batches aren't broken;
     * new/edited batches are required to set it (see BatchesController).
     */
    public function up(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->foreignId('academic_program_type_id')
                  ->nullable()
                  ->after('academic_program_id')
                  ->constrained('app_settings_academic_program_type')
                  ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_batches', function (Blueprint $table) {
            $table->dropForeign(['academic_program_type_id']);
            $table->dropColumn('academic_program_type_id');
        });
    }
};
