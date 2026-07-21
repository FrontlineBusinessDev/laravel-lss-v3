<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->string('provider_name');
            $table->string('type');
            $table->string('logo')->nullable();
            $table->string('qr_code')->nullable();
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('payment_link')->nullable();
            $table->text('instructions')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->index(['status', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings_payment_methods');
    }
};
