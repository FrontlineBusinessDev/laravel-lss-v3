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
        Schema::create('app_settings_partner_schools', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->string('school_name');
            $table->string('abbreviation', 50)->nullable();
            // $table->string('contact_email')->nullable()->unique();
            $table->string('contact_email')->nullable();
            $table->string('contact_first_name')->nullable();
            $table->string('contact_last_name')->nullable();
            $table->string('image')->nullable();
            $table->string('physical_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_settings_partner_schools');
    }
};
