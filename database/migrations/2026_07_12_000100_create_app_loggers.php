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
        Schema::create('app_loggers', function (Blueprint $table) {
            $table->id();
            // create | update | delete | archive | restore | visit
            $table->string('action', 20)->index();

            // Subject of the action. Deliberately plain columns — NOT a
            // constrained foreign key — so deleting the referenced record never
            // blocks or cascades; the audit trail must outlive the rows it
            // describes (see the logger's no-inUse-relation constraint).
            $table->string('loggable_type')->nullable();
            $table->unsignedBigInteger('loggable_id')->nullable();
            $table->string('subject_label')->nullable();

            // Actor stored as a disconnected snapshot (id + name + email), never
            // an FK — a deleted/suspended user must not erase or block their own
            // log history.
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->json('actor')->nullable();

            // Old/new diff for updates, payload snapshot for create/delete/
            // archive/restore, {url,route} for visits.
            $table->json('changes')->nullable();
            $table->string('description')->nullable();

            // Request context.
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('url')->nullable();
            $table->string('method', 10)->nullable();

            $table->timestamps();

            $table->index(['loggable_type', 'loggable_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_loggers');
    }
};
