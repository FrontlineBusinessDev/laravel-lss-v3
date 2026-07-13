<?php

namespace App\Http\Controllers\v1\developer\Lss;

use App\Http\Controllers\v1\developer\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('developer/payments/index')->asCsr();
    }
}
