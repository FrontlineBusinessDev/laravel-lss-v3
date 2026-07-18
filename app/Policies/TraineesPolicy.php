<?php

namespace App\Policies;

use App\Models\Trainees;
use App\Models\User;
use App\Support\Permissions;
use App\Support\RequiredDocumentTypes;

/**
 * Auto-discovered policy for App\Models\Batch. Coarse module access is gated by
 * the single `manage trainees` permission (matches the trainees module policies).
 */
class TraineesPolicy
{
    /** Document types a trainee may upload/remove for their own record via /my-info. */
    private const OWN_UPLOADABLE_DOCUMENT_TYPES = RequiredDocumentTypes::TYPES;

    /** Self-service: a trainee viewing their own /my-info record. */
    public function viewOwn(User $user, Trainees $trainee): bool
    {
        return $trainee->user_id === $user->id;
    }

    /** Self-service: a trainee uploading a document for their own record, restricted to allowed types. */
    public function uploadOwnDocument(User $user, Trainees $trainee, string $documentType): bool
    {
        return $trainee->user_id === $user->id
            && in_array($documentType, self::OWN_UPLOADABLE_DOCUMENT_TYPES, true);
    }

    /** Self-service: a trainee removing a document from their own record, restricted to allowed types. */
    public function deleteOwnDocument(User $user, Trainees $trainee, string $documentType): bool
    {
        return $trainee->user_id === $user->id
            && in_array($documentType, self::OWN_UPLOADABLE_DOCUMENT_TYPES, true);
    }

    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function terminate(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function linkAccount(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function unlinkAccount(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function approve(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function decline(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }
}
