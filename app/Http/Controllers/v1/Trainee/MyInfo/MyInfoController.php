<?php

namespace App\Http\Controllers\v1\Trainee\MyInfo;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyInfoController
{
    public function index(): Response
    {
        return Inertia::render('trainee/my-info/index')->asCsr();
    }
}
