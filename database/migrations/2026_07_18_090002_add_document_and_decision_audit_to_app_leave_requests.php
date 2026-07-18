<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_leave_requests', function (Blueprint $table) {
            $table->string('document_path')->nullable()->after('reason');
            $table->string('document_original_name')->nullable()->after('document_path');
            $table->string('document_mime_type')->nullable()->after('document_original_name');
            $table->unsignedBigInteger('document_size')->nullable()->after('document_mime_type');
            $table->foreignId('decided_by_id')->nullable()->after('decision_remarks')->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable()->after('decided_by_id');
        });
    }

    public function down(): void
    {
        Schema::table('app_leave_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('decided_by_id');
            $table->dropColumn(['document_path', 'document_original_name', 'document_mime_type', 'document_size', 'decided_at']);
        });
    }
};
