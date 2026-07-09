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
        Schema::create('app_trainees_documents', function (Blueprint $table) {
            $table->id();
            $table->string('status')->default('active');
            $table->foreignId('trainee_id')->constrained('app_trainees')->restrictOnDelete();
            // OPTION A
            $table->string('document_type', 100); // resume,endorsement-letter,moa,liability-waiver,scanned-evaluations
            $table->string('original_name')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path', 500)->nullable(); // Can store local path or S3 key
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            // OPTION B
            $table->text('url_link')->nullable(); // If using external cloud links directly
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_trainees_documents');
    }
};
