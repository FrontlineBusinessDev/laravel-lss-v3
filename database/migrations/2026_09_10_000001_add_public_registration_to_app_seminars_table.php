<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mirrors the same two columns on app_batches — a seminar's public
 * registration link is generated exactly like a batch's.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_seminars', function (Blueprint $table) {
            $table->string('public_registration_url_id')->nullable()->unique()->after('registration_link');
            $table->boolean('is_public_url_enable')->default(true)->after('public_registration_url_id');
        });
    }

    public function down(): void
    {
        Schema::table('app_seminars', function (Blueprint $table) {
            $table->dropColumn(['public_registration_url_id', 'is_public_url_enable']);
        });
    }
};
