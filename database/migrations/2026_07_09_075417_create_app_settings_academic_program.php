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
        Schema::create('app_settings_academic_program', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->string('name', 150)->unique();
            $table->string('course_name', 150);
            $table->text('specialization')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings_academic_program');
    }
};
