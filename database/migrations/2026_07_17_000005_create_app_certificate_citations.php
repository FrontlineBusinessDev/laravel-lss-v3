<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_certificate_citations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('applies_to', ['trainee', 'seminar', 'both'])->default('trainee');
            $table->text('body_text');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('critical')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'applies_to']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_certificate_citations');
    }
};
