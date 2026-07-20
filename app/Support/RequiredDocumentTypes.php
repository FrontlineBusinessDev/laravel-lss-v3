<?php

namespace App\Support;

/**
 * Document types a trainee is expected to have on file (self-uploadable via
 * /my-info, and checked by the certification-eligibility engine). Shared so
 * TraineesPolicy, MyInfoController, and DashboardController stay in sync.
 * Endorsement Letter is the only optional document and is intentionally
 * excluded here.
 */
class RequiredDocumentTypes
{
    public const TYPES = ['resume', 'moa', 'liability-waiver', 'scanned-evaluations'];
}
