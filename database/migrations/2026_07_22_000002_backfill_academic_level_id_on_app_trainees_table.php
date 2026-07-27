<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Backfills each trainee's academic_level_id from their batch's
 * academic_level_id, before that column is dropped from app_batches in the
 * next migration. Academic Level is moving from a batch-level attribute to a
 * per-trainee one; this preserves the existing implied value for every
 * trainee registered under the old flow.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Portable subquery form (works on MySQL, SQLite, and Postgres) rather
        // than an UPDATE...JOIN, which SQLite doesn't support.
        DB::statement(<<<'SQL'
            UPDATE app_trainees
            SET academic_level_id = (
                SELECT b.academic_level_id
                FROM app_batches b
                WHERE b.id = app_trainees.batch_id
            )
            WHERE academic_level_id IS NULL
            AND EXISTS (
                SELECT 1 FROM app_batches b WHERE b.id = app_trainees.batch_id
            )
        SQL);
    }

    /**
     * Not reversible: once app_batches.academic_level_id is dropped (next
     * migration) there is no source of truth to null this back out from, and
     * even before that there's no way to distinguish a backfilled row from
     * one that was already set.
     */
    public function down(): void
    {
        //
    }
};
