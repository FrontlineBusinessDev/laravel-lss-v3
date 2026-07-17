<?php

namespace App\Http\Responses;

use App\Helpers\InertiaPageType;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;

class InertiaPageResponse
{
    /**
     * Render a page with CSR (Client-Side Rendering)
     * Use for authenticated/dashboard pages
     */
    public static function csr(string $component, array $props = [])
    {
        Config::set('inertia.ssr.enabled', false);
        return Inertia::render($component, $props);
    }
    /**
     * Render a page with SSR (Server-Side Rendering)
     * Use for public/SEO-critical pages
     */
    public static function ssr(string $component, array $props = [])
    {
        Config::set('inertia.ssr.enabled', true);
        return Inertia::render($component, $props);
    }
    /**
     * Render a page with automatic strategy based on component
     */
    public static function auto(string $component, array $props = [])
    {
        return InertiaPageType::shouldUseSsr($component)
            ? self::ssr($component, $props)
            : self::csr($component, $props);
    }
}
