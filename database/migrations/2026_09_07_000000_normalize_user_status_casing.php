<?php

use App\Models\User;
use App\Support\Statuses;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    public function up(): void
    {
        User::select('id', 'status')
            ->get()
            ->each(function (User $user) {
                $lower = strtolower($user->status);

                if ($user->status === $lower) {
                    return;
                }

                if (! in_array($lower, Statuses::all(), true)) {
                    Log::warning("Skipped normalizing users.status for user {$user->id}: unrecognized value '{$user->status}'.");

                    return;
                }

                $user->newQuery()->whereKey($user->id)->update(['status' => $lower]);
            });
    }

    public function down(): void
    {
        // Casing is not meaningful information; no reverse migration.
    }
};
