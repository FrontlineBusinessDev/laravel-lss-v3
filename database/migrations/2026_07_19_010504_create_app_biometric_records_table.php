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
        Schema::create('app_biometric_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_id')->constrained('app_trainees')->cascadeOnDelete();
            $table->foreignId('biometric_import_id')->nullable()->constrained('app_biometric_imports')->nullOnDelete();
            $table->date('date');
            $table->time('morning_time_in')->nullable();
            $table->time('lunch_time_out')->nullable();
            $table->time('afternoon_time_in')->nullable();
            $table->time('day_time_out')->nullable();
            $table->boolean('on_leave')->default(false);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['trainee_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_biometric_records');
    }
};
