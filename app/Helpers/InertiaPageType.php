<?php

namespace App\Helpers;

/**
 * Helper class to determine page rendering strategy
 */
class InertiaPageType
{
    /**
     * Public pages that should use SSR for SEO
     */
    public const PUBLIC_PAGES = [
        'welcome',
    ];

    /**
     * Check if a page should use SSR
     */
    public static function shouldUseSsr(string $component): bool
    {
        return in_array($component, self::PUBLIC_PAGES, true);
    }

    /**
     * Check if a page should use CSR
     */
    public static function shouldUseCsr(string $component): bool
    {
        return ! self::shouldUseSsr($component);
    }
}
