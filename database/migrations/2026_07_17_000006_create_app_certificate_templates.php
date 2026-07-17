<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `layout` stores the builder's positioned elements as JSON:
     * [{id, type: 'text'|'image'|'qr'|'line', token?, text?, x, y, width, height,
     *   fontSize?, fontWeight?, align?, color?}, ...] — all x/y/width/height are
     * percentages of the page so rendering is resolution-independent.
     */
    public function up(): void
    {
        Schema::create('app_certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->enum('certificate_type', ['trainee', 'seminar', 'citation']);
            $table->string('name');
            $table->json('layout');
            $table->enum('page_size', ['a4', 'letter'])->default('a4');
            $table->enum('orientation', ['portrait', 'landscape'])->default('landscape');
            $table->boolean('is_default')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('certificate_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_certificate_templates');
    }
};
