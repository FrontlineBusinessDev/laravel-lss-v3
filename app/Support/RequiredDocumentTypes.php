<?php

namespace App\Support;

/**
 * Document types a trainee is expected to have on file (self-uploadable via
 * /my-info, and checked by the certification-eligibility engine). Shared so
 * TraineesPolicy, MyInfoController, and DashboardController stay in sync.
 */
class RequiredDocumentTypes
{
    public const TYPES = ['endorsement-letter', 'moa', 'liability-waiver'];
}
