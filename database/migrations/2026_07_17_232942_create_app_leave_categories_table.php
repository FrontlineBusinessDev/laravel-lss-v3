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
        Schema::create('app_leave_categories', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->string('name')->unique();
            /** Max total leave days a trainee may take per category, e.g. per year. Null = unlimited. */
            $table->unsignedInteger('max_days')->nullable();
            /** Max number of separate leave applications a trainee may submit per category. Null = unlimited. */
            $table->unsignedInteger('max_instances')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_leave_categories');
    }
};
