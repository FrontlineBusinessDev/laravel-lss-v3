<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_trainees_payments', function (Blueprint $table) {
            $table->string('official_receipt_number')->nullable()->after('reference_no');
            $table->string('receipt_path')->nullable()->after('official_receipt_number');
            $table->string('receipt_original_name')->nullable()->after('receipt_path');
            $table->string('receipt_mime_type')->nullable()->after('receipt_original_name');
            $table->unsignedBigInteger('receipt_size')->nullable()->after('receipt_mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('app_trainees_payments', function (Blueprint $table) {
            $table->dropColumn([
                'official_receipt_number',
                'receipt_path',
                'receipt_original_name',
                'receipt_mime_type',
                'receipt_size',
            ]);
        });
    }
};
