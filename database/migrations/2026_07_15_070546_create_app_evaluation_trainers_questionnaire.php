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
        Schema::create('app_evaluation_trainers_questionnaire', function (Blueprint $table) {
            $table->id();
            $table->string('status');
            $table->string('question');
            $table->string('answer_type');
            $table->string('section')->nullable();
            $table->string('mark_as_critical')->nullable();
            $table->string('category')->nullable();
            $table->string('added_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_evaluation_trainers_questionnaire');
    }
};
