<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Minimal seminar schema — just enough for the Seminar Certificate view to
     * be real. Seminar creation/registration CRUD is a separate, not-yet-built
     * module; this table starts empty until that module populates it.
     */
    public function up(): void
    {
        Schema::create('app_seminars', function (Blueprint $table) {
            $table->id();
            $table->string('topic');
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->string('venue')->nullable();
            $table->decimal('fee', 10, 2)->default(0);
            $table->unsignedInteger('max_participants')->nullable();
            $table->string('status')->default('active');
            $table->string('registration_link')->nullable();
            $table->boolean('is_public_url_enable');
            $table->string('seminar_code', 50)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_seminars');
    }
};
