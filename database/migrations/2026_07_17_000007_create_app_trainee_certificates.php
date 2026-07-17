<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_trainee_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainee_id')->constrained('app_trainees')->cascadeOnDelete();
            $table->string('certificate_no')->unique();
            $table->foreignId('citation_id')->nullable()->constrained('app_certificate_citations')->nullOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('app_certificate_templates')->nullOnDelete();
            $table->date('issued_at')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_trainee_certificates');
    }
};
