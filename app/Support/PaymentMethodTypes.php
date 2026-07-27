<?php

namespace App\Support;

class PaymentMethodTypes
{
    public const QR_CODE = 'QR_CODE';
    public const BANK_TRANSFER = 'BANK_TRANSFER';
    public const DIRECT_LINK = 'DIRECT_LINK';
    public const E_WALLET = 'E_WALLET';

    public static function all(): array
    {
        return [self::QR_CODE, self::BANK_TRANSFER, self::DIRECT_LINK, self::E_WALLET];
    }
}
