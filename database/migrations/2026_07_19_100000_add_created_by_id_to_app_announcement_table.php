<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_announcement', function (Blueprint $table) {
            // No FK constraint, matching the audience_batch_id column added in
            // the prior migration — see that file's comment on SQLite rebuild
            // behavior. Validated at the app layer (exists:users,id) instead.
            // Null means admin/developer-authored (predates this column, or
            // created via a surface that doesn't track authorship).
            $table->unsignedBigInteger('created_by_id')->nullable()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('app_announcement', function (Blueprint $table) {
            $table->dropColumn('created_by_id');
        });
    }
};
