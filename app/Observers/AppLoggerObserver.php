<?php

namespace App\Observers;

use App\Support\ActivityLogger;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;

/**
 * Bridges Eloquent model events to the audit trail for the domain models
 * registered in ActivityLogServiceProvider. It hooks the model events (not the
 * BaseController CRUD methods) so it still fires for controllers that override
 * store()/update() — e.g. Batches and Roles.
 *
 * Status transitions are reclassified: active -> inactive is an "archive",
 * inactive -> active is a "restore"; any other change is a plain "update".
 */
class AppLoggerObserver
{
    /** Attributes never worth diffing or storing in the log. */
    private const IGNORED = ['updated_at', 'created_at', 'password', 'remember_token'];

    public function created(Model $model): void
    {
        ActivityLogger::log('create', $model, ['new' => $this->clean($model->getAttributes())]);
    }

    public function updated(Model $model): void
    {
        ActivityLogger::log($this->classifyUpdate($model), $model, $this->diff($model));
    }

    public function deleted(Model $model): void
    {
        ActivityLogger::log('delete', $model, ['old' => $this->clean($model->getAttributes())]);
    }

    /** active -> inactive = archive, inactive -> active = restore, else update. */
    private function classifyUpdate(Model $model): string
    {
        if (! array_key_exists('status', $model->getChanges())) {
            return 'update';
        }

        $before = $model->getOriginal('status');
        $after = $model->getAttribute('status');

        if ($before === Statuses::ACTIVE && $after === Statuses::INACTIVE) {
            return 'archive';
        }

        if ($before === Statuses::INACTIVE && $after === Statuses::ACTIVE) {
            return 'restore';
        }

        return 'update';
    }

    /**
     * @return array{old: array<string,mixed>, new: array<string,mixed>}
     */
    private function diff(Model $model): array
    {
        $new = $this->clean($model->getChanges());
        $old = [];
        foreach (array_keys($new) as $key) {
            $old[$key] = $model->getOriginal($key);
        }

        return ['old' => $old, 'new' => $new];
    }

    /**
     * @param  array<string,mixed>  $attributes
     * @return array<string,mixed>
     */
    private function clean(array $attributes): array
    {
        return array_diff_key($attributes, array_flip(self::IGNORED));
    }
}
