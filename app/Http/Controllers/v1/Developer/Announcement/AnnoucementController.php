<?php

namespace App\Http\Controllers\v1\Developer\Announcement;

use App\Http\Controllers\Controller;
use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\Announcement;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnoucementController extends BaseController
{
    protected string $model = Announcement::class;
    protected string $view = 'developer/announcements/index';
    protected array $searchable = ['status', 'subject', 'audience'];
    protected array $filterable = ['status', 'subject', 'audience'];
    protected array $sortable = ['status', 'subject', 'audience'];
    protected array $activeColumns = ['id', 'subject'];
    protected string $sortBy = 'subject';


    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'subject' => ['required', 'string', 'max:255', 'unique:app_announcement,subject'],
            'description' => ['nullable', 'string'],
            'audience' => ['string', Rule::in(["all trainees", "specific batch", "trainees with documents", "custome group"])],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'subject' => ['required', 'string', 'max:255', Rule::unique('app_announcement')->ignore($model->id)],
            'description' => ['nullable', 'string'],
            'audience' => ['string', Rule::in(["all trainees", "specific batch", "trainees with documents", "custome group"])],
        ];
    }
}
