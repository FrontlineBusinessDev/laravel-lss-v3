<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Models\AcademicIndustry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationTrainerQuestionnaire
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        $sets = $this->readActiveIndustries();
        return Inertia::render('developer/evaluation/trainer-questionnaire/index', ['sets' => $sets])->asCsr();
    }

    public function readActiveIndustries(): Collection
    {
        $query = AcademicIndustry::query()
            ->where("status", "active")->get()->values();
        return $query;
    }
}
