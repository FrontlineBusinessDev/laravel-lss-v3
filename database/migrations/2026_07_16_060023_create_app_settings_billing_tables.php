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
        Schema::create('app_settings_rates', function (Blueprint $table) {
            $table->id();
            $table->string('setup')->unique(); // f2f, online
            $table->decimal('rate_per_hour', 8, 2);
            $table->timestamps();
        });

        Schema::create('app_settings_hours_discounts', function (Blueprint $table) {
            $table->id();
            $table->decimal('min_hours', 8, 2)->unique(); // e.g., 120, 300, 350
            $table->decimal('discount_percentage', 5, 2); // e.g., 2.00 para sa 2%
            $table->timestamps();
        });

        Schema::create('app_settings_group_discounts', function (Blueprint $table) {
            $table->id();
            $table->integer('min_trainees')->unique(); // e.g., 1, 2, 3, 10
            $table->decimal('discount_percentage', 5, 2); // e.g., 2.00 para sa 2%
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings_rates');
        Schema::dropIfExists('app_settings_hours_discounts');
        Schema::dropIfExists('app_settings_group_discounts');
    }
};
