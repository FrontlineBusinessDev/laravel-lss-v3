<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_leave_categories', function (Blueprint $table) {
            $table->boolean('requires_document')->default(false)->after('max_instances');
        });
    }

    public function down(): void
    {
        Schema::table('app_leave_categories', function (Blueprint $table) {
            $table->dropColumn('requires_document');
        });
    }
};
