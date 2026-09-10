<?php

namespace App\Rules;

use App\Models\Trainers;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Statuses;
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
 *
 * `app_trainees` intentionally allows multiple rows per email (a trainee
 * re-enrolling under a new batch) — TraineeEnrollmentLinker::relinkChain()
 * auto-supersedes the older row's status when a newer enrollment is saved.
 * So this rule never checks `app_trainees` for a trainee's own email
 * (forTrainee()); it only checks it for a *user*'s email (forUser()), and
 * only against that email's currently active-like enrollment, so a `users`
 * row can still coexist with an archived trainee row of the same email.
 */
class UniqueEmailAcrossIdentities implements ValidationRule
{
    // 'app_traineers'
    private const TABLES = ['app_trainees', 'users'];

    private const ACTIVE_LIKE_STATUSES = [Statuses::ACTIVE, Statuses::PENDING];

    /**
     * @param  array<string,int>  $ignore  Table name => id to exclude from that table's check.
     * @param  array<int,string>  $tables  Tables to check (defaults to all).
     * @param  bool  $activeTraineesOnly  When checking `app_trainees`, only count active-like rows.
     */
    public function __construct(
        private readonly array $ignore = [],
        private readonly array $tables = self::TABLES,
        private readonly bool $activeTraineesOnly = false,
    ) {}

    /**
     * Build the rule for a Trainer create/update. On update, also ignores the
     * trainer's own linked user row so keeping the same email doesn't
     * conflict with itself.
     */
    public static function forTrainer(?Trainers $trainer = null): self
    {
        if (! $trainer) return new self;
        $ignore = ['app_trainers' => $trainer->id];
        if ($trainer->user_id) $ignore['users'] = $trainer->user_id;
        return new self($ignore);
    }

    /**
     * Build the rule for a Trainee create/update. Only guards against
     * colliding with an unrelated `users` account — a duplicate `app_trainees`
     * email is a legitimate re-enrollment, not a conflict.
     */
    public static function forTrainee(?Trainees $trainee = null): self
    {
        $ignore = [];
        if ($trainee && $trainee->user_id) $ignore['users'] = $trainee->user_id;
        return new self($ignore, ['users']);
    }

    /**
     * Build the rule for a User create/update. On update, also ignores
     * whichever trainee/assignee currently links back to this user, so
     * editing a user linked to a trainee with the same email doesn't
     * conflict with that trainee's own record.
     */
    public static function forUser(?User $user = null): self
    {
        if (! $user) return new self([], self::TABLES, true);
        $ignore = ['users' => $user->id];
        /** @disregard P1013 */ // this disregard the error below but it works
        if ($trainee = Trainees::where('user_id', $user->id)->first()) {
            $ignore['app_trainees'] = $trainee->id;
        }
        /** @disregard P1013 */ // this disregard the error below but it works
        if ($assignee = Trainers::where('user_id', $user->id)->first()) {
            $ignore['app_trainers'] = $assignee->id;
        }
        return new self($ignore, self::TABLES, true);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $email = strtolower(trim((string) $value));
        if ($email === '') return;
        foreach ($this->tables as $table) {
            $exists = DB::table($table)
                ->whereRaw('LOWER(email) = ?', [$email])
                ->when(
                    $table === 'app_trainees' && $this->activeTraineesOnly,
                    fn($query) => $query->whereIn('status', self::ACTIVE_LIKE_STATUSES),
                )
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
