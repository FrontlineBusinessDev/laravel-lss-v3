<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Passwordless invitation flow: an admin can create a user with only an
     * email. That record is saved with a NULL password and is treated as
     * "awaiting setup" until the user chooses a password via the invite link
     * (or the direct-entry onboarding step). See App\Models\User::needsPasswordSetup().
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // NOTE: rows with a NULL password must be cleaned up before rolling back,
        // otherwise this ->change() will fail on the NOT NULL constraint.
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
        });
    }
};
