<?php

// app/Support/Statuses.php

namespace App\Support;

class Statuses
{
    public const ACTIVE = 'active';
    public const INACTIVE = 'inactive';
    public const PENDING = 'pending';
    public const TERMINATED = 'terminated';

    public static function all(): array
    {
        return [self::ACTIVE, self::INACTIVE];
    }
}
