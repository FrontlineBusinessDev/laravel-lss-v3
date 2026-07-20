<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

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
        return Inertia::render('developer/evaluation/trainer-questionnaire/index')->asCsr();
    }
}
