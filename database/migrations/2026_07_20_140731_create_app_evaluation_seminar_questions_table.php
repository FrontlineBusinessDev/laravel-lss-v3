<?php

use App\Support\Statuses;
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
        Schema::create('app_evaluation_seminar_questions', function (Blueprint $table) {
            $table->id();
            $table->string('section');
            $table->text('question');
            $table->enum('type', ['rating', 'text'])->default('rating');
            $table->integer('order')->default(0);
            $table->boolean('is_critical')->default(false);
            $table->enum('status', [Statuses::ACTIVE, Statuses::INACTIVE])->default(Statuses::ACTIVE);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_evaluation_seminar_questions');
    }
};
