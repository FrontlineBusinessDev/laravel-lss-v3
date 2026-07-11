<?php

namespace App\Rules;

use App\Models\Trainers;
use App\Models\Clients;
use App\Models\Trainees;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

/**
 * Enforces one email per identity across Clients, Trainers, and Users.
 *
 * Each module only checks its own table's email column today, so the same
 * address can end up on a client and an unrelated assignee, or collide
 * unhandled when account-linking tries to create a `users` row for an email
 * already used elsewhere. This rule checks all three tables together and
 * fails with one consistent message regardless of which table the conflict
 * is in.
 */
class UniqueEmailAcrossIdentities implements ValidationRule
{
    private const TABLES = ['app_trainees', 'app_traineers', 'users'];

    /**
     * @param  array<string,int>  $ignore  Table name => id to exclude from that table's check.
     */
    public function __construct(private readonly array $ignore = []) {}

    /**
     * Build the rule for a Trainer create/update. On update, also ignores the
     * trainer's own linked user row so keeping the same email doesn't
     * conflict with itself.
     */
    public static function forTrainer(?Trainers $trainer = null): self
    {
        if (! $trainer) {
            return new self;
        }

        $ignore = ['app_trainers' => $trainer->id];

        if ($trainer->user_id) {
            $ignore['users'] = $trainer->user_id;
        }

        return new self($ignore);
    }

    /**
     * Build the rule for an Trainee create/update. On update, also ignores
     * the trainee's own linked user row.
     */
    public static function forTrainee(?Trainees $trainee = null): self
    {
        if (! $trainee) {
            return new self;
        }

        $ignore = ['app_trainees' => $trainee->id];

        if ($trainee->user_id) {
            $ignore['users'] = $trainee->user_id;
        }

        return new self($ignore);
    }

    /**
     * Build the rule for a User create/update. On update, also ignores
     * whichever trainee/assignee currently links back to this user, so
     * editing a user linked to a trainee with the same email doesn't
     * conflict with that trainee's own record.
     */
    public static function forUser(?User $user = null): self
    {
        if (! $user) return new self;
        $ignore = ['users' => $user->id];
        /** @disregard P1013 */ // this disregard the error below but it works
        if ($trainee = Trainees::where('user_id', $user->id)->first()) {
            $ignore['app_trainees'] = $trainee->id;
        }
        /** @disregard P1013 */ // this disregard the error below but it works
        if ($assignee = Trainers::where('user_id', $user->id)->first()) {
            $ignore['app_trainers'] = $assignee->id;
        }
        return new self($ignore);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $email = strtolower(trim((string) $value));

        if ($email === '') {
            return;
        }

        foreach (self::TABLES as $table) {
            $exists = DB::table($table)
                ->whereRaw('LOWER(email) = ?', [$email])
                ->when(
                    isset($this->ignore[$table]),
                    fn($query) => $query->where('id', '!=', $this->ignore[$table]),
                )
                ->exists();

            if ($exists) {
                $fail('This email address is already in use by an existing account.');

                return;
            }
        }
    }
}
