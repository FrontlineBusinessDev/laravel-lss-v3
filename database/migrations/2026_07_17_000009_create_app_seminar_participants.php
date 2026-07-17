<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_seminar_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seminar_id')->constrained('app_seminars')->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('mobile')->nullable();
            $table->string('location')->nullable();
            $table->string('profession')->nullable();
            $table->boolean('is_student')->default(false);
            $table->string('student_id')->nullable();
            $table->string('status')->default('registered');
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();

            $table->index('seminar_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_seminar_participants');
    }
};
