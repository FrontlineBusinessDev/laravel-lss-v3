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
        Schema::table('app_certificate_templates', function (Blueprint $table) {
            $table->string('background_color', 9)->nullable()->after('is_default');
            $table->string('border_color', 9)->nullable()->after('background_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_certificate_templates', function (Blueprint $table) {
            $table->dropColumn(['background_color', 'border_color']);
        });
    }
};
