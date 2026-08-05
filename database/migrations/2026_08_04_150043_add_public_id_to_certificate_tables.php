<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Unguessable public identifier used to build the QR/verification link for an
 * issued certificate (certificate_no is sequential and must not be used as a
 * lookup token — see PublicCertificateController).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_trainee_certificates', function (Blueprint $table) {
            $table->string('public_id')->nullable()->unique()->after('certificate_no');
        });

        Schema::table('app_seminar_certificates', function (Blueprint $table) {
            $table->string('public_id')->nullable()->unique()->after('certificate_no');
        });
    }

    public function down(): void
    {
        Schema::table('app_trainee_certificates', function (Blueprint $table) {
            $table->dropColumn('public_id');
        });

        Schema::table('app_seminar_certificates', function (Blueprint $table) {
            $table->dropColumn('public_id');
        });
    }
};
