<?php

namespace App\Support;

use App\Models\Role;
use App\Models\Trainees;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Trainee <-> User account linking. "Link" enables login for a trainee
 * (creating the User the first time, or reactivating one that was
 * previously unlinked); "unlink" disables login without severing the
 * historical link, so re-linking doesn't spawn a duplicate account.
 *
 * The create-on-first-link path mirrors PublicRegistrationController's
 * self-registration flow (passwordless onboarding — the trainee sets their
 * own password via the invite link), kept here so both call sites share it.
 */
class TraineeAccountLinker
{
    /**
     * Enables login for the trainee. Returns [User, bool $isNewAccount] so
     * the caller only sends an invite email when an account was just created.
     *
     * @return array{0: User, 1: bool}
     */
    public static function link(Trainees $trainee): array
    {
        if ($trainee->user_id) {
            $trainee->loadMissing('user');
            $user = $trainee->user;
            abort_if(! $user instanceof User, 500, 'Trainee is linked to a missing user account.');
            $user->update(['status' => Statuses::ACTIVE]);

            return [$user, false];
        }

        $user = self::createAndLink($trainee);
        abort_if(! $user instanceof User, 500, 'Failed to create the trainee account.');

        return [$user, true];
    }

    /**
     * Moves the shared login (user_id) onto $head, if it currently sits on a
     * different row in the same enrollment chain — so the trainee always logs
     * into their current enrollment. Raw query-builder updates (not save())
     * so this pure FK move doesn't re-trigger TraineeObserver/billing.
     *
     * @param  Collection<int, Trainees>  $chain
     */
    public static function moveToHead(Trainees $head, Collection $chain): void
    {
        $currentHolder = $chain->first(fn (Trainees $t) => $t->user_id !== null);
        if (! $currentHolder || $currentHolder->is($head)) {
            return;
        }

        Trainees::whereKey($currentHolder->id)->update(['user_id' => null]);
        Trainees::whereKey($head->id)->update(['user_id' => $currentHolder->user_id]);
    }

    /** Disables login for the trainee's linked account, if any. */
    public static function unlink(Trainees $trainee): void
    {
        $trainee->loadMissing('user');
        $trainee->user?->update(['status' => Statuses::INACTIVE]);
    }

    /**
     * Create a new trainee-role User and link it. Returns null when the
     * trainee is already linked (defensive — callers should check first).
     */
    public static function createAndLink(Trainees $trainee): ?User
    {
        if ($trainee->user_id) {
            return null;
        }

        abort_if(
            User::where('email', $trainee->email)->exists(),
            422,
            'A user account already exists with this email. Resolve the conflict before linking.',
        );

        $role = Role::where('name', 'trainee')->first();
        $user = User::create([
            'first_name' => $trainee->first_name,
            'last_name' => $trainee->last_name,
            'email' => $trainee->email,
            'status' => Statuses::ACTIVE,
            'role_id' => $role->id,
        ]);
        $user->syncRoles(['trainee']);
        $trainee->update(['user_id' => $user->id]);

        return $user;
    }
}
